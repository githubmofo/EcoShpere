import { NextResponse } from "next/server";
import { mockParticipation } from "../../../../lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const department = searchParams.get("department");

  let participation = [...mockParticipation];

  if (status && status !== "all") {
    participation = participation.filter(p => p.status === status);
  }
  if (department && department !== "all") {
    participation = participation.filter(p => p.department === department);
  }

  return NextResponse.json(participation);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newParticipation = {
    id: `part_${Date.now()}`,
    ...body,
    proofFileName: null,
    pointsEarned: 0,
    status: "pending",
    submittedAt: new Date().toISOString()
  };
  
  return NextResponse.json(newParticipation, { status: 201 });
}
