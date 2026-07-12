"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trendLabel?: string;
  trendDirection?: "up" | "down" | "neutral";
  accentColor?: string; // e.g. "var(--color-esg-accent-primary)"
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  unit,
  trendLabel,
  trendDirection = "neutral",
  accentColor = "var(--color-esg-accent-primary)",
  icon
}: MetricCardProps) {
  const TrendIcon = 
    trendDirection === "up" ? TrendingUp : 
    trendDirection === "down" ? TrendingDown : Minus;
    
  const trendColor = 
    trendDirection === "up" ? "text-[var(--color-esg-accent-success)]" : 
    trendDirection === "down" ? "text-[var(--color-esg-accent-danger)]" : "text-esg-text-muted";

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-esg-bg-surface backdrop-blur-xl border border-esg-border-subtle p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-esg-text-muted">{title}</h3>
        {icon && (
          <div 
            className="p-2 rounded-lg bg-esg-bg-surface-muted border border-esg-border-subtle"
            style={{ color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-esg-text-primary">{value}</span>
        {unit && <span className="text-sm font-medium text-esg-text-muted">{unit}</span>}
      </div>

      {trendLabel && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={cn("flex items-center gap-1 font-medium", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendDirection === "up" ? "+" : trendDirection === "down" ? "-" : ""}
            {trendLabel}
          </span>
          <span className="text-esg-text-muted">vs last period</span>
        </div>
      )}
    </div>
  );
}
