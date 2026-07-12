"use client";

// components/gamification/BadgesTab.tsx

import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Badge as BadgeType } from "@/lib/types";

export default function BadgesTab({ badges }: { badges: BadgeType[] }) {
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Badges</h3>
        <span className="text-xs text-muted-foreground">
          {earned} of {badges.length} unlocked
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <Card
            key={b.id}
            className={cn(
              "gap-3 p-4",
              b.earned ? "ring-primary/30" : "opacity-75"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl text-2xl",
                  b.earned ? "bg-primary/15" : "bg-muted"
                )}
              >
                {b.earned ? b.icon : <Lock className="size-5 text-muted-foreground" />}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium leading-tight">{b.name}</h4>
                  {b.earned && (
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      Earned
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {b.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-2 text-xs text-muted-foreground">
              <span>🎯 {b.criteria}</span>
              <span>{b.earnedBy} earned</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
