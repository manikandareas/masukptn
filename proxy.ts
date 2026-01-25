import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicRoutes = ["/", "/login", "/signup", "/auth/callback"];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return Response.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
