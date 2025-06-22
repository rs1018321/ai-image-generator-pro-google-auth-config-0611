import { getSupabaseClient } from "./db";

export interface Subscription {
  id?: string;
  user_uuid: string;
  product_id: string; // starter, standard, premium
  plan_name: string;
  status: string; // active, canceled, expired, pending
  credits_monthly: number; // 每月积分数量
  creem_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
}

// 插入新订阅
export async function createSubscription(subscription: {
  user_uuid: string;
  product_id: string;
  plan_name: string;
  status: string;
  credits_monthly: number;
  creem_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
}) {
  const supabase = getSupabaseClient();
  const id = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      id,
      ...subscription,
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 获取用户当前订阅
export async function getUserSubscription(user_uuid: string): Promise<Subscription | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_uuid", user_uuid)
    .in("status", ["active", "canceled"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error("getUserSubscription error:", error.message || error);
  }
  return data || null;
}

// 更新订阅状态
export async function updateSubscriptionStatus(
  creem_subscription_id: string,
  updates: {
    status?: string;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    canceled_at?: string;
  }
) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("creem_subscription_id", creem_subscription_id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 取消订阅（设置在期间结束时取消）
export async function cancelSubscription(user_uuid: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_uuid", user_uuid)
    .eq("status", "active")
    .eq("cancel_at_period_end", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 获取用户会员等级
export function getUserMembershipLevel(subscription: Subscription | null): string {
  if (!subscription || subscription.status !== 'active') {
    return 'non-member';
  }
  
  switch (subscription.product_id) {
    case 'starter':
      return 'starter';
    case 'standard':
      return 'standard';
    case 'premium':
      return 'premium';
    default:
      return 'non-member';
  }
}

// 检查订阅是否有效
export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  
  const now = new Date();
  const endDate = new Date(subscription.current_period_end || '');
  
  return subscription.status === 'active' && endDate > now;
}

// 获取所有用户订阅（用于管理员）
export async function getAllSubscriptions(limit = 100, offset = 0): Promise<Subscription[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error || !data) {
    return [];
  }
  
  return data;
}

// 根据Creem订阅ID查找订阅
export async function getSubscriptionByCreemId(creem_subscription_id: string): Promise<Subscription | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("creem_subscription_id", creem_subscription_id)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

// 根据用户ID获取活跃订阅
export async function getActiveSubscriptionByUserId(user_uuid: string): Promise<Subscription | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_uuid", user_uuid)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error("getActiveSubscriptionByUserId error:", error.message || error);
  }

  if (!data) return null;

  // 检查订阅是否过期
  const now = new Date();
  const endDate = new Date(data.current_period_end || "");
  if (endDate <= now) {
    await updateSubscriptionStatus(data.creem_subscription_id || "", {
      status: "expired",
    });
    return null;
  }

  return data;
} 