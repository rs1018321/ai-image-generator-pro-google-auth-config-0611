import { Creem } from "creem";

// 初始化Creem实例
export const creem = new Creem({
  serverURL: process.env.CREEM_API_URL || "https://test-api.creem.io",
});

// Creem API配置
export const CREEM_CONFIG = {
  apiKey: process.env.CREEM_API_KEY || "",
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET || "",
  environment: process.env.NODE_ENV === "production" ? "live" : "test",
};

// 验证Creem配置
export function validateCreemConfig() {
  if (!CREEM_CONFIG.apiKey) {
    throw new Error("CREEM_API_KEY is required");
  }
  
  if (!CREEM_CONFIG.webhookSecret) {
    console.warn("CREEM_WEBHOOK_SECRET is not set - webhooks will not work");
  }
  
  return true;
}

// 创建Checkout会话的辅助函数
export async function createCreemCheckout({
  productId,
  units = 1,
  customerId,
  customerEmail,
  discountCode,
  metadata,
  successUrl,
  cancelUrl,
}: {
  productId: string;
  units?: number;
  customerId?: string;
  customerEmail?: string;
  discountCode?: string;
  metadata?: Record<string, any>;
  successUrl?: string;
  cancelUrl?: string;
}) {
  validateCreemConfig();

  try {
    // 构建请求参数
    const createCheckoutRequest: any = {
      productId,
      units,
    };

    // 只有在有值时才添加可选参数
    if (customerId || customerEmail) {
      createCheckoutRequest.customer = {};
      // 优先使用customerEmail，如果没有则使用customerId
      if (customerEmail) {
        createCheckoutRequest.customer.email = customerEmail;
      } else if (customerId) {
        createCheckoutRequest.customer.id = customerId;
      }
    }

    if (discountCode) {
      createCheckoutRequest.discountCode = discountCode;
    }

    if (metadata && Object.keys(metadata).length > 0) {
      createCheckoutRequest.metadata = {
        ...metadata,
        environment: CREEM_CONFIG.environment,
      };
    }

    // Creem API 需要顶层 successUrl / cancelUrl 字段实现自动跳转
    if (successUrl) {
      createCheckoutRequest.successUrl = successUrl;
    }
    if (cancelUrl) {
      createCheckoutRequest.cancelUrl = cancelUrl;
    }

    // 仍然把 URL 写入 metadata 便于 webhook 调试排查
    if (successUrl || cancelUrl) {
      createCheckoutRequest.metadata = {
        ...createCheckoutRequest.metadata,
        successUrl,
        cancelUrl,
      };
    }

    console.log("Creating Creem checkout with params:", {
      productId,
      units,
      customerId,
      customerEmail,
      hasMetadata: !!metadata,
    });

    const result = await creem.createCheckout({
      xApiKey: CREEM_CONFIG.apiKey,
      createCheckoutRequest,
    });

    console.log("Creem checkout created successfully:", result?.id);
    return result;
  } catch (error) {
    console.error("Failed to create Creem checkout:", error);
    throw error;
  }
}

// 获取Checkout会话信息
export async function retrieveCreemCheckout(checkoutId: string) {
  validateCreemConfig();

  try {
    const result = await creem.retrieveCheckout({
      checkoutId,
      xApiKey: CREEM_CONFIG.apiKey,
    });

    return result;
  } catch (error) {
    console.error("Failed to retrieve Creem checkout:", error);
    throw error;
  }
} 