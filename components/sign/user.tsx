"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { User } from "@/types/user";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function SignUser({ user }: { user: User }) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const handleUserCenterClick = () => {
    router.push("/my-orders");
  };

  const handleAdminClick = () => {
    window.open("/admin/users", "_blank");
  };

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: `/${locale}`,
      redirect: true 
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatar_url} alt={user.nickname} />
          <AvatarFallback>{user.nickname}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4">
        <DropdownMenuLabel className="text-center truncate">
          {user.nickname}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-center truncate">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex justify-center cursor-pointer" onClick={handleUserCenterClick}>
          {t("user.user_center")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex justify-center cursor-pointer" onClick={handleAdminClick}>
          {t("user.admin_system")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex justify-center cursor-pointer"
          onClick={handleSignOut}
        >
          {t("user.sign_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
