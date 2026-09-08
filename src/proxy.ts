import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 renamed `middleware.ts`/`middleware()` to `proxy.ts`/`proxy()`
 * (same mechanism). Two independent jobs share this file because both need
 * to run before every render: (1) an optimistic, cookie-claims auth check
 * (a UX nicety only — never the real gate; see requireStaffSession()/
 * requirePermission() in lib/supabase/guards.ts and RLS underneath both),
 * and (2) a per-request CSP nonce (§8). The nonce is "free" here — a
 * nonce-based CSP normally forces every page into dynamic rendering, but
 * every route in this app already is dynamic (cookies()-based Supabase
 * auth), so there's no static-optimization cost being traded away.
 */
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co;
    font-src 'self';
    connect-src 'self' https://*.supabase.co;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspHeader);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Required order: write to the request first so any later code in
          // this function sees the refreshed cookies, then rebuild the
          // response from that request before writing the response cookies.
          // Splitting this into "just update `response.cookies`" silently
          // drops the refresh and causes intermittent, hard-to-reproduce
          // logouts — the single most footgun-prone part of Supabase SSR.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.headers.set("Content-Security-Policy", cspHeader);
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Must be called immediately after client construction, with nothing else
  // awaited in between, or the refreshed-cookie write above can be skipped.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminAuthRoute =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isAdminRoute && !isAdminAuthRoute && !claims) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every route except:
     * - api (Route Handlers authorize/verify themselves — webhooks and the
     *   Cron endpoint in particular have no user session to refresh)
     * - _next/static, _next/image (build assets, image optimizer)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - common static file extensions under /public
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
