import { NextResponse } from "next/server";
import { mockComplianceIssues, mockPolicies } from "@/lib/mock-data";

export async function GET() {
  const openIssues = mockComplianceIssues.filter(i => i.status !== "resolved").length;
  const overdueIssues = mockComplianceIssues.filter(i => i.isOverdue).length;
  const completedAudits = 1; // fake count
  
  let totalAck = 0;
  let totalEmp = 0;
  mockPolicies.forEach(p => {
    totalAck += p.acknowledgedCount;
    totalEmp += p.totalEmployees;
  });
  const policiesAcknowledgedPercent = totalEmp > 0 ? Math.round((totalAck / totalEmp) * 100) : 0;

  return NextResponse.json({
    openIssues,
    overdueIssues,
    completedAudits,
    policiesAcknowledgedPercent
  });
}
