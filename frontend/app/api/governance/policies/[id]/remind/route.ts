import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Mock sending reminder
  return NextResponse.json({ success: true, policyId: id, remindersSent: 40 });
}
