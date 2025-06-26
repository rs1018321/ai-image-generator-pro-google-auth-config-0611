"use client";

import { FC } from "react";
import Link from "next/link";
import { Footer as FooterType } from "@/types/blocks/footer";
import Icon from "@/components/icon";
import LegalModal from "@/components/modals/LegalModal";
import { useState } from "react";

interface FooterProps {
  data: FooterType;
  locale: string;
}

export default function Footer({ footer }: { footer: FooterType }) {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<"privacy-policy" | "terms-of-service" | null>(null);
  const [legalDocTitle, setLegalDocTitle] = useState("");

  if (footer.disabled) {
    return null;
  }

  const handleLegalLinkClick = (url: string, title: string) => {
    // 检查是否是隐私政策或服务条款链接
    if (url.includes("/privacy-policy")) {
      setLegalDocType("privacy-policy");
      setLegalDocTitle(title);
      setLegalModalOpen(true);
    } else if (url.includes("/terms-of-service")) {
      setLegalDocType("terms-of-service");
      setLegalDocTitle(title);
      setLegalModalOpen(true);
    } else {
      // 对于其他链接，使用默认行为
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <section id={footer.name} className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <footer>
            <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
              <div className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
                {footer.brand && (
                  <div>
                    <div className="flex items-center justify-center gap-2 lg:justify-start">
                      {footer.brand.logo && (
                        <img
                          src={footer.brand.logo.src}
                          alt={footer.brand.logo.alt || footer.brand.title}
                          className="h-11"
                        />
                      )}
                      {footer.brand.title && (
                        <p className="text-3xl font-semibold">
                          {footer.brand.title}
                        </p>
                      )}
                    </div>
                    {footer.brand.description && (
                      <p className="mt-6 text-md text-muted-foreground">
                        {footer.brand.description}
                      </p>
                    )}
                  </div>
                )}
                {footer.social && (
                  <ul className="flex items-center space-x-6 text-muted-foreground">
                    {footer.social.items?.map((item, i) => (
                      <li key={i} className="font-medium hover:text-primary">
                        <a href={item.url} target={item.target} className="flex items-center gap-2">
                          {item.icon && (
                            <Icon name={item.icon} className="size-4" />
                          )}
                          {item.title && (
                            <span className="text-sm">{item.title}</span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-3 gap-6 lg:gap-20">
                {footer.nav?.items?.map((item, i) => (
                  <div key={i}>
                    <p className="mb-6 font-bold">{item.title}</p>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                      {item.children?.map((iitem, ii) => (
                        <li key={ii} className="font-medium hover:text-primary">
                          <a href={iitem.url} target={iitem.target}>
                            {iitem.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col justify-between gap-4 border-t pt-8 text-center text-sm font-medium text-muted-foreground lg:flex-row lg:items-center lg:text-left">
              {footer.copyright && (
                <p>
                  {footer.copyright}
                  {process.env.NEXT_PUBLIC_SHOW_BRAND === "true" && (
                    <Link
                      href="https://coloring-pages.app"
                      target="_blank"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Built with Coloring-Pages.app
                    </Link>
                  )}
                </p>
              )}

              {footer.agreement && footer.agreement.items && (
                <ul className="flex justify-center gap-4 lg:justify-start">
                  {footer.agreement.items.map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleLegalLinkClick(item.url || "", item.title || "")}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline"
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </footer>
        </div>
      </section>

      {/* Legal Modal */}
      {legalDocType && legalDocType !== null && (
        <LegalModal
          open={legalModalOpen}
          onOpenChange={setLegalModalOpen}
          type={legalDocType}
          title={legalDocTitle}
        />
      )}
    </>
  );
}
