// Creem产品配置映射
// 将现有的产品ID映射到Creem的产品ID

export const CREEM_PRODUCT_MAPPING = {
  // 现有产品ID -> Creem产品ID（需要在Creem控制台创建月度订阅产品）
  "starter": "prod_63q4LTK5JPIrh0rMTNBCWa", // Starter月度订阅产品ID
  "standard": "prod_63q4LTK5JPIrh0rMTNBCWa", // TODO: 需要在Creem控制台创建Standard月度订阅产品并替换此ID
  "premium": "prod_63q4LTK5JPIrh0rMTNBCWa", // TODO: 需要在Creem控制台创建Premium月度订阅产品并替换此ID
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
    price: 1400, // 以分为单位，$14.00
    currency: "USD",
    billingType: "recurring", // 月度订阅
    interval: "month",
    credits_monthly: 50,
    features: [
      "每月50个积分",
      "高质量AI生成",
      "基础涂色页模板",
      "PNG格式下载",
      "邮件支持"
    ]
  },
  {
    name: "AI涂色页生成器 标准版",
    description: "适合教师和家长，更多创意选择",
    price: 2800, // 以分为单位，$28.00
    currency: "USD",
    billingType: "recurring", // 月度订阅
    interval: "month",
    credits_monthly: 200,
    features: [
      "每月200个积分",
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
    price: 5600, // 以分为单位，$56.00
    currency: "USD",
    billingType: "recurring", // 月度订阅
    interval: "month",
    credits_monthly: 500,
    features: [
      "每月500个积分",
      "顶级AI生成引擎",
      "所有艺术风格",
      "高分辨率输出",
      "API访问权限",
      "专属客服支持",
      "商业使用许可"
    ]
  }
]; 