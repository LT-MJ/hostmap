import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 renamed `middleware.ts`/`middleware()` to `proxy.ts`/`proxy()`
 * (same mechanism). This is a UX nicety only — an optimistic, cookie-claims
 * check that redirects obviously-unauthenticated requests before rendering
 * starts. It is never the real authorization gate; every protected
 * layout/Server Action re-verifies via `requireStaffSession()`/
 * `requirePermission()` (src/lib/supabase/guards.ts), and RLS is the
 * authoritative boundary underneath both. See docs/architecture/02-auth.md.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
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
