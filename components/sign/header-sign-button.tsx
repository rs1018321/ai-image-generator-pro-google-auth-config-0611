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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";

interface HeaderSignButtonProps {
  locale: string;
}

export default function HeaderSignButton({ locale }: HeaderSignButtonProps) {
  const t = useTranslations();
  const currentLocale = useLocale();
  const { setShowSignModal, user } = useAppContext();
  const router = useRouter();

  const handleUserCenterClick = () => {
    router.push("/my-orders");
  };

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: `/${locale || currentLocale}`,
      redirect: true 
    });
  };

  if (user === undefined) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("common.loading")}
      </Button>
    );
  }

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
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleSignOut}
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
      style={{
        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#f7c863',
        color: 'white',
        borderRadius: '25px',
        border: 'none',
        padding: '8px 16px',
        transform: 'translateY(7px)',
        cursor: 'pointer'
      }}
      className="hover:opacity-80 transition-opacity"
    >
      {t("user.sign_in")}
    </button>
  );
} 