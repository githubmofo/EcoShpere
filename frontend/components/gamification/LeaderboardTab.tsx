"use client";

// components/gamification/LeaderboardTab.tsx

import { useMemo, useState } from "react";
import { Building2, Trophy, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SimpleBar } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/mock-data";
import type { LeaderboardEntry } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardTab({
  leaderboard,
}: {
  leaderboard: LeaderboardEntry[];
}) {
  const [dept, setDept] = useState("all");

  const filtered = useMemo(() => {
    const list =
      dept === "all"
        ? leaderboard
        : leaderboard.filter((e) => e.department === dept);
    return [...list].sort((a, b) => b.xp - a.xp);
  }, [leaderboard, dept]);

  const chartData = filtered
    .slice(0, 6)
    .map((e) => ({ name: e.name, value: e.xp }));

  const top3 = filtered.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Leaderboard</h3>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Top 3 highlight */}
      <div className="grid gap-3 sm:grid-cols-3">
        {top3.map((e, i) => (
          <Card
            key={e.id}
            className={cn(
              "flex-row items-center gap-3 p-4",
              i === 0 && "ring-primary/40"
            )}
          >
            <span className="text-2xl">{MEDALS[i]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {e.kind === "department" ? (
                  <Building2 className="size-3" />
                ) : (
                  <User className="size-3" />
                )}
                {e.department}
              </p>
            </div>
            <span className="text-lg font-semibold text-primary">
              {e.xp.toLocaleString()}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-3">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Trophy className="size-4 text-primary" /> XP Ranking
          </h4>
          <SimpleBar data={chartData} horizontal height={260} />
        </Card>

        <Card className="p-0 lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead className="text-right">Badges</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e, i) => (
                <TableRow key={e.id}>
                  <TableCell className="font-semibold text-primary">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {e.kind === "department" ? (
                        <Building2 className="size-3.5 text-muted-foreground" />
                      ) : (
                        <User className="size-3.5 text-muted-foreground" />
                      )}
                      {e.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {e.xp.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {e.badges || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
