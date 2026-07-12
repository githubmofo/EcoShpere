"use client";

// app/reports/page.tsx
// Member 3 – Reports Tab: prebuilt reports + custom report builder with exports.

import { useEffect, useState } from "react";
import { useState } from "react";
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
  { key: "environmental", icon: "🌿", title: "Environmental Report", desc: "Emissions, goals, vendor & product breakdown" },
  { key: "social", icon: "👥", title: "Social Report", desc: "Diversity, CSR participation, training completion" },
  { key: "governance", icon: "🛡️", title: "Governance Report", desc: "Policies, audits, compliance & risk summary" },
  { key: "esg-summary", icon: "📊", title: "ESG Summary", desc: "Executive overview: all 4 scores + dept comparison" },

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
            <Card key={r.key} className="gap-3 p-4 ring-primary/25">
              <div className="flex items-center gap-2">
                <span className="text-xl">{r.icon}</span>
                <h3 className="font-medium leading-tight">{r.title}</h3>
              </div>
              <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">{r.desc}</p>
              <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">
                {r.desc}
              </p>
              <Button
                variant={tab === r.key ? "default" : "outline"}
                size="sm"
                className="w-fit"
                onClick={() => setTab(r.key)}
              >
                Generate
              </Button>
            </Card>
          ))}
        </div>

        <PillTabs tabs={TABS} value={tab} onChange={setTab} />

        {tab === "environmental" && <EnvironmentalReport data={data} />}
        {tab === "social" && <SocialReport data={data} />}
        {tab === "governance" && <GovernanceReport data={data} />}
        {tab === "esg-summary" && <EsgSummaryReport data={data} />}
        {tab === "custom" && <CustomBuilder data={data} />}
        {tab === "environmental" && <EnvironmentalReport />}
        {tab === "social" && <SocialReport />}
        {tab === "governance" && <GovernanceReport />}
        {tab === "esg-summary" && <EsgSummaryReport />}
        {tab === "custom" && <CustomBuilder />}
      </div>
      <Toaster />
    </PlatformFrame>
  );
}
