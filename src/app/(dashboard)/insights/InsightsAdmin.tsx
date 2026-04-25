"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Target,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  Globe,
  BarChart3,
  FileText,
  Search,
  Clock
} from "lucide-react";
import { toast } from "sonner";

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "Market Report": Globe,
  "Intelligence": Target,
  "R&D": BarChart3,
  "Strategy": FileText,
};

export default function InsightsAdmin() {
  const utils = api.useUtils();
  const { data: insights, isLoading } = api.broadcast.getInsights.useQuery();

  const createMutation = api.broadcast.createInsight.useMutation({
    onSuccess: () => {
      toast.success("Intelligence report deployed");
      void utils.broadcast.getInsights.invalidate();
      setIsAdding(false);
    }
  });

  const deleteMutation = api.broadcast.deleteInsight.useMutation({
    onSuccess: () => {
      toast.success("Intelligence purged");
      void utils.broadcast.getInsights.invalidate();
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Intelligence",
    summary: "",
    readTime: "10 min",
    date: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    contentUrl: "",
    tierRequired: "Explorer" as "All" | "Explorer" | "Visionary" | "Trailblazer"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-500" />
            </div>
            <h1 className="font-heading text-4xl tracking-tight text-zinc-900 dark:text-white">Intelligence Matrix</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">
            Manage proprietary R&D, market reports, and strategic intelligence frameworks for the ecosystem.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-zinc-500/10"
        >
          <Plus className="w-4 h-4" /> Deploy Intelligence
        </button>
      </div>

      {/* Stats / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Intelligence", val: insights?.length ?? 0, icon: FileText },
          { label: "Market Reports", val: insights?.filter(i => i.type === "Market Report").length ?? 0, icon: Globe },
          { label: "Proprietary R&D", val: insights?.filter(i => i.type === "R&D").length ?? 0, icon: BarChart3 },
          { label: "Strategic Frameworks", val: insights?.filter(i => i.type === "Strategy").length ?? 0, icon: Target },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{s.label}</p>
              <p className="text-2xl font-heading text-zinc-900 dark:text-white">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Intelligence Directory</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input type="text" placeholder="Search directory..." className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-9 py-1.5 text-[10px] w-48 outline-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                <th className="px-8 py-4">Report</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Required Tier</th>
                <th className="px-8 py-4">Date / Read Time</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {insights?.map((insight) => {
                const Icon = TYPE_ICON[insight.type] ?? BarChart3;
                return (
                  <tr key={insight.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                          <Icon className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-md">{insight.title}</p>
                          <p className="text-[10px] text-zinc-400 line-clamp-1 max-w-sm">{insight.summary ?? "No summary provided."}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{insight.type}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${insight.tierRequired === 'Trailblazer' ? 'bg-purple-500' :
                            insight.tierRequired === 'Visionary' ? 'bg-amber-500' :
                              insight.tierRequired === 'Explorer' ? 'bg-blue-500' : 'bg-zinc-400'
                          }`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{insight.tierRequired}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{insight.date}</span>
                        <span className="text-[9px] text-zinc-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {insight.readTime ?? "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {insight.contentUrl && (
                          <a href={insight.contentUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-amber-500 text-zinc-400 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Confirm purge of this intelligence node?")) {
                              deleteMutation.mutate({ id: insight.id });
                            }
                          }}
                          className="p-2 hover:text-red-500 text-zinc-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {insights?.length === 0 && !isLoading && (
            <div className="py-20 text-center text-zinc-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-xs uppercase tracking-widest font-bold">No intelligence deployed yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
              <h3 className="font-heading text-xl">Deploy Intelligence Node</h3>
              <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Report Title</label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
                    placeholder="e.g. 2026 AI Infrastructure Market Map"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Intelligence Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
                  >
                    <option>Intelligence</option>
                    <option>Market Report</option>
                    <option>R&D</option>
                    <option>Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Access Tier</label>
                  <select
                    value={formData.tierRequired}
                    onChange={e => setFormData({ ...formData, tierRequired: e.target.value as "All" | "Explorer" | "Visionary" | "Trailblazer" })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
                  >
                    <option value="All">All Members</option>
                    <option value="Explorer">Explorer +</option>
                    <option value="Visionary">Visionary +</option>
                    <option value="Trailblazer">Trailblazer Only</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Summary Preview</label>
                  <textarea
                    rows={3}
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-amber-500/50 outline-none resize-none"
                    placeholder="Brief summary for the dashboard card..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Content URL (PDF/Notion)</label>
                  <input
                    value={formData.contentUrl}
                    onChange={e => setFormData({ ...formData, contentUrl: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Estimated Read Time</label>
                  <input
                    value={formData.readTime}
                    onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
                    placeholder="e.g. 12 min"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? "Deploying..." : "Deploy Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
