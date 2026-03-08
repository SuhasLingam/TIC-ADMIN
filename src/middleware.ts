import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isLoginPage = pathname.startsWith("/login");

    // Supabase SSR stores the session in cookies prefixed with "sb-"
    // Check for any auth-token cookie to detect an active session
    const hasSession = request.cookies
        .getAll()
        .some(
            (c) => c.name.includes("auth-token") && c.name.startsWith("sb-")
        );

    // Not logged in → redirect to /login
    if (!hasSession && !isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Already logged in → redirect away from /login
    if (hasSession && isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|auth).*)",
    ],
};
