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
    <Card className="gap-0 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
