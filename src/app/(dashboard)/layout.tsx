"use client";

import Link from "next/link";
import { Mail, Users, Settings, Menu, LogOut, BarChart3, Calendar, Target, Rocket, Zap } from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { RealtimeSync } from "~/components/RealtimeSync";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "~/app/actions/auth";

const NAV = [
  { href: "/", icon: BarChart3, label: "Overview" },
  { href: "/applications", icon: Mail, label: "Applications" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/insights", icon: Target, label: "Insights" },
  { href: "/opportunities", icon: Rocket, label: "Opportunities" },
  { href: "/broadcast", icon: Zap, label: "Broadcast" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  const close = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <RealtimeSync />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-56 flex flex-col
        bg-[var(--surface)] border-r border-[var(--border)]
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                    : "text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}

        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border)] p-3 space-y-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-red-500/70 hover:text-red-500 hover:bg-red-500/8 dark:hover:bg-red-500/10
              transition-colors disabled:opacity-40"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-56">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-10 flex h-14 items-center justify-between px-4 bg-[var(--surface)] border-b border-[var(--border)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-widest">TIC Admin</p>
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
