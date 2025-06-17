import DashboardLayout from "@/components/dashboard/layout";
import Empty from "@/components/blocks/empty";
import { ReactNode } from "react";
import { Sidebar } from "@/types/blocks/sidebar";
import { getUserInfo } from "@/services/user";
import { redirect } from "next/navigation";
import { RiGithubFill, RiDiscordFill, RiTwitterXFill } from "react-icons/ri";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userInfo = await getUserInfo();
  if (!userInfo || !userInfo.email) {
    redirect("/auth/signin");
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",");
  if (!adminEmails?.includes(userInfo?.email)) {
    return <Empty message="No access" />;
  }

  const sidebar: Sidebar = {
    brand: {
      title: "Coloring Page",
      logo: {
        src: "/imgs/logo.png",
        alt: "Coloring Page",
      },
    },
    nav: {
      items: [
        {
          title: "Users",
          url: "/admin/users",
          icon: "RiUserLine",
        },
        {
          title: "Orders",
          icon: "RiOrderPlayLine",
          is_expand: true,
          children: [
            {
              title: "Paid Orders",
              url: "/admin/paid-orders",
            },
          ],
        },
        {
          title: "Posts",
          url: "/admin/posts",
          icon: "RiArticleLine",
        },
        {
          title: "Feedbacks",
          url: "/admin/feedbacks",
          icon: "RiMessage2Line",
        },
      ],
    },
    social: {
      items: [
        {
          title: "Home",
          url: "/",
          target: "_blank",
          icon: "RiHomeLine",
        },
        {
          title: "Github",
          icon: "RiGithubFill",
          url: "https://github.com/coloringpageai/coloringpage-template-one",
          target: "_blank",
        },
        {
          title: "Discord",
          icon: "RiDiscordFill",
          url: "https://discord.gg/HQNnrzjZQS",
          target: "_blank",
        },
        {
          title: "Twitter",
          icon: "RiTwitterXFill",
          url: "https://x.com/coloringpageai",
          target: "_blank",
        },
      ],
    },
  };

  return <DashboardLayout sidebar={sidebar}>{children}</DashboardLayout>;
}
