import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/";

    // Handle PKCE code exchange (OAuth / magic link)
    if (code) {
        const cookieStore = request.cookies;
        const response = NextResponse.redirect(`${origin}${next}`);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return response;
    }

    // Handle invite / recovery token (older flow)
    if (token && type) {
        const cookieStore = request.cookies;
        const response = NextResponse.redirect(`${origin}/`);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as "invite" | "recovery" | "signup" | "email",
        });

        if (!error) return response;
    }

    // Fallback redirect to login on error
    return NextResponse.redirect(`${origin}/login`);
}
