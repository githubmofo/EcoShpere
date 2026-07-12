"use client";

// components/reports/ExportMenu.tsx
// PDF / Excel / CSV export buttons for any report table.

import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/feedback/Toaster";
import {
  exportCSV,
  exportExcel,
  exportPDF,
  type ExportColumn,
  type ExportRow,
} from "@/lib/exporters";

export default function ExportMenu({
  title,
  filename,
  columns,
  rows,
}: {
  title: string;
  filename: string;
  columns: ExportColumn[];
  rows: ExportRow[];
}) {
  async function run(kind: "pdf" | "excel" | "csv") {
    if (rows.length === 0) {
      toast({ title: "Nothing to export", variant: "error" });
      return;
    }
    try {
      if (kind === "pdf") await exportPDF(title, filename, columns, rows);
      else if (kind === "excel") await exportExcel(filename, columns, rows);
      else exportCSV(filename, columns, rows);
      toast({
        title: `Exported ${kind.toUpperCase()}`,
        description: `${rows.length} rows · ${filename}`,
      });
    } catch {
      toast({ title: "Export failed", variant: "error" });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => run("pdf")}>
        <FileText className="size-3.5" /> PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => run("excel")}>
        <FileSpreadsheet className="size-3.5" /> Excel
      </Button>
      <Button variant="outline" size="sm" onClick={() => run("csv")}>
        <FileDown className="size-3.5" /> CSV
      </Button>
    </div>
  );
}
