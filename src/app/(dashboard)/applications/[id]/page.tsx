"use client";

import { api } from "~/trpc/react";
import { use, useState } from "react";
import {
    ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, Send, PenLine,
    Globe, FileText, Phone, Building2, Target, DollarSign, Mail
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    reviewed: { label: "Reviewed", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    approved: { label: "Approved", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const TIER_CONFIG: Record<string, string> = {
    Trailblazer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Visionary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Explorer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const appId = parseInt(id, 10);
    const [calendlyLink, setCalendlyLink] = useState("");
    const [emailSent, setEmailSent] = useState<string | null>(null);
    const [customSubject, setCustomSubject] = useState("");
    const [customBody, setCustomBody] = useState("");

    const utils = api.useUtils();
    const { data: app, isLoading } = api.application.getById.useQuery({ id: appId });

    const refresh = () => void utils.application.getById.invalidate({ id: appId });

    const updateStatus = api.application.updateStatus.useMutation({ onSuccess: refresh });
    const sendReview = api.application.sendReviewEmail.useMutation({ onSuccess: () => { setEmailSent("review"); refresh(); } });
    const sendAccept = api.application.sendAcceptanceEmail.useMutation({ onSuccess: () => { setEmailSent("accept"); refresh(); } });
    const sendReject = api.application.sendRejectionEmail.useMutation({ onSuccess: () => { setEmailSent("reject"); refresh(); } });
    const sendCustom = api.application.sendCustomEmail.useMutation({ onSuccess: () => { setEmailSent("custom"); setCustomSubject(""); setCustomBody(""); } });

    const isMutating = updateStatus.isPending || sendReview.isPending || sendAccept.isPending || sendReject.isPending || sendCustom.isPending;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-[var(--foreground)]/40">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
        );
    }

    if (!app) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-[var(--foreground)]/40">Application not found.</p>
                <Link href="/" className="text-sm underline text-[var(--foreground)]/60 hover:text-[var(--foreground)]">← Back</Link>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
    const tierColor = TIER_CONFIG[app.tier] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)] border-[var(--border)]";

    return (
        <div className="w-full flex flex-col gap-6">

            {/* Back nav */}
            <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors w-fit uppercase tracking-widest">
                <ArrowLeft className="w-3.5 h-3.5" /> Applications
            </Link>

            {/* ── Banner ────────────────────────────────────────────────────── */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                {/* Top accent strip */}
                <div className={`h-1 w-full ${app.tier === "Trailblazer" ? "bg-purple-500" : app.tier === "Visionary" ? "bg-amber-400" : "bg-blue-500"}`} />

                <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-heading flex-shrink-0
            ${app.tier === "Trailblazer" ? "bg-purple-500/10 text-purple-400" :
                            app.tier === "Visionary" ? "bg-amber-500/10 text-amber-400" :
                                "bg-blue-500/10 text-blue-400"}`}>
                        {app.name[0]?.toUpperCase()}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-heading tracking-tight truncate">{app.name}</h1>
                        <p className="text-sm text-[var(--foreground)]/50 mt-1">{app.startupName}</p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide border ${tierColor}`}>{app.tier}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide border ${statusCfg.color}`}>{statusCfg.label}</span>
                        </div>
                    </div>

                    {/* Contact quick-links */}
                    <div className="flex flex-col gap-2 text-xs text-[var(--foreground)]/50 flex-shrink-0">
                        <a href={`mailto:${app.email}`} className="flex items-center gap-2 hover:text-[var(--foreground)] transition-colors">
                            <Mail className="w-3.5 h-3.5" /> {app.email}
                        </a>
                        <span className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> {app.mobileNumber}
                        </span>
                        <span className="text-[var(--foreground)]/30 text-[11px] mt-1">
                            Applied {format(app.createdAt, "MMM d, yyyy")}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Main Grid ─────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6">

                {/* ── Left Column ──────────────────────────────────────────── */}
                <div className="flex flex-col gap-5">

                    {/* Quick facts */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                        <SectionTitle>Startup Details</SectionTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-5 mt-4">
                            <Fact icon={<Target className="w-3.5 h-3.5" />} label="Stage" value={app.founderStage} />
                            <Fact icon={<DollarSign className="w-3.5 h-3.5" />} label="Monthly Revenue" value={app.monthlyRevenue ?? "—"} />
                            {app.website && (
                                <Fact icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={app.website} isLink />
                            )}
                            {app.pitchDeck && (
                                <Fact icon={<FileText className="w-3.5 h-3.5" />} label="Pitch Deck" value="View →" isLink href={app.pitchDeck} />
                            )}
                            <Fact icon={<Building2 className="w-3.5 h-3.5" />} label="Company" value={app.startupName} />
                        </div>
                    </div>

                    {/* Primary Goal */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                        <SectionTitle>Primary Goal</SectionTitle>
                        <p className="text-sm text-[var(--foreground)]/80 leading-relaxed mt-3">{app.primaryGoal}</p>
                    </div>

                    {/* Overview */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                        <SectionTitle>Founder&apos;s Overview</SectionTitle>
                        <p className="text-sm text-[var(--foreground)]/80 leading-[1.8] mt-3 whitespace-pre-wrap">
                            {app.overview}
                        </p>
                    </div>
                </div>

                {/* ── Right Column ─────────────────────────────────────────── */}
                <div className="flex flex-col gap-5">

                    {/* Email Actions */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                        <SectionTitle>Send Email</SectionTitle>

                        {emailSent && (
                            <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mt-3">
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Email sent successfully.
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mt-4">
                            {/* Under Review */}
                            <EmailRow
                                label="Under Review"
                                accent="text-blue-400"
                                bg="border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                icon={<Clock className="w-3.5 h-3.5" />}
                                loading={sendReview.isPending}
                                disabled={isMutating || app.status === "reviewed"}
                                onClick={() => sendReview.mutate({ id: app.id })}
                            />

                            {/* Acceptance */}
                            <div className="rounded-xl border border-[var(--border)] p-3 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-green-500">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Acceptance
                                </div>
                                <input
                                    type="url"
                                    placeholder="Calendly link (optional)"
                                    value={calendlyLink}
                                    onChange={(e) => setCalendlyLink(e.target.value)}
                                    className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 outline-none"
                                />
                                <button
                                    disabled={isMutating || app.status === "approved"}
                                    onClick={() => sendAccept.mutate({ id: app.id, calendlyLink: calendlyLink || undefined })}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {sendAccept.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                    Send & Approve
                                </button>
                            </div>

                            {/* Rejection */}
                            <EmailRow
                                label="Rejection"
                                accent="text-red-400"
                                bg="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                icon={<XCircle className="w-3.5 h-3.5" />}
                                loading={sendReject.isPending}
                                disabled={isMutating || app.status === "rejected"}
                                onClick={() => sendReject.mutate({ id: app.id })}
                            />
                        </div>
                    </div>

                    {/* Status Controls */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                        <div className="border-b border-[var(--border)] p-5">
                            <div className="flex items-center gap-2 text-[var(--foreground)]/70">
                                <PenLine className="w-3.5 h-3.5" />
                                <SectionTitle>Custom Email</SectionTitle>
                            </div>
                            <p className="text-[11px] text-[var(--foreground)]/40 mt-1">Compose a free-form message using the TIC template.</p>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/40">Subject</label>
                                <input
                                    type="text"
                                    placeholder="e.g. A quick question about your application"
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/25 outline-none focus:border-[var(--foreground)]/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/40">Body</label>
                                <textarea
                                    rows={6}
                                    placeholder={"Write your message here...\n\n(The greeting 'Hello [Name],' and the TIC sign-off are added automatically.)"}
                                    value={customBody}
                                    onChange={(e) => setCustomBody(e.target.value)}
                                    className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/25 outline-none focus:border-[var(--foreground)]/20 resize-none leading-relaxed"
                                />
                            </div>
                            <button
                                disabled={isMutating || !customSubject.trim() || !customBody.trim()}
                                onClick={() => sendCustom.mutate({ id: app.id, subject: customSubject, body: customBody })}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--foreground)]/15 bg-[var(--foreground)]/5 text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {sendCustom.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Send Custom Email
                            </button>
                        </div>
                    </div>

                    {/* Status Controls */}

                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                        <SectionTitle>Update Status</SectionTitle>
                        <p className="text-[11px] text-[var(--foreground)]/40 mt-1 mb-4">Changes status without sending an email.</p>
                        <div className="flex flex-col gap-2">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    disabled={isMutating || app.status === key}
                                    onClick={() => updateStatus.mutate({ id: app.id, status: key })}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border transition-all disabled:cursor-not-allowed
                    ${app.status === key
                                            ? cfg.color
                                            : "border-[var(--border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] disabled:opacity-40"
                                        }`}
                                >
                                    {cfg.label}
                                    {app.status === key && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Small helpers ──────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/40 font-medium">{children}</h2>;
}

function Fact({ icon, label, value, isLink = false, href }: {
    icon: React.ReactNode; label: string; value: string; isLink?: boolean; href?: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[var(--foreground)]/40">{icon}
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
            </div>
            {isLink ? (
                <a href={href ?? (value.startsWith("http") ? value : `https://${value}`)} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline truncate block">{value}</a>
            ) : (
                <p className="text-sm text-[var(--foreground)]/80">{value}</p>
            )}
        </div>
    );
}

function EmailRow({ label, accent, bg, icon, loading, disabled, onClick }: {
    label: string; accent: string; bg: string;
    icon: React.ReactNode; loading: boolean; disabled: boolean; onClick: () => void;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] p-3 flex items-center justify-between gap-3">
            <div className={`flex items-center gap-2 text-xs font-medium ${accent}`}>{icon} {label}</div>
            <button
                disabled={disabled}
                onClick={onClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 ${bg}`}
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Send
            </button>
        </div>
    );
}
