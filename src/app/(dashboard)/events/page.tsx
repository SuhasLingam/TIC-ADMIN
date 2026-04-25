"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Calendar, Plus, Trash2, Loader2, Globe } from "lucide-react";
import { format } from "date-fns";

const ACCESS_LEVELS = ["All Members", "Explorer", "Visionary", "Trailblazer"] as const;
const FORMATS = ["Online", "In-Person", "Hybrid"];

export default function EventsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", purpose: "", date: "", format: "Online",
    accessLevel: "All Members" as typeof ACCESS_LEVELS[number],
  });

  const utils = api.useUtils();
  const { data: events, isLoading } = api.broadcast.getEvents.useQuery();
  const create = api.broadcast.createEvent.useMutation({
    onSuccess: () => { void utils.broadcast.getEvents.invalidate(); setShowForm(false); setForm({ name: "", purpose: "", date: "", format: "Online", accessLevel: "All Members" }); },
  });
  const del = api.broadcast.deleteEvent.useMutation({
    onSuccess: () => { void utils.broadcast.getEvents.invalidate(); },
  });

  const ACCESS_BADGE: Record<string, string> = {
    "All Members": "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    Explorer:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    Visionary:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    Trailblazer:"bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Events</h1>
          <p className="text-sm text-[var(--foreground)]/40 mt-0.5">Create and manage sessions visible to members.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">New Event</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Event Name">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" placeholder="Strategic Roadmap 2026" />
            </FormField>
            <FormField label="Date">
              <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="input-field" />
            </FormField>
            <FormField label="Format">
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} className="input-field">
                {FORMATS.map(f => <option key={f}>{f}</option>)}
              </select>
            </FormField>
            <FormField label="Access Level">
              <select value={form.accessLevel} onChange={e => setForm(f => ({ ...f, accessLevel: e.target.value as typeof ACCESS_LEVELS[number] }))} className="input-field">
                {ACCESS_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </FormField>
            <FormField label="Purpose / Description" className="sm:col-span-2">
              <textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                className="input-field resize-none h-20" placeholder="What is this session about?" />
            </FormField>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors">Cancel</button>
            <button
              onClick={() => create.mutate(form)}
              disabled={create.isPending || !form.name || !form.date || !form.purpose}
              className="flex items-center gap-2 px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-80 transition-opacity"
            >
              {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Event
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-[var(--foreground)]/30 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16 text-[var(--foreground)]/30 text-sm">No events yet. Create your first one above.</div>
      ) : (
        <div className="space-y-3">
          {events?.map((event) => (
            <div key={event.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--foreground)] truncate">{event.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-[var(--foreground)]/40 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {event.format}
                    </span>
                    <span className="text-xs text-[var(--foreground)]/40">
                      {format(event.date, "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ACCESS_BADGE[event.accessLevel] ?? ""}`}>
                  {event.accessLevel}
                </span>
                <button
                  onClick={() => del.mutate({ id: event.id })}
                  className="p-2 rounded-lg text-[var(--foreground)]/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">{label}</label>
      {children}
    </div>
  );
}
