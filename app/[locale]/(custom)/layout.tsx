'use client'; // 标记为客户端组件，用于处理交互逻辑
import React, { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { Globe, Moon, Sun } from 'lucide-react'; // 假设使用 lucide-react 图标
import styles from './custom/page.module.css';

// 定义背景样式
const backgroundStyle = {
    backgroundImage: "url('/imgs/custom/bg-image.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed", // 可选：固定背景
    minHeight: "100vh",
    width: "100%",
};

export default function CustomLayout({
                                         children,
                                         params: { locale }, // 从 props 直接拿国际化参数 locale
                                     }: {
    children: ReactNode;
    params: { locale: string };
}) {
    // 状态管理
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false); // 语言下拉展开状态
    const [theme, setTheme] = useState<'light' | 'dark'>('light'); // 主题状态（示例）

    // 🎯 导航按钮位置调整变量 - 您可以修改这个数值来调整按钮上下位置
    const buttonVerticalOffset = 7; // 正数向下移动，负数向上移动（单位：px）

    // 切换语言（示例，需结合 next-intl 或路由跳转实现真正的语言切换）
    const handleChangeLocale = (newLocale: string) => {
        // 这里需补充：调用 next-intl 或 router 切换语言的逻辑
        console.log('切换语言为:', newLocale);
        setShowLanguageDropdown(false); // 关闭下拉
    };

    // 切换主题（示例，需结合 next-themes 实现真正的主题切换）
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <div className={styles.pageMain} style={backgroundStyle}>
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
                    }} className={clsx(" font-bold text-5xl")} >Coloring Page</h1>
                </div>

                {/* 左侧区域：导航菜单项 - 调整位置与Logo对齐 */}
                <div className="flex items-center" style={{ 
                    marginLeft: '370px',
                    transform: `translateY(${buttonVerticalOffset}px)`
                }}>
                    {/* 导航菜单项（桌面端显示） */}
                    <nav className="hidden md:flex space-x-7 text-gray-800 items-center">

                        <a href="#features"  style={{
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'

                        }} className={clsx("hover:text-purple-600", styles.headerCircle)} >Features</a>
                        <a href="#pricing"
                           style={{
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
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               textAlign: 'center'
                           }} className={clsx("hover:text-purple-600", styles.headerCircle)}  >Pricing</a>
                        <a href="#blog"
                           style={{
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
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               textAlign: 'center'
                           }}
                           className={clsx("hover:text-purple-600", styles.headerCircle)}  >Blog</a>
                        <a href="#contact"
                           style={{
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
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               textAlign: 'center'
                           }}
                           className={clsx("hover:text-purple-600", styles.headerCircle)} >Contact</a>
                    </nav>
                </div>

                {/* 右侧操作区：语言、按钮等 */}
                <div className="flex items-center space-x-10">
                    {/* 语言切换 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                            className="flex items-center hover:text-purple-600"
                            style={{
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                color: '#69b08b',
                                fontSize: '23px',
                                fontWeight: 'bold',
                                transform: `translateY(${buttonVerticalOffset}px)` // 与导航按钮位置对齐
                            }}
                        >
                            <Globe className="h-5 w-5 mr-1 " />
                            English
                        </button>
                        {/* 语言下拉选项 */}
                        <div
                            className={clsx(
                                "absolute right-0 top-full mt-2 bg-white text-gray-800 shadow-md rounded-md p-2",
                                showLanguageDropdown ? "block" : "hidden"
                            )}
                        >
                            <button
                                onClick={() => handleChangeLocale('English')}
                                className={clsx("block px-4 py-2 hover:bg-purple-500/10", {
                                    'bg-purple-500/10': locale === 'English'
                                })}
                            >
                                English
                            </button>
                            <button
                                onClick={() => handleChangeLocale('中文')}
                                className={clsx("block px-4 py-2 hover:bg-purple-500/10", {
                                    'bg-purple-500/10': locale === '中文'
                                })}
                            >
                                中文
                            </button>
                        </div>
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
                            transform: `translateY(${buttonVerticalOffset}px)` // 与导航按钮位置对齐
                        }}
                    >
                        Sign In
                    </button>
                </div>
            </header>

            {/* 页面主要内容，渲染子组件 */}
            <main className="px-6 py-8">{children}</main>


            <svg height="0" xmlns="http://www.w3.org/2000/svg">
                <filter id="hand-drawn">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turbulence"/>
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" />
                </filter>
            </svg>


        </div>
    );
}
