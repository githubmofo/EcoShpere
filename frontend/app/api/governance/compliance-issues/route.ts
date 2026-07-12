import { NextResponse } from "next/server";
import { mockComplianceIssues } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockComplianceIssues);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newIssue = {
    id: `iss_${Date.now()}`,
    ...body,
    reportedDate: new Date().toISOString().split("T")[0],
    isOverdue: false
  };
  return NextResponse.json(newIssue, { status: 201 });
}
