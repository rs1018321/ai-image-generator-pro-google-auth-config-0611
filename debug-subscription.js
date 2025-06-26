// 调试用户订阅状态
// 使用方法: node debug-subscription.js <user_email>

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载.env.local文件
dotenv.config({ path: '.env.local' });

async function checkUserSubscription(userEmail) {
  if (!userEmail) {
    console.log('Usage: node debug-subscription.js <user_email>');
    process.exit(1);
  }

  console.log('环境变量检查:');
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '已设置' : '未设置');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
  console.log('---');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('正在检查用户订阅状态...');
    console.log('用户邮箱:', userEmail);
    console.log('---');

    // 1. 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.log('❌ 用户不存在:', userError?.message || '未找到用户');
      return;
    }

    console.log('✅ 找到用户:');
    console.log('- UUID:', user.uuid);
    console.log('- 邮箱:', user.email);
    console.log('- 创建时间:', user.created_at);
    console.log('---');

    // 2. 查找所有订阅记录
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_uuid', user.uuid)
      .order('created_at', { ascending: false });

    if (subError) {
      console.log('❌ 查询订阅失败:', subError.message);
      return;
    }

    console.log('📊 订阅记录:');
    if (!subscriptions || subscriptions.length === 0) {
      console.log('❌ 没有找到订阅记录');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`${index + 1}. 订阅ID: ${sub.id}`);
        console.log(`   产品ID: ${sub.product_id}`);
        console.log(`   计划名称: ${sub.plan_name}`);
        console.log(`   状态: ${sub.status}`);
        console.log(`   每月积分: ${sub.credits_monthly}`);
        console.log(`   Creem订阅ID: ${sub.creem_subscription_id || '无'}`);
        console.log(`   当前周期开始: ${sub.current_period_start || '无'}`);
        console.log(`   当前周期结束: ${sub.current_period_end || '无'}`);
        console.log(`   取消标志: ${sub.cancel_at_period_end ? '是' : '否'}`);
        console.log(`   创建时间: ${sub.created_at}`);
        console.log('   ---');
      });
    }

    // 3. 查找积分记录 - 重点查看订阅支付类型
    const { data: credits, error: creditError } = await supabase
      .from('credits')
      .select('*')
      .eq('user_uuid', user.uuid)
      .order('created_at', { ascending: false })
      .limit(50); // 增加到50条记录

    console.log('💰 最近50条积分记录:');
    if (creditError) {
      console.log('❌ 查询积分失败:', creditError.message);
    } else if (!credits || credits.length === 0) {
      console.log('❌ 没有找到积分记录');
    } else {
      // 分类显示积分记录
      const subscriptionCredits = credits.filter(c => c.trans_type === 'subscription_payment');
      const otherCredits = credits.filter(c => c.trans_type !== 'subscription_payment');
      
      console.log(`📈 订阅支付积分记录 (${subscriptionCredits.length}条):`);
      if (subscriptionCredits.length === 0) {
        console.log('❌ 没有找到订阅支付积分记录 - 这可能是问题所在！');
      } else {
        subscriptionCredits.forEach((credit, index) => {
          console.log(`${index + 1}. 交易号: ${credit.trans_no}`);
          console.log(`   交易类型: ${credit.trans_type}`);
          console.log(`   积分: ${credit.credits}`);
          console.log(`   订单号: ${credit.order_no || '无'}`);
          console.log(`   过期时间: ${credit.expired_at || '无'}`);
          console.log(`   创建时间: ${credit.created_at}`);
          console.log('   ---');
        });
      }

      console.log(`🔄 其他积分记录 (最新10条):`);
      otherCredits.slice(0, 10).forEach((credit, index) => {
        console.log(`${index + 1}. 交易号: ${credit.trans_no}`);
        console.log(`   交易类型: ${credit.trans_type}`);
        console.log(`   积分: ${credit.credits}`);
        console.log(`   订单号: ${credit.order_no || '无'}`);
        console.log(`   过期时间: ${credit.expired_at || '无'}`);
        console.log(`   创建时间: ${credit.created_at}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 从命令行参数获取用户邮箱
const userEmail = process.argv[2];
checkUserSubscription(userEmail); 