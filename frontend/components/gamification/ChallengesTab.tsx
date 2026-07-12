"use client";

// components/gamification/ChallengesTab.tsx

import { useState } from "react";
import { Award, CalendarClock, Plus, Trophy, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusPill, DifficultyText } from "@/components/shared/kit";
import { cn } from "@/lib/utils";
import type {
  Badge as BadgeType,
  Challenge,
  ChallengeStatus,
  Difficulty,
  LeaderboardEntry,
} from "@/lib/types";

const STATUS_FILTERS: { key: ChallengeStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "under-review", label: "Under Review" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

const NEXT_ACTION: Partial<
  Record<ChallengeStatus, { label: string; next: ChallengeStatus }>
> = {
  draft: { label: "Activate", next: "active" },
  active: { label: "Submit for Review", next: "under-review" },
  "under-review": { label: "Mark Completed", next: "completed" },
};

function formatDeadline(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function ChallengesTab({
  challenges,
  badges,
  leaderboard,
  isAdmin,
  onJoin,
  onSetStatus,
  onAddChallenge,
}: {
  challenges: Challenge[];
  badges: BadgeType[];
  leaderboard: LeaderboardEntry[];
  isAdmin: boolean;
  onJoin: (id: string) => void;
  onSetStatus: (id: string, status: ChallengeStatus) => void;
  onAddChallenge: (c: Omit<Challenge, "id">) => void;
}) {
  const [filter, setFilter] = useState<ChallengeStatus | "all">("all");
  const shown =
    filter === "all"
      ? challenges
      : challenges.filter((c) => c.status === filter);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <NewChallengeDialog onAdd={onAddChallenge} />
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === f.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge cards */}
      {shown.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No challenges in this state.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => {
            const action = NEXT_ACTION[c.status];
            return (
              <Card
                key={c.id}
                className="gap-3 p-4 ring-primary/25 transition-shadow hover:ring-primary/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.icon}</span>
                    <h3 className="font-medium leading-tight">{c.title}</h3>
                  </div>
                  <StatusPill status={c.status} />
                </div>

                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {c.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Zap className="size-3.5 text-primary" />
                    XP: {c.xp} · <DifficultyText difficulty={c.difficulty} />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    Deadline {formatDeadline(c.deadline)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    className="flex-1"
                    disabled={c.status !== "active"}
                    onClick={() => onJoin(c.id)}
                  >
                    Join Challenge
                  </Button>
                  {isAdmin && action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetStatus(c.id, action.next)}
                    >
                      {action.label}
                    </Button>
                  )}
                  {isAdmin && c.status !== "archived" && c.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => onSetStatus(c.id, "archived")}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Badge gallery + leaderboard panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="size-4 text-primary" /> Badge Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 p-0">
            {badges.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  b.earned
                    ? "border-primary/40 bg-primary/10"
                    : "border-border opacity-60"
                )}
              >
                <span className="text-lg">{b.icon}</span>
                <span className="truncate font-medium">{b.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="size-4 text-primary" /> Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 text-xs text-muted-foreground">
              <span>Rank</span>
              <span>Employee / Dept</span>
              <span className="text-right">XP</span>
              {leaderboard.slice(0, 3).map((e) => (
                <div key={e.id} className="contents">
                  <span className="py-1.5 font-semibold text-primary">
                    {e.rank}
                  </span>
                  <span className="truncate py-1.5 text-foreground">
                    {e.name}
                  </span>
                  <span className="py-1.5 text-right font-medium text-foreground">
                    {e.xp.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NewChallengeDialog({
  onAdd,
}: {
  onAdd: (c: Omit<Challenge, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Energy");
  const [xp, setXp] = useState(100);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim() || "New sustainability challenge.",
      category,
      icon: "🌟",
      xp: Number(xp) || 0,
      difficulty,
      deadline: deadline || new Date().toISOString().slice(0, 10),
      status: "draft",
      evidenceRequired: false,
      participantCount: 0,
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    setXp(100);
    setDeadline("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New Challenge
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Challenge</DialogTitle>
          <DialogDescription>
            New challenges start as a Draft and can be activated later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sustainability Sprint"
            />
          </Field>
          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should participants do?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="XP">
              <Input
                type="number"
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
              />
            </Field>
            <Field label="Deadline">
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring"
              >
                {["Energy", "Waste", "Transport", "Water", "Community"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </Field>
            <Field label="Difficulty">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring"
              >
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create Challenge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
