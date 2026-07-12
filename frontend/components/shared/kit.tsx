// components/shared/kit.tsx
// Small shared presentational bits used across Gamification + Reports.

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChallengeStatus, Difficulty } from "@/lib/types";

const STATUS_MAP: Record<ChallengeStatus, { label: string; cls: string }> = {
  draft: {
    label: "Draft",
    cls: "bg-muted text-muted-foreground border-border",
  },
  active: {
    label: "Active",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  "under-review": {
    label: "Under Review",
    cls: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  completed: {
    label: "Completed",
    cls: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  archived: {
    label: "Archived",
    cls: "bg-muted/60 text-muted-foreground/70 border-border",
  },
};

export function StatusPill({ status }: { status: ChallengeStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        s.cls
      )}
    >
      {s.label}
    </span>
  );
}

const DIFFICULTY_MAP: Record<Difficulty, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

export function DifficultyText({ difficulty }: { difficulty: Difficulty }) {
  return <span className={DIFFICULTY_MAP[difficulty]}>{difficulty}</span>;
}

export function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <Card className="gap-0 p-5 glass-card relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[30px] rounded-full group-hover:bg-primary/10 transition-colors" />
      <div className="flex items-center justify-between relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-110">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight font-mono relative z-10 text-white">{value}</p>
      {hint && <p className="mt-1 text-[10px] text-muted-foreground font-medium relative z-10">{hint}</p>}
    </Card>
  );
}
