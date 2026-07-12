"use client";

// components/shared/PillTabs.tsx
// Pill-style sub-navigation row (active pill = filled orange), per the mockup.

import { cn } from "@/lib/utils";

export interface PillTab {
  key: string;
  label: string;
  count?: number;
}

export default function PillTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: PillTab[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-300",
              active
                ? "border-primary/50 bg-primary/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "border-white/5 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold flex items-center justify-center",
                  active
                    ? "bg-primary text-background"
                    : "bg-white/10 text-muted-foreground"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
