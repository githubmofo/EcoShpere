import { NextResponse } from "next/server";
import { mockDiversitySummary } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockDiversitySummary);
}
