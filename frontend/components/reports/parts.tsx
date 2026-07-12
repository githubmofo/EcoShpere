"use client";

// components/reports/parts.tsx
// Shared building blocks for report views: header, filter row, data table.

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEPARTMENTS } from "@/lib/mock-data";
import type { ExportColumn, ExportRow } from "@/lib/exporters";

export const DATE_RANGES = [
  { key: "all", label: "All time" },
  { key: "30d", label: "Last 30 days" },
  { key: "quarter", label: "This quarter" },
  { key: "month", label: "This month" },
] as const;

// Reference "today" for the demo dataset.
const TODAY = new Date("2026-07-12");

export function inRange(dateStr: string | undefined, range: string): boolean {
  if (!dateStr || range === "all") return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return true;
  if (range === "month") {
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
  }
  if (range === "quarter") {
    const q = Math.floor(TODAY.getMonth() / 3);
    return d.getFullYear() === TODAY.getFullYear() && Math.floor(d.getMonth() / 3) === q;
  }
  if (range === "30d") {
    const cutoff = new Date(TODAY);
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }
  return true;
}

export function selectClass() {
  return "h-8 rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring";
}

export function ReportHeader({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-lg text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function FilterRow({
  department,
  setDepartment,
  dateRange,
  setDateRange,
}: {
  department: string;
  setDepartment: (v: string) => void;
  dateRange: string;
  setDateRange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Filters:</span>
      <select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className={selectClass()}
      >
        {DATE_RANGES.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label}
          </option>
        ))}
      </select>
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className={selectClass()}
      >
        <option value="all">All departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ReportTable({
  columns,
  rows,
}: {
  columns: ExportColumn[];
  rows: ExportRow[];
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key}>{c.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-muted-foreground"
              >
                No records match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.key}>{row[c.key]}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
