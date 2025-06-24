import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { Globe, Moon, Sun } from 'lucide-react'; // 假设使用 lucide-react 图标
import Footer from "@/components/blocks/footer";
import Header from "./header";
import { getLandingPage } from "@/services/page";
import Feedback from "@/components/feedback";
import HeaderSignButton from "@/components/sign/header-sign-button";
import Link from "next/link";
import styles from './page.module.css';
import DashboardButton from "@/components/navigation/dashboard-button";

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
      <header className="flex items-center justify-between px-6 py-4 relative">
        {/* Logo 区域 - 绝对定位 */}
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center">
          <img
            src="/imgs/logo.png"
            alt="Coloring Logo"
            className="h-12 w-auto mr-2"
          />
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <h1 style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#64c19f'
            }} className="font-bold text-5xl">Coloring Page</h1>
          </Link>
        </div>

        {/* 左侧区域：导航菜单项 - 调整位置与Logo对齐 */}
        <div className="flex items-center" style={{
          marginLeft: '450px',
          transform: 'translateY(7px)'
        }}>
          {/* 导航菜单项（桌面端显示） */}
          <nav className="hidden md:flex space-x-7 text-gray-800 items-center">
            <a href="/#features" style={{
              // @ts-ignore
              '--border-width': '6px',
              '--border-style': 'solid',
              '--border-color': '#f8ed8c',
              '--border-radius': '25px',
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}>Features</a>

            <a href="/#faq" style={{
              // @ts-ignore
              '--border-width': '6px',
              '--border-style': 'solid',
              '--border-color': '#f8ed8c',
              '--border-radius': '25px',
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}>FAQ</a>

            {/* 原有的Blog按钮改为Dashboard按钮 - Blog功能保留但暂时注释 */}
            {/* <a href="#blog" style={{
              // @ts-ignore
              '--border-width': '6px',
              '--border-style': 'solid',
              '--border-color': '#f8ed8c',
              '--border-radius': '25px',
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}>Blog</a> */}

            {/* Dashboard按钮 - 处理登录状态 */}
            <DashboardButton locale={locale} />

            <a href={`/${locale}/pricing`} style={{
              // @ts-ignore
              '--border-width': '6px',
              '--border-style': 'solid',
              '--border-color': '#f8ed8c',
              '--border-radius': '25px',
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}>Pricing</a>
          </nav>
        </div>

        {/* 右侧操作区：语言、按钮等 */}
        <div className="flex items-center space-x-10">
          {/* 语言切换 */}
          <div className="relative">
            <button
              className="flex items-center hover:text-purple-600"
              style={{
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                color: '#69b08b',
                fontSize: '23px',
                fontWeight: 'bold',
                transform: 'translateY(7px)'
              }}
            >
              <Globe className="h-5 w-5 mr-1" />
              {locale === 'zh' ? '中文' : 'English'}
            </button>
          </div>

          {/* 登录按钮 */}
          <HeaderSignButton locale={locale} />
        </div>
      </header>


      {page.header && <Header  locale={locale} />}


      <main className="overflow-x-hidden">{children}</main>

      {page.footer && <Footer footer={page.footer} />}
      {/* <Feedback socialLinks={page.footer?.social?.items} /> */}
    </div>
  );
}
