// Creem产品配置映射
// 将现有的产品ID映射到Creem的产品ID

export const CREEM_PRODUCT_MAPPING = {
  // 现有产品ID -> Creem产品ID
  "starter": "prod_63q4LTK5JPIrh0rMTNBCWa", // Starter套餐产品ID
  "standard": "prod_63q4LTK5JPIrh0rMTNBCWa", // TODO: 需要在Creem控制台创建Standard产品并替换此ID
  "premium": "prod_63q4LTK5JPIrh0rMTNBCWa", // TODO: 需要在Creem控制台创建Premium产品并替换此ID
};

// 获取Creem产品ID
export function getCreemProductId(originalProductId: string): string {
  return CREEM_PRODUCT_MAPPING[originalProductId as keyof typeof CREEM_PRODUCT_MAPPING] || originalProductId;
}

// Creem产品创建配置（用于在Creem平台创建产品时参考）
export const CREEM_PRODUCTS_CONFIG = [
  {
    name: "Coloring Page Boilerplate Starter",
    description: "Get started with your first SaaS startup.",
    price: 9900, // 以分为单位
    currency: "USD",
    billingType: "one-time",
    features: [
      "100 credits, valid for 1 month",
      "NextJS boilerplate",
      "SEO-friendly structure",
      "Payment with Creem",
      "Data storage with Supabase",
      "Google OAuth & One-Tap Login",
      "i18n support"
    ]
  },
  {
    name: "Coloring Page Boilerplate Standard",
    description: "Ship Fast with your SaaS Startups.",
    price: 19900,
    currency: "USD",
    billingType: "one-time",
    features: [
      "200 credits, valid for 3 months",
      "Deploy with Vercel or Cloudflare",
      "Generation of Privacy & Terms",
      "Google Analytics Integration",
      "Google Search Console Integration",
      "Discord community",
      "Technical support for your first ship",
      "Lifetime updates"
    ]
  },
  {
    name: "Coloring Page Boilerplate Premium",
    description: "Ship Any AI SaaS Startups.",
    price: 29900,
    currency: "USD",
    billingType: "one-time",
    features: [
      "300 credits, valid for 1 year",
      "Business Functions with AI",
      "User Center",
      "Credits System",
      "API Sales for your SaaS",
      "Admin System",
      "Priority Technical Support"
    ]
  }
]; 