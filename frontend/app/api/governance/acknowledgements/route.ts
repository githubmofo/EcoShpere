import { NextResponse } from "next/server";
import { mockAcknowledgements } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const policyId = searchParams.get("policyId");

  let acks = [...mockAcknowledgements];
  if (policyId) {
    acks = acks.filter(a => a.policyId === policyId);
  }

  return NextResponse.json(acks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newAck = {
    id: `ack_${Date.now()}`,
    ...body,
    acknowledgedAt: new Date().toISOString(),
    status: "acknowledged"
  };
  return NextResponse.json(newAck, { status: 201 });
}
