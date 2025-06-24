"use client";

import { useAppContext } from "@/contexts/app";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import styles from '../../app/[locale]/(default)/page.module.css';

interface DashboardButtonProps {
  locale: string;
  variant?: "desktop" | "mobile";
}

export default function DashboardButton({ locale, variant = "desktop" }: DashboardButtonProps) {
  const { user, setShowSignModal, setPendingRedirect } = useAppContext();
  const router = useRouter();
  const t = useTranslations();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (user) {
      // 用户已登录，跳转到dashboard
      router.push(`/${locale}/my-orders`);
    } else {
      // 用户未登录，设置跳转目标并显示登录弹窗
      setPendingRedirect(`/${locale}/my-orders`);
      setShowSignModal(true);
    }
  };

  if (variant === "mobile") {
    return (
      <button
        onClick={handleClick}
        className="text-gray-800 hover:bg-[#d8e4a1] p-2 rounded text-left"
      >
        Dashboard
      </button>
    );
  }

  // desktop default
  return (
    <button
      onClick={handleClick}
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
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer'
      }}
      className={clsx("hover:bg-[#64bd9b] hover:text-white hover:scale-105 transition-all", styles.headerCircle)}
    >
      Dashboard
    </button>
  );
} 