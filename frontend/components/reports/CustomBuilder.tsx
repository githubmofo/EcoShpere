"use client";

// components/reports/CustomBuilder.tsx
// Custom Report Builder: combine filters, run, and export (PDF/Excel/CSV).

import { useMemo, useState } from "react";
import { Play, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExportMenu from "@/components/reports/ExportMenu";
import { ReportTable, DATE_RANGES, inRange, selectClass } from "@/components/reports/parts";
import { toast } from "@/components/feedback/Toaster";
import type { ReportsData } from "@/lib/api";
import * as seed from "@/lib/mock-data";
import type { ExportColumn, ExportRow } from "@/lib/exporters";

const COLUMNS: ExportColumn[] = [
  { key: "date", label: "Date" },
  { key: "department", label: "Department" },
  { key: "module", label: "Module" },
  { key: "metric", label: "Metric" },
  { key: "value", label: "Value" },
  { key: "employee", label: "Employee" },
];

const MODULES = ["Environmental", "Social", "Governance", "Gamification"];
const ESG_CATEGORIES = ["environmental", "social", "governance"];

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function CustomBuilder({ data }: { data: ReportsData }) {
export default function CustomBuilder() {
  const [dateRange, setDateRange] = useState("all");
  const [department, setDepartment] = useState("all");
  const [moduleF, setModuleF] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [challenge, setChallenge] = useState("all");
  const [esgCategory, setEsgCategory] = useState("all");
  const [hasRun, setHasRun] = useState(false);

  const result = useMemo<ExportRow[]>(() => {
    return data.reportRows
    return seed.reportRows
      .filter(
        (r) =>
          (department === "all" || r.department === department) &&
          (moduleF === "all" || r.module === moduleF) &&
          (employee === "all" || r.employee === employee) &&
          (esgCategory === "all" || r.module.toLowerCase() === esgCategory) &&
          (challenge === "all" || r.module === "Gamification") &&
          inRange(r.date, dateRange)
      )
      .map((r) => ({
        date: r.date,
        department: r.department,
        module: r.module,
        metric: r.metric,
        value: r.value,
        employee: r.employee,
      }));
  }, [data.reportRows, department, moduleF, employee, esgCategory, challenge, dateRange]);

  function run() {
    setHasRun(true);
    toast({ title: "Report generated", description: `${result.length} rows match your filters` });
  }, [department, moduleF, employee, esgCategory, challenge, dateRange]);

  function run() {
    setHasRun(true);
    toast({
      title: "Report generated",
      description: `${result.length} rows match your filters`,
    });
  }

  return (
    <div className="space-y-4">
      <Card className="gap-4 p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <h3 className="text-sm font-medium">Custom Report Builder — Filters</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Labeled label="Date Range">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={selectClass()}>
              {DATE_RANGES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Department">
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectClass()}>
              <option value="all">All</option>
              {data.departments.map((d) => (
              {seed.DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Module">
            <select value={moduleF} onChange={(e) => setModuleF(e.target.value)} className={selectClass()}>
              <option value="all">All</option>
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Employee">
            <select value={employee} onChange={(e) => setEmployee(e.target.value)} className={selectClass()}>
              <option value="all">All</option>
              {data.employees.map((e) => (
              {seed.EMPLOYEES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Challenge">
            <select value={challenge} onChange={(e) => setChallenge(e.target.value)} className={selectClass()}>
              <option value="all">All</option>
              {data.challenges.map((c) => (
                <option key={c} value={c}>
                  {c}
              {seed.challenges.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="ESG Category">
            <select value={esgCategory} onChange={(e) => setEsgCategory(e.target.value)} className={selectClass()}>
              <option value="all">All</option>
              {ESG_CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </Labeled>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
          <Button onClick={run}>
            <Play className="size-4" /> Run Report
          </Button>
          <ExportMenu title="Custom ESG Report" filename="custom-report" columns={COLUMNS} rows={result} />
          <span className="ml-auto text-xs text-muted-foreground">{result.length} rows match</span>
          <ExportMenu
            title="Custom ESG Report"
            filename="custom-report"
            columns={COLUMNS}
            rows={result}
          />
          <span className="ml-auto text-xs text-muted-foreground">
            {result.length} rows match
          </span>
        </div>
      </Card>

      {hasRun ? (
        <ReportTable columns={COLUMNS} rows={result} />
      ) : (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Choose your filters and press <span className="font-medium text-foreground">Run Report</span> to preview
          results.
          Choose your filters and press{" "}
          <span className="font-medium text-foreground">Run Report</span> to
          preview results.
        </Card>
      )}
    </div>
  );
}
