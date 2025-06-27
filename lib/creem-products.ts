// Creem产品配置映射
// 将现有的产品ID映射到Creem的产品ID

export const CREEM_PRODUCT_MAPPING = {
  // 现有产品ID -> Creem生产环境产品ID
  "starter": "prod_1S0nB5G2p83JuARibtXa1A", // 入门版月度订阅产品ID (100积分/月)
  "standard": "prod_1VWwRwxQZUn9wY9sml9NzS", // 标准版月度订阅产品ID (500积分/月)
  "premium": "prod_6I1ETNuN7xqxMgR2OXqmNZ", // 高级版月度订阅产品ID (1000积分/月)
};

// 获取Creem产品ID
export function getCreemProductId(originalProductId: string): string {
  return CREEM_PRODUCT_MAPPING[originalProductId as keyof typeof CREEM_PRODUCT_MAPPING] || originalProductId;
}

// Creem产品创建配置（用于在Creem平台创建月度订阅产品时参考）
export const CREEM_PRODUCTS_CONFIG = [
  {
    name: "AI涂色页生成器 入门版",
    description: "适合个人用户开始体验AI涂色页生成",
    price: 990, // 以分为单位，$9.90
    currency: "USD",
    billingType: "recurring", // 月度订阅
    interval: "month",
    credits_monthly: 100,
    features: [
      "每月100个积分",
      "高质量AI生成",
      "基础涂色页模板",
      "PNG格式下载",
      "邮件支持"
    ]
  },
  {
    name: "AI涂色页生成器 标准版",
    description: "适合教师和家长，更多创意选择",
    price: 2990, // 以分为单位，$29.90
    currency: "USD",
    billingType: "recurring", // 月度订阅
    interval: "month",
    credits_monthly: 500,
    features: [
      "每月500个积分",
      "高级AI生成算法",
      "多种艺术风格",
      "PDF + PNG格式",
      "优先邮件支持",
      "批量生成功能"
    ]
  },
  {
    name: "AI涂色页生成器 高级版",
    description: "适合教育机构和专业用户",
    price: 4990, // 以分为单位，$49.90
    currency: "USD",
    billingType: "recurring", // 月度订阅
    interval: "month",
    credits_monthly: 1000,
    features: [
      "每月1000个积分",
      "顶级AI生成引擎",
      "所有艺术风格",
      "高分辨率输出",
      "API访问权限",
      "专属客服支持",
      "商业使用许可"
    ]
  }
]; 