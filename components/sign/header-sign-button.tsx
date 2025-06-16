"use client";

import { useAppContext } from "@/contexts/app";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface HeaderSignButtonProps {
  locale: string;
}

export default function HeaderSignButton({ locale }: HeaderSignButtonProps) {
  const t = useTranslations();
  const { setShowSignModal, user } = useAppContext();
  const router = useRouter();

  const handleUserCenterClick = () => {
    router.push("/my-orders");
  };

  const handleAdminClick = () => {
    window.open("/admin/users", "_blank");
  };

  if (user) {
    // 用户已登录，显示头像和下拉菜单
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center space-x-2 hover:opacity-80 transition-colors"
            style={{
              fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#f7c863',
              borderRadius: '25px',
              border: 'none',
              padding: '4px 12px',
              transform: 'translateY(7px)'
            }}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar_url} alt={user.nickname} />
              <AvatarFallback className="text-xs">
                {user.nickname?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-white">
              {user.nickname || user.email?.split('@')[0] || 'User'}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="text-center">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.nickname}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleUserCenterClick}>
            {t("user.user_center")}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleAdminClick}>
            {t("user.admin_system")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => signOut()}
          >
            {t("user.sign_out")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 用户未登录，显示登录按钮
  return (
    <button 
      onClick={() => setShowSignModal(true)}
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
      {t("user.sign_in")}
    </button>
  );
} 