"use client";

// app/reports/page.tsx
// Member 3 – Reports Tab: prebuilt reports + custom report builder with exports.

import { useEffect, useState } from "react";
import PlatformFrame from "@/components/layout/PlatformFrame";
import PillTabs from "@/components/shared/PillTabs";
import { Toaster } from "@/components/feedback/Toaster";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EnvironmentalReport,
  SocialReport,
  GovernanceReport,
  EsgSummaryReport,
} from "@/components/reports/ReportViews";
import CustomBuilder from "@/components/reports/CustomBuilder";
import { fetchReportsData, mockReportsData, type ReportsData } from "@/lib/api";

const REPORT_META = [
  {
    key: "environmental",
    icon: "🌿",
    title: "Environmental Report",
    desc: "Emissions, goals, vendor & product breakdown",
  },
  {
    key: "social",
    icon: "👥",
    title: "Social Report",
    desc: "Diversity, CSR participation, training completion",
  },
  {
    key: "governance",
    icon: "🛡️",
    title: "Governance Report",
    desc: "Policies, audits, compliance & risk summary",
  },
  {
    key: "esg-summary",
    icon: "📊",
    title: "ESG Summary",
    desc: "Executive overview: all 4 scores + dept comparison",
  },
];

const TABS = [
  { key: "environmental", label: "Environmental" },
  { key: "social", label: "Social" },
  { key: "governance", label: "Governance" },
  { key: "esg-summary", label: "ESG Summary" },
  { key: "custom", label: "Custom Builder" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("environmental");
  const [data, setData] = useState<ReportsData>(mockReportsData);

  // Load live report data from the backend DB (falls back to seed data on error).
  useEffect(() => {
    let active = true;
    fetchReportsData()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        /* keep seeded mock data */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PlatformFrame>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analytics &amp; custom report builder — export to PDF, Excel or CSV.
          </p>
        </div>

        {/* Report gallery */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT_META.map((r) => (
            <Card key={r.key} className={`gap-3 p-5 glass-card group cursor-pointer transition-all border ${tab === r.key ? "border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-white/5"}`} onClick={() => setTab(r.key)}>
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">{r.icon}</span>
                <h3 className="font-bold text-sm tracking-wide text-white">{r.title}</h3>
              </div>
              <p className="line-clamp-2 mt-3 text-[11px] text-zinc-400 leading-relaxed font-medium">
                {r.desc}
              </p>
              <div className="mt-4 flex justify-end">
                <Button
                  variant={tab === r.key ? "default" : "outline"}
                  size="sm"
                  className={tab === r.key ? "bg-primary text-background font-bold tracking-widest text-[9px] uppercase rounded-full" : "text-[9px] uppercase tracking-widest rounded-full border-white/10 hover:bg-white/10"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTab(r.key);
                  }}
              >
                Generate
              </Button>
              </div>
            </Card>
          ))}
        </div>

        <PillTabs tabs={TABS} value={tab} onChange={setTab} />

        {tab === "environmental" && <EnvironmentalReport data={data} />}
        {tab === "social" && <SocialReport data={data} />}
        {tab === "governance" && <GovernanceReport data={data} />}
        {tab === "esg-summary" && <EsgSummaryReport data={data} />}
        {tab === "custom" && <CustomBuilder data={data} />}
      </div>
      <Toaster />
    </PlatformFrame>
  );
}
