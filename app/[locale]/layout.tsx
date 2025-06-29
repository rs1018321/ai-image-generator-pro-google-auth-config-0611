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
import localFont from 'next/font/local'
import Script from "next/script";

// 加载本地字体（文件放 public/fonts 目录）
const dkCoolCrayon = localFont({
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

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "coloring-pages.app";

  return (
    <html lang={locale} suppressHydrationWarning className="font-comic" style={{
      backgroundColor: "#f5f3e8",
      overscrollBehavior: "none",
      height: "100%"
    }}>
      <head>
        {/* Google Analytics - 只要有GA ID就加载 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity - 只要有Clarity ID就加载 */}
        {clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}

        {/* Plausible Analytics - 只要有域名配置就加载了 */}
        {plausibleDomain && (
          <>
            <Script
              src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
              strategy="afterInteractive"
              data-domain={plausibleDomain}
            />
            <Script id="plausible-init" strategy="afterInteractive">
              {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
            </Script>
          </>
        )}
      </head>
      <body
        className={cn(
          "min-h-screen font-comic antialiased overflow-x-hidden"
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
