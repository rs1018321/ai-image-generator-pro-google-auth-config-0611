import { Pathnames } from "next-intl/routing";

export const locales = ["en"];

export const localeNames: any = {
  en: "English",
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

export const localeDetection = false;

export const pathnames = {
  en: {
    "privacy-policy": "/privacy-policy",
    "terms-of-service": "/terms-of-service",
  },
} satisfies Pathnames<typeof locales>;
