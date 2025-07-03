"use client";
import React, { ReactNode, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import styles from './page.module.css';
import Link from "next/link";
import DashboardButton from "@/components/navigation/dashboard-button";
import HeaderSignButton from "@/components/sign/header-sign-button";

export default function Header({ locale }: { locale: string }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false); // 初始设为false，避免SSR错误

    // 监听窗口大小变化，更新移动状态
    useEffect(() => {
        function handleResize() {
            const mobile = window.innerWidth < 1300;
            setIsMobile(mobile);
            // 只有在切换到桌面端时才强制关闭移动菜单
            if (!mobile) {
                setMobileMenuOpen(false);
            }
        }

        handleResize(); // 初始化执行一次
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                                    className="font-bold lg:text-4xl md:text-3xl text-2xl"
                                >
                                    Coloring-Pages.app
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
                                href="/#features"
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
                                href="/#faq"
                                className={clsx(
                                    styles.headerCircle,
                                    "text-gray-800 hover:text-purple-600 px-2 py-1",
                                    "text-sm sm:text-base"
                                )}
                            >
                                FAQ
                            </a>
                            <DashboardButton locale={locale} />
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
                                Pricing
                            </a>
                        </nav>
                    </div>

                    {/* 右侧操作区 - 统一容器 */}
                    <div className="flex items-center space-x-4">
                        {/* 移动端菜单按钮 - 条件显示 */}
                        <button
                            className="md:hidden text-gray-800" // 使用 md:hidden 来控制显示
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>

                        {/* 桌面端右侧按钮 - 条件显示 */}
                        <div className="hidden md:flex items-center space-x-11">
                            {/* 登录按钮 */}
                            <HeaderSignButton locale={locale} />
                        </div>
                    </div>
                </div>
            </header>

            {/* 移动端菜单 - 仅在屏幕<1100px时显示 */}
            <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                <div
                    className={`absolute top-0 right-0 h-full z-40 w-64 bg-[#EBF5C4] shadow-xl transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-[#64bd9b] text-lg">Menu</h2>
                            <button onClick={closeMobileMenu} className="text-gray-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-3">
                            <a
                                href="/#features"
                                onClick={closeMobileMenu}
                                className="text-gray-800 hover:bg-[#d8e4a1] p-2 rounded"
                            >
                                Features
                            </a>
                            <a
                                href="/#faq"
                                onClick={closeMobileMenu}
                                className="text-gray-800 hover:bg-[#d8e4a1] p-2 rounded"
                            >
                                FAQ
                            </a>
                            <a
                                href={`/${locale}/pricing`}
                                onClick={closeMobileMenu}
                                className="text-gray-800 hover:bg-[#d8e4a1] p-2 rounded"
                            >
                                Pricing
                            </a>
                            <DashboardButton locale={locale} variant="mobile" />
                            <div className="border-t border-gray-300 pt-3 mt-3">
                                <HeaderSignButton locale={locale} />
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
