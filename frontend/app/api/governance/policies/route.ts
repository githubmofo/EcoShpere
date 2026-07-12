import { NextResponse } from "next/server";
import { mockPolicies } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockPolicies);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newPolicy = {
    id: `pol_${Date.now()}`,
    ...body,
    acknowledgedCount: 0,
    totalEmployees: 150
  };
  return NextResponse.json(newPolicy, { status: 201 });
}
