import { auth } from "@/auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

export default auth(function middleware(request: NextRequest) {
  // Chain the intl middleware after the auth middleware.
  return createIntlMiddleware(routing)(request);
});

export const config = {
  // This matcher is crucial. It ensures the middleware only runs on pages
  // and completely ignores API routes, static files, and image optimization files.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)", "/"],
};
