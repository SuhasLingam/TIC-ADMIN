"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Users, 
  Search, 
  Shield, 
  CheckCircle2, 
  Circle, 
  User,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const MILESTONE_STEPS = [
  { key: "problem_validated", label: "Problem Validated" },
  { key: "icp_defined",       label: "ICP Defined" },
  { key: "mvp_built",         label: "MVP Built" },
  { key: "first_revenue",     label: "First Revenue" },
];

export default function MembersProgressPage() {
  const [search, setSearch] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const { data: members, isLoading: membersLoading } = api.broadcast.getMembers.useQuery();
  const { data: milestones, refetch: refetchMilestones } = api.broadcast.getMemberMilestones.useQuery(
    { profileId: selectedProfileId! },
    { enabled: !!selectedProfileId }
  );

  const completeMutation = api.broadcast.completeMilestone.useMutation({
    onSuccess: () => {
      toast.success("Progress updated");
      void refetchMilestones();
    }
  });

  const updateNotesMutation = api.broadcast.updateMemberNotes.useMutation({
    onSuccess: () => {
      toast.success("Notes saved");
    }
  });

  const filteredMembers = members?.filter(m => 
    m.fullName.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMember = members?.find(m => m.id === selectedProfileId);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Left Column: Member List */}
      <div className="w-96 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Ecosystem Members</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-9 py-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {membersLoading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
          ) : filteredMembers?.map(m => (
            <button 
              key={m.id}
              onClick={() => setSelectedProfileId(m.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all ${
                selectedProfileId === m.id 
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/10" 
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-sm truncate pr-2">{m.fullName}</p>
                <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                  selectedProfileId === m.id ? "border-white/20 bg-white/10" : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                }`}>
                  {m.tier}
                </span>
              </div>
              <p className={`text-[10px] truncate ${selectedProfileId === m.id ? "opacity-60" : "opacity-40"}`}>
                {m.companyName ?? "No Company"} · {m.email}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Execution Progress */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        {selectedMember ? (
          <>
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-500" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-heading text-zinc-900 dark:text-white">{selectedMember.fullName}</h2>
                      <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">{selectedMember.companyName ?? "Propelling Startup"}</p>
                   </div>
                </div>
              </div>
              <a href={`mailto:${selectedMember.email}`} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
                Contact Founder <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-1">Execution Guardrails</h3>
                    <p className="text-[11px] text-zinc-400">Manually override or validate key ecosystem milestones.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MILESTONE_STEPS.map((step) => {
                    const m = milestones?.find(ms => ms.key === step.key);
                    const done = !!m?.completedAt;
                    
                    return (
                      <div 
                        key={step.key}
                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                          done 
                            ? "bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20" 
                            : "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            done ? "bg-green-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                          }`}>
                            {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{step.label}</p>
                            <p className="text-[10px] text-zinc-400">
                              {m?.completedAt ? `Validated on ${new Date(m.completedAt).toLocaleDateString()}` : "Pending validation"}
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => completeMutation.mutate({ 
                            profileId: selectedProfileId!, 
                            key: step.key, 
                            completed: !done 
                          })}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            done 
                              ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" 
                              : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
                          }`}
                        >
                          {done ? "Revoke" : "Validate"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Founder Motivation</h3>
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Why TIC?</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-all">{selectedMember.whyTic ?? "No motivation provided"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Internal Founder Context</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Main Goal</p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 break-all">{selectedMember.mainGoal ?? "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Startup Stage</p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 break-all">{selectedMember.startupStage ?? "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Private Admin Notes</p>
                      <textarea 
                        className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                        placeholder="Add surgical context on this founder..."
                        defaultValue={selectedMember.internalNotes ?? ""}
                        onBlur={(e) => {
                          if (e.target.value !== selectedMember.internalNotes) {
                            updateNotesMutation.mutate({ profileId: selectedMember.id, notes: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
            <User className="w-16 h-16 mb-4" />
            <p className="font-heading text-2xl">No member selected</p>
            <p className="text-sm max-w-xs">Select a founder from the left to audit their execution progress and milestones.</p>
          </div>
        )}
      </div>
    </div>
  );
}
