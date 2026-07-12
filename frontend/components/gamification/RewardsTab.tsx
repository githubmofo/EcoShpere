"use client";

// components/gamification/RewardsTab.tsx

import { Coins, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Reward, RewardRedemption } from "@/lib/types";

export default function RewardsTab({
  rewards,
  points,
  redemptions,
  onRedeem,
}: {
  rewards: Reward[];
  points: number;
  redemptions: RewardRedemption[];
  onRedeem: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Rewards Catalog</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Coins className="size-4" />
          {points.toLocaleString()} points available
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => {
          const outOfStock = r.stock <= 0;
          const cantAfford = points < r.pointsCost;
          const disabled = outOfStock || cantAfford;
          return (
            <Card key={r.id} className="gap-3 p-4">
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-2xl">
                  {r.icon}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    outOfStock
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {outOfStock ? "Out of stock" : `${r.stock} in stock`}
                </span>
              </div>
              <div>
                <h4 className="font-medium leading-tight">{r.name}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  <Coins className="size-4" />
                  {r.pointsCost.toLocaleString()}
                </span>
                <Button
                  size="sm"
                  disabled={disabled}
                  onClick={() => onRedeem(r.id)}
                >
                  {outOfStock
                    ? "Unavailable"
                    : cantAfford
                    ? "Not enough"
                    : "Redeem"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <History className="size-4 text-primary" /> Redemption History
        </h4>
        {redemptions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No rewards redeemed yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {redemptions.map((rd) => (
              <li
                key={rd.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span>{rd.rewardName}</span>
                <span className="text-xs text-muted-foreground">
                  −{rd.pointsSpent.toLocaleString()} pts · {rd.redeemedAt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
