"use client";
import React, { ReactNode, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Globe, Menu, X } from 'lucide-react';
import styles from './page.module.css';
import Link from "next/link";
import DashboardButton from "@/components/navigation/dashboard-button";
import HeaderSignButton from "@/components/sign/header-sign-button";

export default function Header({ locale }: { locale: string }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1100); // 初始检测

    // 监听窗口大小变化，更新移动状态
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1300);
            // 窗口变小时自动关闭菜单
            if (window.innerWidth < 1300 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始化调用
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div>
            <header className="">
                <div className="mx-auto px-6 py-4 flex items-center justify-between">
                    {/* 左侧区域：Logo + 导航菜单项（紧凑布局） */}
                    <div className="flex items-center">
                        {/* Logo 区域 */}
                        <div className="flex items-center mr-5">
                            <img src="/imgs/logo.png" alt="Coloring Logo" className="h-12 w-auto mr-2"/>
                            <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
                                <h1
                                    style={{
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        color: '#64c19f',
                                        whiteSpace: 'nowrap',
                                    }}
                                    className="font-bold lg:text-5xl md:text-5xl text-4xl"
                                >
                                    Coloring Page
                                </h1>
                            </Link>
                        </div>

                        {/* 桌面端导航菜单 - 仅在屏幕≥1100px时显示 */}
                        <nav className={`hidden ${!isMobile ? 'md:flex' : ''} items-center space-x-7 `}
                             style={{
                                 marginLeft: '4.2rem',
                                 transform: 'translateY(7px)'
                             }}
                        >
                            <a
                                href="#features"
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
                                    padding: '10px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    textDecoration: 'none'
                                }}
                                className={clsx(
                                    "hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all  px-2 py-1", styles.headerCircle
                                )}
                            >
                                Features
                            </a>
                            <a
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
                                    padding: '10px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    textDecoration: 'none'
                                }}
                                href="#faq"
                                className={clsx(
                                    styles.headerCircle,
                                    "text-gray-800 hover:text-purple-600 px-2 py-1",
                                    "text-sm sm:text-base"
                                )}
                            >
                                FAQ
                            </a>
                            <DashboardButton locale={locale}/>
                            <a
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
                                    padding: '10px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    textDecoration: 'none'
                                }}
                                href={`/${locale}/pricing`}
                                className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}
                            >
                                pricing
                            </a>
                        </nav>
                    </div>

                    {/* 移动端菜单按钮 - 仅在屏幕<1100px时显示 */}
                    {isMobile && (
                        <button
                            className=" text-gray-800"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                        </button>
                    )}

                    {/* 右侧操作区 - 仅在屏幕≥1100px时显示 */}
                    {!isMobile && (
                        <div className="flex items-center space-x-11">
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
                                    <Globe className="h-5 w-5 mr-1"/>
                                    <span>{locale === 'zh' ? '中文' : 'English'}</span>
                                </button>
                            </div>
                            {/* 登录按钮 */}
                            <HeaderSignButton locale={locale}/>
                        </div>
                    )}
                </div>
            </header>

            {/* 移动端菜单 - 仅在屏幕<1100px时显示 */}
            {isMobile && (
                <div className="block ">
                    <div
                        className={`absolute top-0 right-0 h-full z-40 w-64 bg-[#EBF5C4] shadow-xl transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-[#64bd9b] text-lg">Menu</h2>
                                <button onClick={closeMobileMenu} className="text-gray-800">
                                    <X className="h-5 w-5"/>
                                </button>
                            </div>
                            <nav className="flex flex-col space-y-3">
                                <a
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
                                        padding: '8px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        textDecoration: 'none'
                                    }}
                                    href="#features"
                                    onClick={closeMobileMenu}
                                    className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}
                                >
                                    Features
                                </a>
                                <a
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
                                        padding: '8px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        textDecoration: 'none'
                                    }}
                                    href="#faq"
                                    onClick={closeMobileMenu}
                                    className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}
                                >
                                    pricing1
                                </a>
                                <DashboardButton locale={locale} />
                                <a
                                    href={`/${locale}/pricing`}
                                    onClick={closeMobileMenu}
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
                                        padding: '8px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        textDecoration: 'none'
                                    }}
                                    className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}
                                >
                                    pricing
                                </a>
                            </nav>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                {/* 语言切换 */}
                                <div className="relative mb-4">
                                    <button
                                        className="flex items-center text-gray-800 hover:text-purple-600 w-full justify-between py-2 border-b border-gray-100 text-base"
                                    >
                    <span className="flex items-center">
                      <Globe className="h-5 w-5 mr-2"/>
                      <span>{locale !== 'zh' ? 'English' : '中文'}</span>
                    </span>
                                    </button>
                                </div>
                                {/* 登录按钮 */}
                                <HeaderSignButton locale={locale}/>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
