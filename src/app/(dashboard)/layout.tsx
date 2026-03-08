"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Users, Settings, Menu, X, LogOut } from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { useState } from "react";
import { logout } from "~/app/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        await logout();
    }

    return (
        <div className="min-h-screen relative">

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — always fixed, pinned to viewport */}
            <aside className={`
        fixed inset-y-0 left-0 z-30
        w-60 h-screen border-r border-[var(--border)] bg-[var(--surface)]
        p-5 flex flex-col flex-shrink-0 overflow-y-auto
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                <div className="mb-6 px-3 flex items-center justify-between">
                    <div>
                        <Image
                            src="/logo/ticlogo.svg"
                            alt="TIC Admin"
                            width={60}
                            height={24}
                            className="h-6 w-auto dark:invert"
                        />
                        <p className="text-[10px] text-[var(--foreground)]/40 uppercase tracking-widest mt-1.5">Internal Dashboard</p>
                    </div>
                    <button
                        className="lg:hidden p-1 hover:bg-[var(--foreground)]/10 rounded-md"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-4 h-4 opacity-60" />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col gap-1">
                    <Link
                        href="/"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--foreground)]/5 transition-colors text-sm"
                    >
                        <Mail className="w-4 h-4 opacity-60" />
                        Applications
                    </Link>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-30 cursor-not-allowed text-sm">
                        <Users className="w-4 h-4" />
                        Users (Soon)
                    </div>
                    <Link
                        href="/settings"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--foreground)]/5 transition-colors text-sm"
                    >
                        <Settings className="w-4 h-4 opacity-60" />
                        Settings
                    </Link>
                </nav>

                {/* Bottom — theme toggle + logout */}
                <div className="border-t border-[var(--border)] pt-3 mt-auto flex flex-col gap-2">
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 text-red-400/70 hover:text-red-400 transition-colors text-sm w-full disabled:opacity-40"
                    >
                        <LogOut className="w-4 h-4" />
                        {loggingOut ? "Signing out..." : "Sign out"}
                    </button>
                </div>
            </aside>

            {/* Mobile top bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-[var(--foreground)]/10 rounded-md transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <Image src="/logo/ticlogo.svg" alt="TIC" width={44} height={20} className="h-5 w-auto dark:invert" />
                <div className="w-9" />
            </header>

            {/* Main content — offset by sidebar width on desktop, top bar on mobile */}
            <main className="lg:pl-60 pt-0 lg:pt-0 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
