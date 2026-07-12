"use client";

// components/reports/ReportViews.tsx
<<<<<<< HEAD
// The four prebuilt reports, driven by data from the backend (with mock fallback).
=======
// The four prebuilt reports: Environmental, Social, Governance, ESG Summary.
>>>>>>> origin/feature/member2-social-governance

import { useMemo, useState } from "react";
import {
  BarChart3,
  Gauge,
  Leaf,
  ShieldCheck,
  Target,
  TrendingDown,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kit";
import {
  Donut,
  DeptScoreBars,
  EmissionsTrend,
  ScoreGauge,
  SimpleBar,
} from "@/components/charts/Charts";
import ExportMenu from "@/components/reports/ExportMenu";
import { FilterRow, ReportHeader, ReportTable, inRange } from "@/components/reports/parts";
<<<<<<< HEAD
import type { ReportsData } from "@/lib/api";
=======
import * as seed from "@/lib/mock-data";
>>>>>>> origin/feature/member2-social-governance
import type { ExportColumn, ExportRow } from "@/lib/exporters";
import type { ReportRow } from "@/lib/types";

const FLAT_COLUMNS: ExportColumn[] = [
  { key: "date", label: "Date" },
  { key: "department", label: "Department" },
  { key: "metric", label: "Metric" },
  { key: "value", label: "Value" },
  { key: "employee", label: "Employee" },
];

function toRows(list: ReportRow[]): ExportRow[] {
  return list.map((r) => ({
    date: r.date,
    department: r.department,
    metric: r.metric,
    value: r.value,
    employee: r.employee,
  }));
}

<<<<<<< HEAD
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
=======
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
>>>>>>> origin/feature/member2-social-governance
  return (
    <Card className="p-4">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      {children}
    </Card>
  );
}

<<<<<<< HEAD
function useFlatFilter(rows: ReportRow[], module: string) {
  const [department, setDepartment] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const filtered = useMemo(
    () =>
      rows.filter(
=======
function useFlatFilter(module: string) {
  const [department, setDepartment] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const rows = useMemo(
    () =>
      seed.reportRows.filter(
>>>>>>> origin/feature/member2-social-governance
        (r) =>
          r.module === module &&
          (department === "all" || r.department === department) &&
          inRange(r.date, dateRange)
      ),
<<<<<<< HEAD
    [rows, module, department, dateRange]
  );
  return { department, setDepartment, dateRange, setDateRange, rows: filtered };
}

// ─── Environmental ───────────────────────────────────────────
export function EnvironmentalReport({ data }: { data: ReportsData }) {
  const f = useFlatFilter(data.reportRows, "Environmental");
  const deptEmissions =
    f.department === "all"
      ? data.emissionsByDepartment
      : data.emissionsByDepartment.filter((e) => e.name === f.department);
  const totalEmissions = data.emissionsByCategory.reduce((s, c) => s + c.value, 0);
=======
    [module, department, dateRange]
  );
  return { department, setDepartment, dateRange, setDateRange, rows };
}

// ─── Environmental ───────────────────────────────────────────
export function EnvironmentalReport() {
  const f = useFlatFilter("Environmental");
  const deptEmissions =
    f.department === "all"
      ? seed.emissionsByDepartment
      : seed.emissionsByDepartment.filter((e) => e.name === f.department);
  const totalEmissions = seed.emissionsByCategory.reduce((s, c) => s + c.value, 0);
>>>>>>> origin/feature/member2-social-governance

  return (
    <div className="space-y-4">
      <ReportHeader
        icon={<Leaf className="size-5" />}
        title="Environmental Report"
        description="Emissions, goals, vendor & product breakdown"
      >
<<<<<<< HEAD
        <ExportMenu title="Environmental Report" filename="environmental-report" columns={FLAT_COLUMNS} rows={toRows(f.rows)} />
=======
        <ExportMenu
          title="Environmental Report"
          filename="environmental-report"
          columns={FLAT_COLUMNS}
          rows={toRows(f.rows)}
        />
>>>>>>> origin/feature/member2-social-governance
      </ReportHeader>

      <FilterRow {...f} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<TrendingDown className="size-4" />} label="Total Emissions" value={`${totalEmissions.toLocaleString()} tCO2e`} hint="Scope 1–3" />
        <KpiCard icon={<Target className="size-4" />} label="YoY Change" value="-8.4%" hint="vs last year" />
        <KpiCard icon={<Leaf className="size-4" />} label="Goals On Track" value="3 / 5" hint="Sustainability goals" />
        <KpiCard icon={<BarChart3 className="size-4" />} label="Records" value={f.rows.length} hint="Matching filters" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Emissions Trend (tCO2e)">
<<<<<<< HEAD
          <EmissionsTrend data={data.monthlyEmissions} />
        </ChartCard>
        <ChartCard title="Emissions by Category">
          <Donut data={data.emissionsByCategory} />
=======
          <EmissionsTrend data={seed.monthlyEmissions} />
        </ChartCard>
        <ChartCard title="Emissions by Category">
          <Donut data={seed.emissionsByCategory} />
>>>>>>> origin/feature/member2-social-governance
        </ChartCard>
      </div>

      <ChartCard title="Emissions by Department">
        <SimpleBar data={deptEmissions} color="var(--chart-1)" />
      </ChartCard>

      <ReportTable columns={FLAT_COLUMNS} rows={toRows(f.rows)} />
    </div>
  );
}

// ─── Social ──────────────────────────────────────────────────
<<<<<<< HEAD
export function SocialReport({ data }: { data: ReportsData }) {
  const f = useFlatFilter(data.reportRows, "Social");
  const csrTotal = data.csrParticipation.reduce((s, c) => s + c.value, 0);
  const training = data.trainingCompletion.length
    ? Math.round(data.trainingCompletion.reduce((s, t) => s + t.value, 0) / data.trainingCompletion.length)
    : 0;
=======
export function SocialReport() {
  const f = useFlatFilter("Social");
  const csrTotal = seed.csrParticipation.reduce((s, c) => s + c.value, 0);
  const training = Math.round(
    seed.trainingCompletion.reduce((s, t) => s + t.value, 0) /
      seed.trainingCompletion.length
  );
>>>>>>> origin/feature/member2-social-governance

  return (
    <div className="space-y-4">
      <ReportHeader
        icon={<Users className="size-5" />}
        title="Social Report"
        description="Diversity, CSR participation, training completion"
      >
<<<<<<< HEAD
        <ExportMenu title="Social Report" filename="social-report" columns={FLAT_COLUMNS} rows={toRows(f.rows)} />
=======
        <ExportMenu
          title="Social Report"
          filename="social-report"
          columns={FLAT_COLUMNS}
          rows={toRows(f.rows)}
        />
>>>>>>> origin/feature/member2-social-governance
      </ReportHeader>

      <FilterRow {...f} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Users className="size-4" />} label="CSR Participants" value={csrTotal.toLocaleString()} hint="This year" />
        <KpiCard icon={<Target className="size-4" />} label="Training Completion" value={`${training}%`} hint="Company average" />
<<<<<<< HEAD
        <KpiCard icon={<Users className="size-4" />} label="Women in Workforce" value={`${data.diversityBreakdown[0]?.value ?? 0}%`} hint="Diversity ratio" />
=======
        <KpiCard icon={<Users className="size-4" />} label="Women in Workforce" value={`${seed.diversityBreakdown[0].value}%`} hint="Diversity ratio" />
>>>>>>> origin/feature/member2-social-governance
        <KpiCard icon={<BarChart3 className="size-4" />} label="Records" value={f.rows.length} hint="Matching filters" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="CSR Participation by Department">
<<<<<<< HEAD
          <SimpleBar data={data.csrParticipation} color="var(--chart-3)" />
        </ChartCard>
        <ChartCard title="Diversity Breakdown">
          <Donut data={data.diversityBreakdown} />
=======
          <SimpleBar data={seed.csrParticipation} color="var(--chart-3)" />
        </ChartCard>
        <ChartCard title="Diversity Breakdown">
          <Donut data={seed.diversityBreakdown} />
>>>>>>> origin/feature/member2-social-governance
        </ChartCard>
      </div>

      <ChartCard title="Training Completion by Department (%)">
<<<<<<< HEAD
        <SimpleBar data={data.trainingCompletion} color="var(--chart-2)" />
=======
        <SimpleBar data={seed.trainingCompletion} color="var(--chart-2)" />
>>>>>>> origin/feature/member2-social-governance
      </ChartCard>

      <ReportTable columns={FLAT_COLUMNS} rows={toRows(f.rows)} />
    </div>
  );
}

// ─── Governance ──────────────────────────────────────────────
<<<<<<< HEAD
export function GovernanceReport({ data }: { data: ReportsData }) {
  const f = useFlatFilter(data.reportRows, "Governance");
  const g = data.governanceStats;
  const auditDonut = [
    { name: "Completed", value: g.auditsCompleted },
    { name: "Pending", value: Math.max(0, g.auditsTotal - g.auditsCompleted) },
=======
export function GovernanceReport() {
  const f = useFlatFilter("Governance");
  const g = seed.governanceStats;
  const auditDonut = [
    { name: "Completed", value: g.auditsCompleted },
    { name: "Pending", value: g.auditsTotal - g.auditsCompleted },
>>>>>>> origin/feature/member2-social-governance
  ];

  return (
    <div className="space-y-4">
      <ReportHeader
        icon={<ShieldCheck className="size-5" />}
        title="Governance Report"
        description="Policies, audits, compliance & risk summary"
      >
<<<<<<< HEAD
        <ExportMenu title="Governance Report" filename="governance-report" columns={FLAT_COLUMNS} rows={toRows(f.rows)} />
=======
        <ExportMenu
          title="Governance Report"
          filename="governance-report"
          columns={FLAT_COLUMNS}
          rows={toRows(f.rows)}
        />
>>>>>>> origin/feature/member2-social-governance
      </ReportHeader>

      <FilterRow {...f} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<ShieldCheck className="size-4" />} label="Policy Acknowledgement" value={`${g.policyAckRate}%`} hint="Company-wide" />
        <KpiCard icon={<Target className="size-4" />} label="Audits Completed" value={`${g.auditsCompleted} / ${g.auditsTotal}`} hint="This year" />
        <KpiCard icon={<BarChart3 className="size-4" />} label="Open Issues" value={g.openIssues} hint="Compliance" />
        <KpiCard icon={<TrendingDown className="size-4" />} label="Overdue (flagged)" value={g.overdueIssues} hint="Past due date" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Compliance Issues by Severity">
<<<<<<< HEAD
          <SimpleBar data={data.complianceBySeverity} color="var(--chart-4)" />
=======
          <SimpleBar data={seed.complianceBySeverity} color="var(--chart-4)" />
>>>>>>> origin/feature/member2-social-governance
        </ChartCard>
        <ChartCard title="Audit Status">
          <Donut data={auditDonut} />
        </ChartCard>
      </div>

      <ReportTable columns={FLAT_COLUMNS} rows={toRows(f.rows)} />
    </div>
  );
}

// ─── ESG Summary ─────────────────────────────────────────────
const SUMMARY_COLUMNS: ExportColumn[] = [
  { key: "department", label: "Department" },
  { key: "environmental", label: "Environmental" },
  { key: "social", label: "Social" },
  { key: "governance", label: "Governance" },
  { key: "total", label: "Total" },
];

<<<<<<< HEAD
export function EsgSummaryReport({ data }: { data: ReportsData }) {
  const [department, setDepartment] = useState("all");
  const scores =
    department === "all"
      ? data.departmentScores
      : data.departmentScores.filter((d) => d.department === department);
=======
export function EsgSummaryReport() {
  const [department, setDepartment] = useState("all");
  const scores =
    department === "all"
      ? seed.departmentScores
      : seed.departmentScores.filter((d) => d.department === department);
>>>>>>> origin/feature/member2-social-governance
  const rows: ExportRow[] = scores.map((d) => ({
    department: d.department,
    environmental: d.environmental,
    social: d.social,
    governance: d.governance,
    total: d.total,
  }));

  return (
    <div className="space-y-4">
      <ReportHeader
        icon={<Gauge className="size-5" />}
        title="ESG Summary"
        description="Executive overview: all 4 scores + dept comparison"
      >
<<<<<<< HEAD
        <ExportMenu title="ESG Summary Report" filename="esg-summary-report" columns={SUMMARY_COLUMNS} rows={rows} />
=======
        <ExportMenu
          title="ESG Summary Report"
          filename="esg-summary-report"
          columns={SUMMARY_COLUMNS}
          rows={rows}
        />
>>>>>>> origin/feature/member2-social-governance
      </ReportHeader>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Filter:</span>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="all">All departments</option>
<<<<<<< HEAD
          {data.departments.map((d) => (
=======
          {seed.DEPARTMENTS.map((d) => (
>>>>>>> origin/feature/member2-social-governance
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<<<<<<< HEAD
        <KpiCard icon={<Gauge className="size-4" />} label="Overall ESG" value={data.overallEsg} hint="Weighted 40/30/30" />
        <KpiCard icon={<Leaf className="size-4" />} label="Environmental" value={data.esgPillars.environmental} hint="Avg score" />
        <KpiCard icon={<Users className="size-4" />} label="Social" value={data.esgPillars.social} hint="Avg score" />
        <KpiCard icon={<ShieldCheck className="size-4" />} label="Governance" value={data.esgPillars.governance} hint="Avg score" />
=======
        <KpiCard icon={<Gauge className="size-4" />} label="Overall ESG" value={seed.overallEsg} hint="Weighted 40/30/30" />
        <KpiCard icon={<Leaf className="size-4" />} label="Environmental" value={seed.esgPillars.environmental} hint="Avg score" />
        <KpiCard icon={<Users className="size-4" />} label="Social" value={seed.esgPillars.social} hint="Avg score" />
        <KpiCard icon={<ShieldCheck className="size-4" />} label="Governance" value={seed.esgPillars.governance} hint="Avg score" />
>>>>>>> origin/feature/member2-social-governance
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-medium">Overall ESG Score</h3>
<<<<<<< HEAD
          <ScoreGauge value={data.overallEsg} />
        </Card>
        <Card className="p-4 lg:col-span-3">
          <h3 className="mb-2 text-sm font-medium">Department Comparison</h3>
          <DeptScoreBars data={data.departmentScores} />
=======
          <ScoreGauge value={seed.overallEsg} />
        </Card>
        <Card className="p-4 lg:col-span-3">
          <h3 className="mb-2 text-sm font-medium">Department Comparison</h3>
          <DeptScoreBars data={seed.departmentScores} />
>>>>>>> origin/feature/member2-social-governance
        </Card>
      </div>

      <ReportTable columns={SUMMARY_COLUMNS} rows={rows} />
    </div>
  );
}
