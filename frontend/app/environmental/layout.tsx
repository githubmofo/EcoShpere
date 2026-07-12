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

  async function loadSummary() {
    try {
      const data = await apiGet<EnvSummary>("/environmental/summary");
      setSummary(data);
    } catch (err) {
      console.error("Failed to load environmental summary metrics:", err);
    }
  }

  useEffect(() => {
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

  if (pathname === "/environmental") {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      
      {/* Module Title Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-400" />
            Environmental Module
          </h2>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Manage greenhouse gas calculations, offset logs, target goals, and sustainability metrics.
          </p>
        </div>
        
        {/* KPI Summary Block */}
        <div className="flex flex-wrap items-center gap-6 bg-zinc-950/20 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl">
          <div className="pr-5 border-r border-white/5">
            <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Footprint</span>
            <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">
              {summary ? `${summary.totalEmissions.toLocaleString()} kg` : "---"} CO₂e
            </p>
          </div>
          <div className="pr-5 border-r border-white/5">
            <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Active Goals</span>
            <p className="text-sm font-black text-white font-mono mt-0.5">
              {summary ? summary.activeGoals : "---"}
            </p>
          </div>
          <div>
            <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Goal Completion</span>
            <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">
              {summary ? `${summary.avgAchievement}%` : "---"}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tab Links */}
      <div className="flex items-center p-1 bg-zinc-950/20 backdrop-blur-md border border-white/5 rounded-2xl w-fit gap-1 max-w-full overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link key={tab.name} href={tab.href} className="block shrink-0">
              <button
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/10 border-white/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "text-zinc-400 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{tab.name}</span>
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
