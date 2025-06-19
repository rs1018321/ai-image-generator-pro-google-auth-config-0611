const { Creem } = require("creem");

// 从环境变量读取配置
require('dotenv').config({ path: '.env.local' });

async function testCreemAPI() {
  console.log("Testing Creem API connection...");
  
  const creem = new Creem({
    serverURL: process.env.CREEM_SERVER_URL || "https://api.creem.io",
  });

  const apiKey = process.env.CREEM_API_KEY;
  const productId = "prod_63q4LTK5JPIrh0rMTNBCWa";

  console.log("API Key:", apiKey ? `${apiKey.substring(0, 20)}...` : "NOT SET");
  console.log("Server URL:", process.env.CREEM_SERVER_URL);
  console.log("Product ID:", productId);

  try {
    // 尝试创建一个最简单的checkout
    const result = await creem.createCheckout({
      xApiKey: apiKey,
      createCheckoutRequest: {
        productId: productId,
        units: 1,
      },
    });

    console.log("✅ Checkout created successfully!");
    console.log("Checkout ID:", result.id);
    console.log("Checkout URL:", result.checkoutUrl);
  } catch (error) {
    console.log("❌ Checkout creation failed:");
    console.log("Error:", error.message);
    if (error.statusCode) {
      console.log("Status Code:", error.statusCode);
    }
    if (error.body) {
      console.log("Response Body:", error.body);
    }
  }
}

testCreemAPI(); 