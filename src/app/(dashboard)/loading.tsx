import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header skeleton */}
            <div>
                <div className="h-8 w-48 bg-[var(--foreground)]/5 rounded-lg animate-pulse" />
                <div className="h-4 w-72 bg-[var(--foreground)]/5 rounded-lg animate-pulse mt-2" />
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 h-24 animate-pulse" />
                ))}
            </div>

            {/* Toolbar skeleton */}
            <div className="h-14 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse" />

            {/* Table skeleton */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="h-12 border-b border-[var(--border)] animate-pulse bg-[var(--foreground)]/[0.02]" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 border-b border-[var(--border)] last:border-0 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                ))}
            </div>

            <div className="flex items-center justify-center gap-2 py-4 text-[var(--foreground)]/30 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading applications...
            </div>
        </div>
    );
}
