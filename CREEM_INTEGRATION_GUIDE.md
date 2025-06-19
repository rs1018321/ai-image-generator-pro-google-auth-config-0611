# Creem支付系统集成指南

## 概述

本指南详细说明了如何在Next.js应用中集成Creem支付系统，替代或补充现有的Stripe支付系统。

## 已完成的集成步骤

### 1. 安装Creem SDK
```bash
npm install creem --legacy-peer-deps
```

### 2. 创建Creem配置文件
- 文件：`lib/creem.ts`
- 功能：初始化Creem客户端，创建和获取checkout会话

### 3. 创建Creem Checkout API路由
- 文件：`app/api/creem-checkout/route.ts`
- 功能：处理Creem支付请求，创建订单和checkout会话

### 4. 创建Creem Webhook处理器
- 文件：`app/api/creem-webhook/route.ts`
- 功能：处理Creem的webhook事件，包括支付成功、失败等

### 5. 创建Creem订单处理服务
- 文件：`services/creem-order.ts`
- 功能：处理Creem订单会话，更新订单状态和用户积分

### 6. 更新定价组件
- 文件：`components/blocks/pricing/index.tsx`
- 功能：集成Creem支付流程，替代Stripe支付

### 7. 创建Creem支付成功页面
- 文件：`app/[locale]/creem-success/[checkout_id]/page.tsx`
- 功能：处理支付成功后的页面跳转和订单处理

### 8. 添加环境变量配置
- 文件：`.env.local`
- 配置：Creem API密钥、Webhook密钥和服务器URL

### 9. 更新数据库模型
- 文件：`models/order.ts`
- 功能：支持Creem checkout_id，保持与Stripe的兼容性

### 10. 创建Creem产品配置
- 文件：`lib/creem-products.ts`
- 功能：映射产品ID和配置产品详情

## 环境变量配置

在`.env.local`文件中添加以下配置：

```env
# Creem Payment Configuration (测试环境)
CREEM_API_KEY=your_creem_api_key_here
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret_here
CREEM_SERVER_URL=https://test.api.creem.io

# 生产环境时改为：
# CREEM_SERVER_URL=https://api.creem.io
```

## 产品配置

在`lib/creem-products.ts`中配置产品映射：

```typescript
export const CREEM_PRODUCT_MAPPING = {
  starter: "creem_starter_product_id",
  standard: "creem_standard_product_id", 
  premium: "creem_premium_product_id",
};
```

## 使用方法

### 1. 前端支付流程
用户在定价页面选择套餐后，点击购买按钮会调用`handleCreemCheckout`函数，该函数会：
- 验证用户登录状态
- 调用`/api/creem-checkout`创建支付会话
- 跳转到Creem支付页面

### 2. 支付成功处理
支付成功后，用户会被重定向到`/creem-success/[checkout_id]`页面，该页面会：
- 获取checkout会话信息
- 处理订单状态更新
- 更新用户积分
- 重定向到成功或失败页面

### 3. Webhook处理
Creem会向`/api/creem-webhook`发送webhook事件，处理器会：
- 验证webhook签名
- 处理不同类型的事件
- 更新订单状态和用户积分

## 测试流程

### 1. 本地测试
1. 启动开发服务器：`npm run dev`
2. 访问定价页面：`http://localhost:3000/pricing`
3. 选择套餐并点击购买按钮
4. 验证是否正确跳转到Creem支付页面

### 2. Webhook测试
使用ngrok或类似工具暴露本地服务器，然后在Creem控制台配置webhook URL：
```
http://localhost:3000/api/creem-webhook
```

## 注意事项

1. **环境变量**：所有环境变量都统一配置在`.env.local`文件中
2. **测试环境**：使用`https://test.api.creem.io`作为测试服务器URL
3. **产品ID映射**：在`lib/creem-products.ts`中正确配置产品ID映射
4. **数据库兼容性**：现有的Stripe订单数据不会受到影响
5. **错误处理**：所有API路由都包含完整的错误处理和日志记录
6. **类型安全**：使用TypeScript确保类型安全

## 下一步

1. 在Creem控制台创建产品并获取产品ID
2. 更新`lib/creem-products.ts`中的产品ID映射
3. 配置正确的环境变量
4. 测试支付流程
5. 部署到生产环境

## 支持

如果在集成过程中遇到问题，请参考：
- Creem官方文档
- 项目中的现有Stripe集成代码
- 相关的错误日志和调试信息 