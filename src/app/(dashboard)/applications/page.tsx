"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Search, 
  Loader2,
  Building2,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  approved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const TIER_BADGE: Record<string, string> = {
  Trailblazer: "border-purple-200 text-purple-700 dark:border-purple-500/20 dark:text-purple-400",
  Visionary: "border-amber-200 text-amber-700 dark:border-amber-500/20 dark:text-amber-400",
  Explorer: "border-blue-200 text-blue-700 dark:border-blue-500/20 dark:text-blue-400",
};

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: applications, isLoading } = api.application.getAll.useQuery();

  const filtered = applications?.filter(app => {
    const matchesSearch = 
      (app.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (app.email.toLowerCase().includes(search.toLowerCase())) ||
      (app.companyName?.toLowerCase().includes(search.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white font-heading">Application Dealflow</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">Review and process ecosystem applicants</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search applicants..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 shadow-sm">
          {["all", "pending", "reviewed", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                statusFilter === s 
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/10" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Founder / Startup</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tier Interest</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">ICP Score</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Applied On</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-20" />
                    <span className="text-xs font-medium uppercase tracking-widest">Loading dealflow...</span>
                  </td>
                </tr>
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-zinc-400 text-sm">
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered?.map((app) => (
                  <tr key={app.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                          {(app.name ?? app.email ?? "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{app.name ?? "Founder"}</p>
                          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                            <Building2 className="w-3 h-3" />
                            <p className="text-[10px] uppercase tracking-wider font-medium">{app.companyName ?? "No Company"}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_BADGE[app.status] ?? ""}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${TIER_BADGE[app.assignedTier ?? app.tierInterest ?? ""] ?? "border-zinc-200 text-zinc-500 opacity-40"}`}>
                        {app.assignedTier ?? app.tierInterest ?? "Explorer"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {app.icpScore ?? "—"} <span className="text-[10px] text-zinc-400 font-normal">/ 20</span>
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-zinc-400 font-medium">
                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all group-hover:shadow-lg group-hover:shadow-zinc-500/10"
                      >
                        Review <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
