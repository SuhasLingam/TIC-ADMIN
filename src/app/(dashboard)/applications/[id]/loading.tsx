import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="w-full flex flex-col gap-6">
            {/* Back nav skeleton */}
            <div className="h-4 w-28 bg-[var(--foreground)]/5 rounded animate-pulse" />

            {/* Banner skeleton */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="h-1 w-full bg-[var(--foreground)]/10 animate-pulse" />
                <div className="p-6 sm:p-8 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--foreground)]/5 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-7 w-48 bg-[var(--foreground)]/5 rounded-lg animate-pulse" />
                        <div className="h-4 w-32 bg-[var(--foreground)]/5 rounded animate-pulse" />
                        <div className="flex gap-2 pt-1">
                            <div className="h-5 w-20 rounded-full bg-[var(--foreground)]/5 animate-pulse" />
                            <div className="h-5 w-16 rounded-full bg-[var(--foreground)]/5 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Body grid skeleton */}
            <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
                <div className="flex flex-col gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 h-40 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                    ))}
                </div>
                <div className="flex flex-col gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 h-32 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 py-4 text-[var(--foreground)]/30 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading application...
            </div>
        </div>
    );
}
