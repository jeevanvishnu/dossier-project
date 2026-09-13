import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match root, locale routes, and nested paths, excluding statics & api
  matcher: ["/", "/(ru|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
