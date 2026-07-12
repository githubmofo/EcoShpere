import { NextResponse } from "next/server";
import { mockComplianceIssues } from "@/lib/mock-data";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issues = mockComplianceIssues.filter(i => i.auditId === id);
  return NextResponse.json(issues);
}
