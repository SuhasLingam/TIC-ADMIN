"use client";

import { useState } from "react";
import { login } from "~/app/actions/auth";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // On success, server action calls redirect("/") — page navigates away
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] mb-5">
                        <Lock className="w-5 h-5 opacity-60" />
                    </div>
                    <div className="flex justify-center mb-2">
                        <Image src="/logo/ticlogo.svg" alt="TIC" priority unoptimized width={56} height={28} className="h-7 w-auto dark:invert" />
                    </div>
                    <p className="text-sm text-[var(--foreground)]/40 mt-1">Sign in to access the dashboard.</p>
                </div>

                {/* Card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/40">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="admin@incitecrew.com"
                                className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/25 outline-none focus:border-[var(--foreground)]/30 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/40">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/25 outline-none focus:border-[var(--foreground)]/30 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                    </form>
                </div>

                <p className="text-center text-[11px] text-[var(--foreground)]/25 mt-6 uppercase tracking-widest">
                    A clarity first ecosystem
                </p>
            </div>
        </div>
    );
}
