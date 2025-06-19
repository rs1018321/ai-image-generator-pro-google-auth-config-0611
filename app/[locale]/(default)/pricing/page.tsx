import { getLandingPage } from "@/services/page";
import Pricing from "@/components/blocks/pricing";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'zh' ? '定价 - AI 填色页生成器' : 'Pricing - AI Coloring Page Generator';
  const description = locale === 'zh' 
    ? '选择适合您的套餐，解锁高级填色页生成功能。包含100-300积分，支持批量处理和高分辨率输出。'
    : 'Choose the perfect plan for your coloring book creation needs. Includes 100-300 credits with batch processing and high-resolution output.';

  return {
    title,
    description,
    keywords: locale === 'zh' 
      ? '填色页,定价,AI生成,儿童活动,创意工具'
      : 'coloring pages, pricing, AI generation, kids activities, creative tools',
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);

  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen">
      {/* 页面标题区域 */}
      <div className="py-16 text-center">
        <h1 style={{
          fontFamily: "dk_cool_crayonregular",
          fontSize: "60px",
          color: "#786312",
          margin: "0 0 20px 0"
        }}>
          {isZh ? '选择您的套餐' : 'Choose Your Plan'}
        </h1>
        <p style={{
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
          fontSize: "24px",
          color: "#666",
          maxWidth: "800px",
          margin: "0 auto",
          lineHeight: "1.5"
        }}>
          {isZh 
            ? '选择最适合您填色书创作需求的完美套餐。所有套餐都包含无限下载和高级功能。'
            : 'Select the perfect plan for your coloring book creation needs. All plans include unlimited downloads and premium features.'
          }
        </p>
      </div>

      {/* Pricing组件 */}
      {page.pricing && <Pricing pricing={page.pricing} />}
      
      {/* 额外的说明区域 */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 style={{
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
            fontSize: "36px",
            color: "#69b08b",
            marginBottom: "30px"
          }}>
            {isZh ? '为什么选择我们的服务？' : 'Why Choose Our Service?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div style={{
                fontSize: "48px",
                marginBottom: "15px"
              }}>🎨</div>
              <h3 style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "24px",
                color: "#786312",
                marginBottom: "10px"
              }}>
                {isZh ? '高品质' : 'High Quality'}
              </h3>
              <p style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "16px",
                color: "#666",
                lineHeight: "1.4"
              }}>
                {isZh 
                  ? '专业级填色页，线条清晰，图案精美详细'
                  : 'Professional-grade coloring pages with crisp lines and detailed artwork'
                }
              </p>
            </div>
            <div className="p-6">
              <div style={{
                fontSize: "48px",
                marginBottom: "15px"
              }}>⚡</div>
              <h3 style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "24px",
                color: "#786312",
                marginBottom: "10px"
              }}>
                {isZh ? '快速生成' : 'Fast Generation'}
              </h3>
              <p style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "16px",
                color: "#666",
                lineHeight: "1.4"
              }}>
                {isZh 
                  ? '使用我们的AI技术，几秒钟内生成精美的填色页'
                  : 'Generate beautiful coloring pages in seconds with our AI technology'
                }
              </p>
            </div>
            <div className="p-6">
              <div style={{
                fontSize: "48px",
                marginBottom: "15px"
              }}>📱</div>
              <h3 style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "24px",
                color: "#786312",
                marginBottom: "10px"
              }}>
                {isZh ? '易于使用' : 'Easy to Use'}
              </h3>
              <p style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "16px",
                color: "#666",
                lineHeight: "1.4"
              }}>
                {isZh 
                  ? '简单的界面，非常适合家长、老师和孩子使用'
                  : 'Simple interface perfect for parents, teachers, and kids'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 