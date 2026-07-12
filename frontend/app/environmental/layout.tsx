// app/environmental/layout.tsx
// Member 1 – Environmental Sub-Layout with shared tab routing & quick metrics
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Target, BarChart2, FileSpreadsheet } from "lucide-react";
import { apiGet } from "@/lib/api-client";

interface EnvSummary {
  totalEmissions: number;
  activeGoals: number;
  avgAchievement: number;
  period: string;
}

export default function EnvironmentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [summary, setSummary] = useState<EnvSummary | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await apiGet<EnvSummary>("/environmental/summary");
        setSummary(data);
      } catch (err) {
        console.error("Failed to load environmental summary metrics:", err);
      }
    }
    loadSummary();

    // Set up custom event listener to reload summary metrics when changes happen (e.g. logging transactions)
    window.addEventListener("ecosphere_carbon_updated", loadSummary);
    return () => {
      window.removeEventListener("ecosphere_carbon_updated", loadSummary);
    };
  }, []);

  const tabs = [
    { name: "Dashboard", href: "/environmental/dashboard", icon: BarChart2 },
    { name: "Emission Factors", href: "/environmental/emission-factors", icon: FileSpreadsheet },
    { name: "Carbon Transactions", href: "/environmental/carbon-transactions", icon: Leaf },
    { name: "Goals", href: "/environmental/goals", icon: Target },
  ];

  return (
    <div className="space-y-6">
      
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            Environmental Module
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage greenhouse gas calculations, offset logs, target goals, and sustainability metrics.
          </p>
        </div>
        
        {/* KPI Summary Block */}
        <div className="flex flex-wrap items-center gap-6 bg-card/25 border border-border/60 p-4 rounded-xl">
          <div className="pr-4 border-r border-border/80">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Footprint</span>
            <p className="text-sm font-black text-green-400 mt-0.5">
              {summary ? `${summary.totalEmissions.toLocaleString()} kg` : "---"} CO₂e
            </p>
          </div>
          <div className="pr-4 border-r border-border/80">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Active Goals</span>
            <p className="text-sm font-black text-foreground mt-0.5">
              {summary ? summary.activeGoals : "---"}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Goal Completion</span>
            <p className="text-sm font-black text-emerald-400 mt-0.5">
              {summary ? `${summary.avgAchievement}%` : "---"}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tab Links */}
      <div className="flex items-center p-1.5 bg-card/40 border border-border/60 rounded-2xl w-fit gap-1 max-w-full overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link key={tab.name} href={tab.href} className="block shrink-0">
              <button
                className={`flex items-center gap-2.5 px-4.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-green-500/10 border border-green-500/30 text-green-400 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-green-400" : "text-muted-foreground"}`} />
                {tab.name}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Nested Route View */}
      <div className="mt-6">
        {children}
      </div>

    </div>
  );
}
