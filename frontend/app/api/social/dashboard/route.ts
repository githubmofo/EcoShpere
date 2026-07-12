import { NextResponse } from "next/server";
import { mockCsrActivities, mockParticipation } from "@/lib/mock-data";

export async function GET() {
  // Compute some fake metrics for the dashboard
  const totalActivities = mockCsrActivities.length;
  const activeActivities = mockCsrActivities.filter(a => a.status === "ongoing").length;
  const participationRate = 42; // fake percentage
  const pointsAwarded = mockParticipation.reduce((acc, curr) => acc + curr.pointsEarned, 0);

  return NextResponse.json({
    totalActivities,
    activeActivities,
    participationRate,
    pointsAwarded,
    trainingCompletionRate: 80
  });
}
