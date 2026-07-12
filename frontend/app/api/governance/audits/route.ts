import { NextResponse } from "next/server";
import { mockAudits } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockAudits);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newAudit = {
    id: `aud_${Date.now()}`,
    ...body,
    findings: 0,
    linkedIssueCount: 0
  };
  return NextResponse.json(newAudit, { status: 201 });
}
