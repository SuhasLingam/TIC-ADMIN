"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { X, Loader2, Send, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

type Application = {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    startupName: string;
    website: string | null;
    pitchDeck: string | null;
    overview: string;
    founderStage: string;
    primaryGoal: string;
    monthlyRevenue: string | null;
    tier: string;
    status: string;
    createdAt: Date;
    updatedAt: Date | null;
};

type Props = {
    application: Application;
    onClose: () => void;
    onStatusChange: () => void;
};

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    reviewed: { label: "Reviewed", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    approved: { label: "Approved", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const TIER_CONFIG: Record<string, string> = {
    Trailblazer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Visionary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Explorer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function ApplicationModal({ application, onClose, onStatusChange }: Props) {
    const [calendlyLink, setCalendlyLink] = useState("");
    const [sent, setSent] = useState<string | null>(null); // tracks which email was sent

    const utils = api.useUtils();

    const refresh = () => {
        void utils.application.getAll.invalidate();
        onStatusChange();
    };

    const updateStatus = api.application.updateStatus.useMutation({ onSuccess: refresh });
    const sendReview = api.application.sendReviewEmail.useMutation({
        onSuccess: () => { setSent("review"); refresh(); },
    });
    const sendAccept = api.application.sendAcceptanceEmail.useMutation({
        onSuccess: () => { setSent("accept"); refresh(); },
    });
    const sendReject = api.application.sendRejectionEmail.useMutation({
        onSuccess: () => { setSent("reject"); refresh(); },
    });

    const isMutating =
        updateStatus.isPending || sendReview.isPending ||
        sendAccept.isPending || sendReject.isPending;

    const statusCfg = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
    const tierColor = TIER_CONFIG[application.tier] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl bg-[#0f0f0f] border border-[var(--foreground)]/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--foreground)]/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center text-sm font-heading">
                            {application.name[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-heading text-base">{application.name}</p>
                            <p className="text-xs text-[var(--foreground)]/50">{application.email} · {application.mobileNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors text-[var(--foreground)]/50 hover:text-[var(--foreground)]">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase border ${tierColor}`}>
                            {application.tier}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase border ${statusCfg.color}`}>
                            {statusCfg.label}
                        </span>
                        <span className="text-xs text-[var(--foreground)]/40 ml-auto">
                            {format(application.createdAt, "MMM d, yyyy · h:mm a")}
                        </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <InfoRow label="Startup" value={application.startupName} />
                        <InfoRow label="Founder Stage" value={application.founderStage} />
                        <InfoRow label="Monthly Revenue" value={application.monthlyRevenue ?? "—"} />
                        <InfoRow label="Primary Goal" value={application.primaryGoal} />
                        {application.website && <InfoRow label="Website" value={application.website} isLink />}
                        {application.pitchDeck && <InfoRow label="Pitch Deck" value={application.pitchDeck} isLink />}
                    </div>

                    {/* Overview */}
                    <div className="space-y-1.5">
                        <p className="text-[11px] uppercase tracking-wider text-[var(--foreground)]/40">Overview</p>
                        <p className="text-sm text-[var(--foreground)]/80 leading-relaxed whitespace-pre-wrap border-l-2 border-[var(--foreground)]/10 pl-3">
                            {application.overview}
                        </p>
                    </div>

                    {/* ── EMAIL ACTIONS ─────────────────────────────────── */}
                    <div className="border border-[var(--foreground)]/10 rounded-xl p-4 space-y-4">
                        <p className="text-xs uppercase tracking-widest text-[var(--foreground)]/40">Send Email to Applicant</p>

                        {/* Success notice */}
                        {sent && (
                            <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Email sent successfully.
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {/* Under Review */}
                            <EmailAction
                                label="Mark Under Review"
                                description={`Notifies ${application.name.split(" ")[0]} that we're reviewing their application & updates status.`}
                                icon={<Clock className="w-4 h-4" />}
                                color="text-blue-400 border-blue-500/20 hover:bg-blue-500/5"
                                loading={sendReview.isPending}
                                disabled={isMutating || application.status === "reviewed"}
                                onClick={() => sendReview.mutate({ id: application.id })}
                            />

                            {/* Acceptance with Calendly */}
                            <div className="border border-[var(--foreground)]/10 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Send Acceptance Email
                                </div>
                                <p className="text-[11px] text-[var(--foreground)]/40">
                                    Sends a shortlist email with a scheduling link. Updates status to Approved.
                                </p>
                                <input
                                    type="url"
                                    placeholder="Calendly / booking link (optional)"
                                    value={calendlyLink}
                                    onChange={(e) => setCalendlyLink(e.target.value)}
                                    className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-md px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 outline-none focus:border-[var(--foreground)]/20"
                                />
                                <button
                                    disabled={isMutating || application.status === "approved"}
                                    onClick={() => sendAccept.mutate({ id: application.id, calendlyLink: calendlyLink || undefined })}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {sendAccept.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                    Send & Approve
                                </button>
                            </div>

                            {/* Rejection */}
                            <EmailAction
                                label="Send Rejection Email"
                                description={`Respectfully declines the application. Updates status to Rejected.`}
                                icon={<XCircle className="w-4 h-4" />}
                                color="text-red-400 border-red-500/20 hover:bg-red-500/5"
                                loading={sendReject.isPending}
                                disabled={isMutating || application.status === "rejected"}
                                onClick={() => sendReject.mutate({ id: application.id })}
                            />
                        </div>
                    </div>

                    {/* ── STATUS ONLY (no email) ─────────────────────────── */}
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-widest text-[var(--foreground)]/40">Change Status Only (no email)</p>
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    disabled={isMutating || application.status === key}
                                    onClick={() => updateStatus.mutate({ id: application.id, status: key })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed
                    ${application.status === key
                                            ? `${cfg.color} cursor-default`
                                            : "border-[var(--foreground)]/10 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
                                        }`}
                                >
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────

function InfoRow({ label, value, isLink = false }: { label: string; value: string; isLink?: boolean }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/40">{label}</p>
            {isLink ? (
                <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline truncate block">
                    {value}
                </a>
            ) : (
                <p className="text-sm text-[var(--foreground)]/80">{value}</p>
            )}
        </div>
    );
}

function EmailAction({
    label, description, icon, color, loading, disabled, onClick,
}: {
    label: string; description: string; icon: React.ReactNode;
    color: string; loading: boolean; disabled: boolean; onClick: () => void;
}) {
    return (
        <div className="border border-[var(--foreground)]/10 rounded-lg p-3 space-y-2">
            <div className={`flex items-center gap-2 text-xs font-medium ${color.split(" ")[0]}`}>
                {icon} {label}
            </div>
            <p className="text-[11px] text-[var(--foreground)]/40">{description}</p>
            <button
                disabled={disabled}
                onClick={onClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Send Email
            </button>
        </div>
    );
}
