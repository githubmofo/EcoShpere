import { NextResponse } from "next/server";
import { mockCsrActivities } from "../../../../lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const status = searchParams.get("status");

  let activities = [...mockCsrActivities];

  if (department && department !== "all") {
    activities = activities.filter(a => a.departmentId === department || a.departmentId === "all");
  }
  
  if (status && status !== "all") {
    activities = activities.filter(a => a.status === status);
  }

  return NextResponse.json(activities);
}

export async function POST(request: Request) {
  const body = await request.json();
  // In a real app, save to DB here. For now, just return it.
  const newActivity = {
    id: `act_${Date.now()}`,
    ...body,
    participantCount: 0
  };
  return NextResponse.json(newActivity, { status: 201 });
}
