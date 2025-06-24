import "@/app/globals.css";
import "@/app/[locale]/(default)/page.module.css"
import { getMessages, getTranslations } from "next-intl/server";

import { AppContextProvider } from "@/contexts/app";
import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";
import { NextAuthSessionProvider } from "@/auth/session";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import { cn } from "@/lib/utils";
import SubscriptionModal from "@/components/subscription/modal";
// @ts-ignore
import { CustomFont } from 'next/font/local'

// 加载本地字体（文件放 public/fonts 目录）
const dkCoolCrayon = CustomFont({
  src: '../../public/fonts/dk_cool_crayon-webfont.woff2', // 路径根据实际调整
  display: 'block', // 控制加载策略，block 会等待字体加载再渲染文字
  weight: '400',
  style: 'normal',
})

// const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations();

  return {
    title: {
      template: `%s`,
      default: t("metadata.title") || "",
    },
    description: t("metadata.description") || "",
    keywords: t("metadata.keywords") || "",
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={dkCoolCrayon.className} suppressHydrationWarning style={{
      backgroundColor: "#f5f3e8",
      overscrollBehavior: "none",
      height: "100%"
    }}>
      <body
        className={cn(
          "min-h-screen font-sans antialiased overflow-x-hidden",
            dkCoolCrayon.className
        )}
        style={{
          overscrollBehavior: "none",
          position: "relative"
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <NextAuthSessionProvider>
            <AppContextProvider>
              <ThemeProvider attribute="class" disableTransitionOnChange>
                {children}
                <SubscriptionModal />
              </ThemeProvider>
            </AppContextProvider>
          </NextAuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
