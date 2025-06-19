import { Creem } from "creem";

// 配置
const serverURL = "https://test-api.creem.io";
const apiKey = "creem_test_nkvomHNpqIBogPxBanEgQ";
const productId = "prod_63q4LTK5JPIrh0rMTNBCWa";

console.log("API Key:", apiKey);
console.log("Server URL:", serverURL);
console.log("Product ID:", productId);

// 初始化Creem客户端
const creem = new Creem({
  serverURL: serverURL,
});

async function testCreemAPI() {
  try {
    console.log("\n=== Testing Creem API Connection ===");
    
    const result = await creem.createCheckout({
      xApiKey: apiKey,
      createCheckoutRequest: {
        productId: productId,
        units: 1,
        metadata: {
          test: "true",
          orderNo: "test-order-" + Date.now(),
        },
      },
    });

    console.log("✅ Checkout created successfully!");
    console.log("Checkout ID:", result?.id);
    console.log("Checkout URL:", result?.checkoutUrl);
    console.log("Full response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error creating checkout:");
    console.error("Error message:", error.message);
    console.error("Error status:", error.status);
    console.error("Error code:", error.code);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      console.error("Response data:", error.response.data);
    }
    
    if (error.body) {
      console.error("Raw response body:", error.body);
    }
  }
}

testCreemAPI(); 