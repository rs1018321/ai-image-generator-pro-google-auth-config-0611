import { Credit } from "@/types/credit";
import { getSupabaseClient } from "@/models/db";

export async function insertCredit(credit: Credit) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("credits").insert(credit);

  if (error) {
    throw error;
  }

  return data;
}

export async function findCreditByTransNo(
  trans_no: string
): Promise<Credit | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("trans_no", trans_no)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findCreditByOrderNo(
  order_no: string
): Promise<Credit | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("order_no", order_no)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUserValidCredits(
  user_uuid: string
): Promise<Credit[] | undefined> {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("user_uuid", user_uuid)
    .gte("expired_at", now)
    .order("expired_at", { ascending: true });

  if (error) {
    return undefined;
  }

  return data;
}

export async function getCreditsByUserUuid(
  user_uuid: string,
  page: number = 1,
  limit: number = 50
): Promise<(Credit & { balance?: number })[] | undefined> {
  const supabase = getSupabaseClient();
  
  // 首先获取所有积分记录（按时间正序，用于计算余额）
  const { data: allCredits, error: allError } = await supabase
    .from("credits")
    .select("*")
    .eq("user_uuid", user_uuid)
    .order("created_at", { ascending: true });

  if (allError) {
    return undefined;
  }

  // 计算每条记录后的累计余额
  let runningBalance = 0;
  const creditsWithBalance = allCredits?.map((credit: Credit) => {
    runningBalance += credit.credits;
    return {
      ...credit,
      balance: Math.max(0, runningBalance) // 确保余额不为负数
    };
  }) || [];

  // 按创建时间倒序排列（最新的在前面）
  creditsWithBalance.reverse();

  // 应用分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCredits = creditsWithBalance.slice(startIndex, endIndex);

  return paginatedCredits;
}
