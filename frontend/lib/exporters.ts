// lib/exporters.ts
// Client-side report exporters: CSV (native), Excel (SheetJS), PDF (jsPDF).
// Heavy libs are dynamically imported so they only load in the browser on demand.

export interface ExportColumn {
  key: string;
  label: string;
}

export type ExportRow = Record<string, string | number>;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCSV(
  filename: string,
  columns: ExportColumn[],
  rows: ExportRow[]
) {
  const header = columns.map((c) => csvCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvCell(row[c.key])).join(","))
    .join("\n");
  const csv = `${header}\n${body}`;
  triggerDownload(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    `${filename}.csv`
  );
}

export async function exportExcel(
  filename: string,
  columns: ExportColumn[],
  rows: ExportRow[]
) {
  const XLSX = await import("xlsx");
  const aoa = [
    columns.map((c) => c.label),
    ...rows.map((row) => columns.map((c) => row[c.key] ?? "")),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  worksheet["!cols"] = columns.map(() => ({ wch: 20 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportPDF(
  title: string,
  filename: string,
  columns: ExportColumn[],
  rows: ExportRow[]
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.setTextColor(232, 114, 46);
  doc.text("EcoSphere", 14, 16);
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(title, 14, 23);
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 29);

  autoTable(doc, {
    startY: 34,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    theme: "striped",
    headStyles: { fillColor: [232, 114, 46], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${filename}.pdf`);
}
