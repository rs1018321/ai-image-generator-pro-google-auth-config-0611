// 手动激活订阅脚本
// 用于处理支付成功但Webhook未收到的情况

const { createClient } = require('@supabase/supabase-js');
const moment = require('moment');

// 从环境变量获取配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('请确保设置了 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 订阅计划配置
const SUBSCRIPTION_PLANS = {
  'starter': {
    plan_name: 'Starter',
    credits_monthly: 100,
    credits_to_add: 100
  },
  'standard': {
    plan_name: 'Standard', 
    credits_monthly: 500,
    credits_to_add: 500
  },
  'premium': {
    plan_name: 'Premium',
    credits_monthly: 1000,
    credits_to_add: 1000
  }
};

async function manualActivateSubscription(userEmail, planType = 'starter') {
  try {
    console.log(`开始为用户 ${userEmail} 激活 ${planType} 订阅...`);

    // 1. 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('uuid, email')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.error('未找到用户:', userError?.message || '用户不存在');
      return false;
    }

    console.log('找到用户:', user.uuid);

    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) {
      console.error('无效的订阅计划类型:', planType);
      return false;
    }

    // 2. 创建订阅记录
    const subscriptionId = `sub_manual_${Date.now()}`;
    const now = new Date();
    const nextMonth = moment().add(1, 'month').toDate();

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        id: subscriptionId,
        user_uuid: user.uuid,
        product_id: planType,
        plan_name: plan.plan_name,
        status: 'active',
        credits_monthly: plan.credits_monthly,
        creem_subscription_id: `creem_manual_${Date.now()}`,
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
        cancel_at_period_end: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .select()
      .single();

    if (subError) {
      console.error('创建订阅记录失败:', subError.message);
      return false;
    }

    console.log('订阅记录创建成功:', subscription.id);

    // 3. 添加积分
    const { data: credit, error: creditError } = await supabase
      .from('credits')
      .insert({
        user_uuid: user.uuid,
        credits: plan.credits_to_add,
        reason: `${plan.plan_name} 订阅激活`,
        created_at: now.toISOString()
      })
      .select()
      .single();

    if (creditError) {
      console.error('添加积分失败:', creditError.message);
      return false;
    }

    console.log(`积分添加成功: +${plan.credits_to_add} 积分`);

    // 4. 显示结果
    console.log('\n✅ 订阅激活成功！');
    console.log('订阅详情:');
    console.log(`- 用户: ${user.email}`);
    console.log(`- 计划: ${plan.plan_name}`);
    console.log(`- 每月积分: ${plan.credits_monthly}`);
    console.log(`- 到期时间: ${moment(nextMonth).format('YYYY-MM-DD HH:mm:ss')}`);
    console.log(`- 已添加积分: ${plan.credits_to_add}`);

    return true;

  } catch (error) {
    console.error('激活订阅时发生错误:', error);
    return false;
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('使用方法:');
  console.log('node scripts/manual-activate-subscription.js <用户邮箱> [订阅类型]');
  console.log('');
  console.log('订阅类型选项:');
  console.log('- starter (默认): 100积分/月');
  console.log('- standard: 500积分/月');
  console.log('- premium: 1000积分/月');
  console.log('');
  console.log('示例:');
  console.log('node scripts/manual-activate-subscription.js user@example.com starter');
  process.exit(1);
}

const userEmail = args[0];
const planType = args[1] || 'starter';

// 执行激活
manualActivateSubscription(userEmail, planType)
  .then((success) => {
    if (success) {
      console.log('\n🎉 订阅激活完成！请刷新页面查看更新后的会员状态。');
    } else {
      console.log('\n❌ 订阅激活失败，请检查上述错误信息。');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }); 