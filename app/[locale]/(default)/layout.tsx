import React, { ReactNode } from 'react';
import Footer from "@/components/blocks/footer";
import Header from "./header";
import { getLandingPage } from "@/services/page";


// 定义背景样式
const backgroundStyle = {
    backgroundColor: "#f5f3e8", // 添加回退背景色，米黄色
    backgroundImage: "url('/imgs/custom/bg-image.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed", // 可选：固定背景
    minHeight: "100vh",
    width: "100%",
    // 防止过度滚动
    overscrollBehavior: "none" as const,
    position: "relative" as const,
};

export default async function DefaultLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);

  return (
    <div style={backgroundStyle}>
      {/* 顶部导航栏容器 */}
      {page.header && <Header  locale={locale} />}


      <main className="overflow-x-hidden">{children}</main>

      {page.footer && <Footer footer={page.footer} />}
      {/* <Feedback socialLinks={page.footer?.social?.items} /> */}
    </div>
  );
}
