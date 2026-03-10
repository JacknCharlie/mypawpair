import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon, icons
     * - Static file extensions (images, fonts, scripts, styles)
     * - PWA files: sw.js, workbox-*.js, swe-worker-*.js, manifest.webmanifest
     */
    "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|js|css|woff2?|webmanifest)$).*)",
  ],
};
