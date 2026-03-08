"use client";

import { useState } from "react";
import { updatePassword } from "~/app/actions/settings";
import { KeyRound, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updatePassword(formData);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        }
        setLoading(false);
    }

    return (
        <div className="w-full flex flex-col gap-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-heading tracking-tight mb-1">Settings</h1>
                <p className="text-sm text-[var(--foreground)]/50">Manage your admin account preferences.</p>
            </div>

            {/* Password Card */}
            <div className="max-w-md">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center">
                            <KeyRound className="w-4 h-4 opacity-60" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Change Password</p>
                            <p className="text-[11px] text-[var(--foreground)]/40 mt-0.5">Update your login password.</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="px-6 py-5">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            <PasswordField
                                name="newPassword"
                                label="New Password"
                                placeholder="Min. 8 characters"
                                show={showNew}
                                onToggle={() => setShowNew(v => !v)}
                            />

                            <PasswordField
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Repeat new password"
                                show={showConfirm}
                                onToggle={() => setShowConfirm(v => !v)}
                            />

                            {error && (
                                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                    Password updated successfully.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PasswordField({
    name, label, placeholder, show, onToggle,
}: {
    name: string; label: string; placeholder: string; show: boolean; onToggle: () => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[var(--foreground)]/40">{label}</label>
            <div className="relative">
                <input
                    name={name}
                    type={show ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder={placeholder}
                    className="w-full bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/25 outline-none focus:border-[var(--foreground)]/30 transition-colors"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30 hover:text-[var(--foreground)]/60 transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
