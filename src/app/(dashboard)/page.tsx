"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Search, Loader2, Eye, Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const TIER_CONFIG: Record<string, string> = {
    Trailblazer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Visionary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Explorer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const STATUS_CONFIG: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    approved: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Page() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [tierFilter, setTierFilter] = useState<string>("all");

    // Debounce search — only filter after 250 ms of inactivity
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 250);
        return () => clearTimeout(t);
    }, [search]);

    const { data: mails, isLoading } = api.application.getAll.useQuery();

    const filtered = mails?.filter((m) => {
        const matchSearch =
            m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            m.startupName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            m.email.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchStatus = statusFilter === "all" || m.status === statusFilter;
        const matchTier = tierFilter === "all" || m.tier === tierFilter;
        return matchSearch && matchStatus && matchTier;
    });

    const total = mails?.length ?? 0;
    const pending = mails?.filter((m) => m.status === "pending").length ?? 0;
    const approved = mails?.filter((m) => m.status === "approved").length ?? 0;
    const rejected = mails?.filter((m) => m.status === "rejected").length ?? 0;

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-heading tracking-tight mb-1">Applications</h1>
                <p className="text-sm text-[var(--foreground)]/50">View, filter, and action membership applications.</p>
            </div>

            {/* Stats — 2 col on mobile, 4 col on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total" value={total} icon={<Mail className="w-4 h-4" />} color="text-[var(--foreground)]/60" />
                <StatCard label="Pending" value={pending} icon={<Clock className="w-4 h-4" />} color="text-yellow-500" />
                <StatCard label="Approved" value={approved} icon={<CheckCircle2 className="w-4 h-4" />} color="text-green-500" />
                <StatCard label="Rejected" value={rejected} icon={<XCircle className="w-4 h-4" />} color="text-red-400" />
            </div>

            {/* Toolbar — stacks vertically on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                        type="text"
                        placeholder="Search founders, startups..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent border-none outline-none pl-9 py-1 text-sm placeholder:text-[var(--foreground)]/30 text-[var(--foreground)]"
                    />
                </div>
                {/* Status filter pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {["all", "pending", "reviewed", "approved", "rejected"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors flex-shrink-0
                ${statusFilter === s
                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                    : "hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/60"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-5 bg-[var(--border)] flex-shrink-0" />

                {/* Tier filter pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {[
                        { key: "all", label: "All Tiers" },
                        { key: "Trailblazer", label: "Trailblazer" },
                        { key: "Visionary", label: "Visionary" },
                        { key: "Explorer", label: "Explorer" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTierFilter(key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${tierFilter === key
                                    ? key === "Trailblazer" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                        : key === "Visionary" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            : key === "Explorer" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                : "bg-[var(--foreground)] text-[var(--background)]"
                                    : "hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/60"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table — hidden on mobile, visible on md+ */}
            <div className="hidden md:block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--border)] text-[var(--foreground)]/50 text-[11px] uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4 font-medium">Founder</th>
                            <th className="px-6 py-4 font-medium">Startup</th>
                            <th className="px-6 py-4 font-medium">Tier</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Applied</th>
                            <th className="px-6 py-4 font-medium text-right">Open</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center text-[var(--foreground)]/40">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : filtered?.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center text-[var(--foreground)]/40 text-sm">
                                    No applications match your search.
                                </td>
                            </tr>
                        ) : (
                            filtered?.map((mail) => (
                                <tr key={mail.id} className="hover:bg-[var(--foreground)]/[0.03] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{mail.name}</div>
                                        <div className="text-xs text-[var(--foreground)]/40 mt-0.5">{mail.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{mail.startupName}</div>
                                        <div className="text-xs text-[var(--foreground)]/40 mt-0.5 capitalize">{mail.founderStage}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide border ${TIER_CONFIG[mail.tier] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)] border-[var(--border)]"}`}>
                                            {mail.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide border ${STATUS_CONFIG[mail.status] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)] border-[var(--border)]"}`}>
                                            {mail.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--foreground)]/50 text-xs">{format(mail.createdAt, "MMM d, yyyy")}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/applications/${mail.id}`} className="p-2 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/40 hover:text-[var(--foreground)] inline-block">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Cards — shown only on mobile */}
            <div className="flex flex-col gap-3 md:hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-[var(--foreground)]/40">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                ) : filtered?.length === 0 ? (
                    <p className="text-center text-[var(--foreground)]/40 py-12 text-sm">No applications match your search.</p>
                ) : (
                    filtered?.map((mail) => (
                        <Link
                            key={mail.id}
                            href={`/applications/${mail.id}`}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[var(--foreground)]/20 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center text-sm font-heading flex-shrink-0">
                                    {mail.name[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{mail.name}</p>
                                    <p className="text-xs text-[var(--foreground)]/40 truncate">{mail.startupName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${TIER_CONFIG[mail.tier] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)] border-[var(--border)]"}`}>
                                    {mail.tier}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${STATUS_CONFIG[mail.status] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)] border-[var(--border)]"}`}>
                                    {mail.status}
                                </span>
                                <Eye className="w-4 h-4 text-[var(--foreground)]/30" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
            <div className={`flex items-center gap-2 text-xs uppercase tracking-widest ${color}`}>
                {icon} {label}
            </div>
            <p className="text-2xl sm:text-3xl font-heading">{value}</p>
        </div>
    );
}
