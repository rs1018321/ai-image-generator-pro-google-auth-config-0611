'use client'; // 标记为客户端组件，用于处理交互逻辑
import React, { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { Globe, Moon, Sun } from 'lucide-react'; // 假设使用 lucide-react 图标
import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";
import { getLandingPage } from "@/services/page";
import Feedback from "@/components/feedback";

// 定义背景样式
const backgroundStyle = {
    backgroundImage: "url('/imgs/custom/bg-image.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed", // 可选：固定背景
    minHeight: "100vh",
    width: "100%",
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
            className="h-8 w-auto mr-2"
          />
          <h1 style={{
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
            color: '#64c19f'
          }} className="font-bold text-5xl">Coloring Page</h1>
        </div>

        {/* 左侧区域：导航菜单项 - 调整位置与Logo对齐 */}
        <div className="flex items-center" style={{ 
          marginLeft: '370px',
          transform: 'translateY(7px)'
        }}>
          {/* 导航菜单项（桌面端显示） */}
          <nav className="hidden md:flex space-x-7 text-gray-800 items-center">
            <a href="#features" style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              border: '6px solid #f8ed8c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className="hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all">Features</a>
            
            <a href="#pricing" style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              border: '6px solid #f8ed8c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className="hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all">Pricing</a>
            
            <a href="#blog" style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              border: '6px solid #f8ed8c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className="hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all">Blog</a>
            
            <a href="#contact" style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              color: '#69b08b',
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#fcf4a3',
              borderRadius: '25px',
              padding: '8px 16px',
              border: '6px solid #f8ed8c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none'
            }} className="hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all">Contact</a>
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
          <button 
            className="px-4 py-1 text-white rounded cursor-pointer hover:opacity-80 transition-colors"
            style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              fontSize: '23px',
              fontWeight: 'bold',
              backgroundColor: '#f7c863',
              borderRadius: '25px',
              border: 'none',
              transform: 'translateY(7px)'
            }}
          >
            Login
          </button>
        </div>
      </header>

      <main className="overflow-x-hidden">{children}</main>
      
      {page.footer && <Footer footer={page.footer} />}
      {/* <Feedback socialLinks={page.footer?.social?.items} /> */}
    </div>
  );
}
