import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";
import mdx from "@next/mdx";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin();

const withMDX = mdx({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com; object-src 'none'; base-uri 'self';"
          },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
  experimental: {
    allowedDevOrigins: [process.env.NEXTAUTH_URL || ""].filter(Boolean),
  },
};

// Make sure experimental mdx flag is enabled
const configWithMDX = {
  ...nextConfig,
  experimental: {
    ...nextConfig.experimental, // 继承nextConfig中已有的experimental配置
    mdxRs: true,
    // 动态读取，而不是硬编码
    allowedDevOrigins: [
      ...nextConfig.experimental.allowedDevOrigins,
      "https://*.ngrok-free.app", // 允许所有ngrok子域名
      "http://*.ngrok-free.app"
    ].filter(Boolean),
  },
};

export default withBundleAnalyzer(withNextIntl(withMDX(configWithMDX)));
