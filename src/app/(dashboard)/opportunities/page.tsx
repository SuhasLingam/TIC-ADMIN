"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Plus, Trash2, Loader2 } from "lucide-react";

const OPP_TYPES = ["hackathon", "internal_event", "collaboration"] as const;

export default function OpportunitiesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "hackathon" as typeof OPP_TYPES[number],
    title: "", description: "", tags: "", startDate: "", endDate: "",
    eligibilityTiers: [] as string[],
  });

  const utils = api.useUtils();
  const { data: opps, isLoading } = api.broadcast.getOpportunities.useQuery();
  const create = api.broadcast.createOpportunity.useMutation({
    onSuccess: () => { void utils.broadcast.getOpportunities.invalidate(); setShowForm(false); },
  });
  const del = api.broadcast.deleteOpportunity.useMutation({
    onSuccess: () => { void utils.broadcast.getOpportunities.invalidate(); },
  });

  const TYPE_BADGE: Record<string, string> = {
    hackathon:      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    internal_event: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    collaboration:  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  };

  const toggleTier = (t: string) => setForm(f => ({
    ...f,
    eligibilityTiers: f.eligibilityTiers.includes(t)
      ? f.eligibilityTiers.filter(x => x !== t)
      : [...f.eligibilityTiers, t],
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Opportunities</h1>
          <p className="text-sm text-[var(--foreground)]/40 mt-0.5">Hackathons, events, and collaboration postings for members.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity">
          <Plus className="w-4 h-4" /> New Opportunity
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">New Opportunity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Build for Bharat Hackathon" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof OPP_TYPES[number] }))} className="input-field">
                {OPP_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="B2C, D2C, Mobile" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none h-20" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Eligible Tiers</label>
              <div className="flex gap-2">
                {["Explorer", "Visionary", "Trailblazer"].map(t => (
                  <button key={t} onClick={() => toggleTier(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.eligibilityTiers.includes(t) ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent" : "border-[var(--border)] text-[var(--foreground)]/50 hover:border-[var(--foreground)]/30"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors">Cancel</button>
            <button onClick={() => create.mutate({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) })}
              disabled={create.isPending || !form.title}
              className="flex items-center gap-2 px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold disabled:opacity-40">
              {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-[var(--foreground)]/30"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : opps?.length === 0 ? (
        <div className="text-center py-16 text-[var(--foreground)]/30 text-sm">No opportunities yet.</div>
      ) : (
        <div className="space-y-3">
          {opps?.map((opp) => (
            <div key={opp.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${TYPE_BADGE[opp.type] ?? ""}`}>{opp.type.replace("_", " ")}</span>
                </div>
                <p className="font-semibold text-[var(--foreground)] truncate">{opp.title}</p>
                {opp.description && <p className="text-xs text-[var(--foreground)]/40 mt-0.5 truncate">{opp.description}</p>}
              </div>
              <button onClick={() => del.mutate({ id: opp.id })}
                className="p-2 rounded-lg text-[var(--foreground)]/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
