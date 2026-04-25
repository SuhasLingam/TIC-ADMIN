"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Zap, Trash2, Loader2, Users, User, Layers, Network, CheckSquare, Shield } from "lucide-react";

const TIERS = ["Explorer", "Visionary", "Trailblazer"];
const STATUSES = ["available", "scheduled", "in-progress", "active"] as const;
const REC_TYPES = ["event", "founder", "strategy", "hackathon", "mentor", "peer", "co-founder", "collaborator"] as const;
const TASK_TYPES = ["validation", "product", "gtm", "execution"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

type Target = "all" | "tier" | "user";
type Tab = "deliverable" | "recommendation" | "task";

const BTN_ACTIVE = "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent";
const BTN_INACTIVE = "border-[var(--border)] text-[var(--foreground)]/50 hover:border-[var(--foreground)]/30";

const STATUS_BADGE: Record<string, string> = {
  available:    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  scheduled:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  "in-progress":"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  active:       "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
};

export default function BroadcastPage() {
  const [tab, setTab] = useState<Tab>("deliverable");
  const [targetType, setTargetType] = useState<Target>("all");
  const [selectedTier, setSelectedTier] = useState("Explorer");
  const [selectedUser, setSelectedUser] = useState("");
  
  const [form, setForm] = useState({ title: "", description: "", status: "available" as typeof STATUSES[number] });
  const [recForm, setRecForm] = useState({ title: "", reason: "", type: "founder" as typeof REC_TYPES[number], relevanceScore: 80 });
  const [taskForm, setTaskForm] = useState({ 
    title: "", 
    description: "", 
    category: "Execution", 
    priority: "medium" as typeof PRIORITIES[number],
    type: "execution" as typeof TASK_TYPES[number]
  });
  
  const [lastResult, setLastResult] = useState<{ count: number } | null>(null);

  const utils = api.useUtils();
  const { data: members } = api.broadcast.getMembers.useQuery();
  const { data: deliverables, isLoading: dLoading } = api.broadcast.getDeliverables.useQuery();
  const { data: allRecs, isLoading: rLoading } = api.broadcast.getRecommendations.useQuery();

  const broadcast = api.broadcast.broadcastDeliverable.useMutation({
    onSuccess: (data) => { setLastResult({ count: data.count }); void utils.broadcast.getDeliverables.invalidate(); setForm({ title: "", description: "", status: "available" }); },
  });
  const broadcastRec = api.broadcast.broadcastRecommendation.useMutation({
    onSuccess: (data) => { setLastResult({ count: data.count }); void utils.broadcast.getRecommendations.invalidate(); setRecForm({ title: "", reason: "", type: "founder", relevanceScore: 80 }); },
  });
  const broadcastTask = api.broadcast.broadcastTask.useMutation({
    onSuccess: (data) => { setLastResult({ count: data.count }); setTaskForm({ title: "", description: "", category: "Execution", priority: "medium", type: "execution" }); },
  });

  const del = api.broadcast.deleteDeliverable.useMutation({ onSuccess: () => { void utils.broadcast.getDeliverables.invalidate(); } });
  const delRec = api.broadcast.deleteRecommendation.useMutation({ onSuccess: () => { void utils.broadcast.getRecommendations.invalidate(); } });

  const getTarget = () => targetType === "all" ? "all" : targetType === "tier" ? selectedTier : selectedUser;

  const TARGET_OPTS: { key: Target; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { key: "all",  icon: Users,  label: "All Members" },
    { key: "tier", icon: Layers, label: "By Tier" },
    { key: "user", icon: User,   label: "Specific User" },
  ];

  // Shared target selector block
  const TargetSelector = () => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Send To</label>
      <div className="flex gap-2 flex-wrap">
        {TARGET_OPTS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => { setTargetType(key); setLastResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${targetType === key ? BTN_ACTIVE : BTN_INACTIVE}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>
      {targetType === "tier" && (
        <div className="flex gap-2 mt-2">
          {TIERS.map(t => (
            <button key={t} onClick={() => setSelectedTier(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedTier === t ? BTN_ACTIVE : BTN_INACTIVE}`}>
              {t}
            </button>
          ))}
        </div>
      )}
      {targetType === "user" && (
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="input-field mt-2">
          <option value="">— Select member —</option>
          {members?.map(m => (
            <option key={m.id} value={m.id}>{m.fullName} ({m.email}) · {m.tier}</option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Broadcast Center</h1>
        <p className="text-sm text-[var(--foreground)]/40 mt-0.5">Push deliverables, recommendations, and strategic tasks to members.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 w-fit">
        {([["deliverable", "Deliverables"], ["recommendation", "Recommendations"], ["task", "Kanban Tasks"]] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setLastResult(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === key ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── DELIVERABLES TAB ── */}
      {tab === "deliverable" && (
        <>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">New Deliverable Broadcast</h3>
            <TargetSelector />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Deliverable Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Brand Architecture & Narrative" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none h-20" placeholder="What does this deliverable contain?" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof STATUSES[number] }))} className="input-field">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {lastResult && <div className="px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-sm text-green-700 dark:text-green-400 font-medium">✓ Sent to {lastResult.count} member{lastResult.count !== 1 ? "s" : ""}</div>}
            <div className="flex justify-end">
              <button onClick={() => broadcast.mutate({ target: getTarget(), ...form })}
                disabled={broadcast.isPending || !form.title || (targetType === "user" && !selectedUser)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-80 transition-opacity">
                {broadcast.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Broadcast Deliverable
              </button>
            </div>
          </div>

          {/* Deliverables log */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40 mb-3">Deliverable Log</h2>
            {dLoading ? <div className="flex items-center justify-center py-12 gap-2 text-[var(--foreground)]/30"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
              : !deliverables?.length ? <div className="text-center py-12 text-[var(--foreground)]/30 text-sm">No deliverables pushed yet.</div>
              : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  {deliverables.map((d, i) => {
                    const member = members?.find(m => m.id === d.profileId);
                    return (
                      <div key={d.id} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[var(--foreground)] truncate">{d.title}</p>
                          <p className="text-xs text-[var(--foreground)]/40 mt-0.5">{member ? `${member.fullName} · ${member.tier}` : d.profileId}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_BADGE[d.status] ?? ""}`}>{d.status}</span>
                          <button onClick={() => del.mutate({ id: d.id })} className="p-2 rounded-lg text-[var(--foreground)]/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </>
      )}

      {/* ── RECOMMENDATIONS TAB ── */}
      {tab === "recommendation" && (
        <>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">New Recommendation / Network Suggestion</h3>
            <TargetSelector />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Title (Founder / Strategy / Event name)</label>
                <input value={recForm.title} onChange={e => setRecForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Ravi Kumar — GTM Expert" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Type</label>
                <select value={recForm.type} onChange={e => setRecForm(f => ({ ...f, type: e.target.value as typeof REC_TYPES[number] }))} className="input-field">
                  {REC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Relevance Score (0–100)</label>
                <input type="number" min={0} max={100} value={recForm.relevanceScore} onChange={e => setRecForm(f => ({ ...f, relevanceScore: +e.target.value }))} className="input-field" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Reason / Context</label>
                <textarea value={recForm.reason} onChange={e => setRecForm(f => ({ ...f, reason: e.target.value }))} className="input-field resize-none h-16" placeholder="Why is this relevant for this founder?" />
              </div>
            </div>
            {lastResult && <div className="px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-sm text-green-700 dark:text-green-400 font-medium">✓ Sent to {lastResult.count} member{lastResult.count !== 1 ? "s" : ""}</div>}
            <div className="flex justify-end">
              <button onClick={() => broadcastRec.mutate({ target: getTarget(), ...recForm })}
                disabled={broadcastRec.isPending || !recForm.title || (targetType === "user" && !selectedUser)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-80 transition-opacity">
                {broadcastRec.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Network className="w-3.5 h-3.5" />}
                Broadcast Recommendation
              </button>
            </div>
          </div>

          {/* Rec log */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40 mb-3">Recommendation Log</h2>
            {rLoading ? <div className="flex items-center justify-center py-12 gap-2 text-[var(--foreground)]/30"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
              : !allRecs?.length ? <div className="text-center py-12 text-[var(--foreground)]/30 text-sm">No recommendations pushed yet.</div>
              : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  {allRecs.map((r, i) => {
                    const member = members?.find(m => m.id === r.profileId);
                    return (
                      <div key={r.id} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[var(--foreground)] truncate">{r.title}</p>
                          <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                            {member ? `${member.fullName} · ${member.tier}` : r.profileId} · <span className="capitalize">{r.type}</span>
                            {r.reason && ` · "${r.reason}"`}
                          </p>
                        </div>
                        <button onClick={() => delRec.mutate({ id: r.id })} className="p-2 rounded-lg text-[var(--foreground)]/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </>
      )}

      {/* ── KANBAN TASKS TAB ── */}
      {tab === "task" && (
        <>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                  <CheckSquare className="w-3.5 h-3.5 text-white dark:text-zinc-900" />
               </div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/60">New Kanban Task Broadcast</h3>
            </div>
            
            <TargetSelector />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Task Title</label>
                <input 
                  value={taskForm.title} 
                  onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} 
                  className="input-field" 
                  placeholder="e.g. Conduct 10 user interviews" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Category</label>
                <input 
                  value={taskForm.category} 
                  onChange={e => setTaskForm(f => ({ ...f, category: e.target.value }))} 
                  className="input-field" 
                  placeholder="e.g. Research, Product, GTM" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Priority</label>
                <select 
                  value={taskForm.priority} 
                  onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value as typeof PRIORITIES[number] }))} 
                  className="input-field"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()} Priority</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Task Type</label>
                <select 
                  value={taskForm.type} 
                  onChange={e => setTaskForm(f => ({ ...f, type: e.target.value as typeof TASK_TYPES[number] }))} 
                  className="input-field"
                >
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/40">Strategic Description (Optional)</label>
                <textarea 
                  value={taskForm.description} 
                  onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} 
                  className="input-field resize-none h-24" 
                  placeholder="Provide context for the founder on why this task is critical..." 
                />
              </div>
            </div>

            {lastResult && (
              <div className="px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-sm text-green-700 dark:text-green-400 font-medium animate-in fade-in slide-in-from-top-1">
                ✓ Successfully deployed to {lastResult.count} member{lastResult.count !== 1 ? "s" : ""} execution board.
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => broadcastTask.mutate({ target: getTarget(), ...taskForm })}
                disabled={broadcastTask.isPending || !taskForm.title || (targetType === "user" && !selectedUser)}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold uppercase tracking-widest disabled:opacity-40 hover:opacity-90 transition-all shadow-lg shadow-zinc-500/10"
              >
                {broadcastTask.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Deploy Strategic Task
              </button>
            </div>
          </div>
          
          <div className="bg-amber-50/50 dark:bg-amber-400/5 border border-amber-200/50 dark:border-amber-400/10 rounded-2xl p-6 flex gap-4">
             <Shield className="w-5 h-5 text-amber-500 shrink-0" />
             <div className="space-y-1">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Execution Guardrail</p>
                <p className="text-xs text-amber-700/60 dark:text-amber-400/60 leading-relaxed">
                   Broadcasting a task will inject it directly into the &quot;To Do&quot; column of the member&apos;s Execution Board. Use this for mandatory founder onboarding steps or critical ecosystem requirements.
                </p>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
