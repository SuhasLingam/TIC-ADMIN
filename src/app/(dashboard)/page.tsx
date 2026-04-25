"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import {
  Search, Loader2, Eye, Clock, CheckCircle2, XCircle,
  Users, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// ─── Badge config ─────────────────────────────────────────────────────────────
const TIER: Record<string, string> = {
  Trailblazer: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  Visionary:   "bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-500/10  dark:text-amber-400  dark:border-amber-500/20",
  Explorer:    "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-500/10   dark:text-blue-400   dark:border-blue-500/20",
};

const STATUS: Record<string, string> = {
  pending:  "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  reviewed: "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-500/10   dark:text-blue-400   dark:border-blue-500/20",
  approved: "bg-green-50  text-green-700  border-green-200  dark:bg-green-500/10  dark:text-green-400  dark:border-green-500/20",
  rejected: "bg-red-50    text-red-700    border-red-200    dark:bg-red-500/10    dark:text-red-400    dark:border-red-500/20",
};

const FILTER_BTN = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
    active
      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
      : "text-[var(--foreground)]/50 hover:bg-[var(--foreground)]/8 hover:text-[var(--foreground)]"
  }`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Page() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const { data: apps, isLoading } = api.application.getAll.useQuery();

  const filtered = apps?.filter((a) => {
    const q = debounced.toLowerCase();
    const matchSearch =
      (a.name ?? a.email).toLowerCase().includes(q) ||
      (a.companyName ?? "").toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const tier = a.assignedTier ?? a.tierInterest ?? "Explorer";
    const matchTier = tierFilter === "all" || tier === tierFilter;
    return matchSearch && matchStatus && matchTier;
  });

  const total    = apps?.length ?? 0;
  const pending  = apps?.filter((a) => a.status === "pending").length  ?? 0;
  const approved = apps?.filter((a) => a.status === "approved").length ?? 0;
  const rejected = apps?.filter((a) => a.status === "rejected").length ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Applications</h1>
          <p className="text-sm text-[var(--foreground)]/40 mt-0.5">Review, filter, and action membership applications.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)]/30">
          <TrendingUp className="w-3.5 h-3.5" />
          {total} Total
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total"    value={total}    icon={<Users className="w-4 h-4" />}        color="text-[var(--foreground)]/50" />
        <StatCard label="Pending"  value={pending}  icon={<Clock className="w-4 h-4" />}        color="text-amber-500" />
        <StatCard label="Approved" value={approved} icon={<CheckCircle2 className="w-4 h-4" />} color="text-emerald-500" />
        <StatCard label="Rejected" value={rejected} icon={<XCircle className="w-4 h-4" />}      color="text-red-400" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3
        bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30" />
          <input
            type="text"
            placeholder="Search founders, startups…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none pl-8 text-sm
              placeholder:text-[var(--foreground)]/30 text-[var(--foreground)]"
          />
        </div>

        <div className="hidden sm:block w-px h-5 bg-[var(--border)] flex-shrink-0" />

        {/* Status pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {["all", "pending", "reviewed", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={FILTER_BTN(statusFilter === s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-px h-5 bg-[var(--border)] flex-shrink-0" />

        {/* Tier pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {[
            { key: "all", label: "All" },
            { key: "Trailblazer", label: "Trailblazer" },
            { key: "Visionary", label: "Visionary" },
            { key: "Explorer", label: "Explorer" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTierFilter(key)} className={FILTER_BTN(tierFilter === key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)]">
            <tr className="text-[10px] uppercase tracking-[0.15em] text-[var(--foreground)]/40 font-semibold">
              <th className="px-6 py-4">Founder</th>
              <th className="px-6 py-4">Startup</th>
              <th className="px-6 py-4">Tier</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Applied</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center text-[var(--foreground)]/30">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading applications…
                  </div>
                </td>
              </tr>
            ) : filtered?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center text-[var(--foreground)]/30 text-sm">
                  No applications match your search.
                </td>
              </tr>
            ) : (
              filtered?.map((a) => {
                const tier = a.assignedTier ?? a.tierInterest ?? "Explorer";
                return (
                  <tr key={a.id} className="hover:bg-[var(--foreground)]/[0.025] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--foreground)]/8 flex items-center justify-center text-[11px] font-bold text-[var(--foreground)]/60 shrink-0">
                          {(a.name ?? a.email)[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{a.name ?? "Founder"}</p>
                          <p className="text-xs text-[var(--foreground)]/40">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[var(--foreground)]/80">{a.companyName ?? "—"}</p>
                      <p className="text-xs text-[var(--foreground)]/40 capitalize mt-0.5">{a.startupStage ?? "Unknown stage"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${TIER[tier] ?? "border-[var(--border)] text-[var(--foreground)]/40"}`}>
                        {tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS[a.status] ?? "border-[var(--border)] text-[var(--foreground)]/40"}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--foreground)]/40">
                      {format(a.createdAt, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/applications/${a.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                          border border-[var(--border)] text-[var(--foreground)]/50
                          hover:bg-zinc-900 hover:text-white hover:border-zinc-900
                          dark:hover:bg-white dark:hover:text-zinc-900 dark:hover:border-white
                          transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table footer */}
        {!isLoading && !!filtered?.length && (
          <div className="px-6 py-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--foreground)]/30">
            <span>Showing {filtered.length} of {total} applications</span>
          </div>
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-[var(--foreground)]/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : filtered?.length === 0 ? (
          <p className="text-center text-[var(--foreground)]/40 py-12 text-sm">No applications match your search.</p>
        ) : (
          filtered?.map((a) => {
            const tier = a.assignedTier ?? a.tierInterest ?? "Explorer";
            return (
              <Link
                key={a.id}
                href={`/applications/${a.id}`}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4
                  flex items-center justify-between gap-4
                  hover:border-[var(--foreground)]/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[var(--foreground)]/8 flex items-center justify-center text-sm font-bold text-[var(--foreground)]/60 shrink-0">
                    {(a.name ?? a.email)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{a.name ?? "Founder"}</p>
                    <p className="text-xs text-[var(--foreground)]/40 truncate">{a.companyName ?? a.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${TIER[tier] ?? ""}`}>
                    {tier}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS[a.status] ?? ""}`}>
                    {a.status}
                  </span>
                  <Eye className="w-4 h-4 text-[var(--foreground)]/20" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: {
  label: string; value: number; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-3">
      <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold ${color}`}>
        {icon} {label}
      </div>
      <p className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
    </div>
  );
}
