"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import GovernancePage from "../page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const severityColors = {
  low: "var(--color-blue-500)",
  medium: "var(--color-yellow-500)",
  high: "var(--color-orange-500)",
  critical: "var(--color-red-500)"
};

const mockSeverityData = [
  { name: "Low", value: 1, color: "var(--color-chart-1)" },
  { name: "Medium", value: 4, color: "var(--color-chart-2)" },
  { name: "High", value: 2, color: "var(--color-chart-3)" },
  { name: "Critical", value: 1, color: "var(--color-destructive)" },
];

const mockAckTrend = [
  { month: "Jan", ack: 20 },
  { month: "Feb", ack: 45 },
  { month: "Mar", ack: 55 },
  { month: "Apr", ack: 70 },
  { month: "May", ack: 78 },
  { month: "Jun", ack: 83 },
];

export default function GovernanceDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    apiGet("/governance/dashboard").then(setMetrics).catch(console.error);
  }, []);

  return (
    <GovernancePage>
      <div className="mb-6 mt-4">
        <h2 className="text-xl font-semibold">Governance KPIs Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.openIssues ?? "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Overdue Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{metrics?.overdueIssues ?? "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Completed Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.completedAudits ?? "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Policies Acknowledged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.policiesAcknowledgedPercent ?? "-"}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockSeverityData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockSeverityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Acknowledgement Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockAckTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ack" stroke="var(--color-primary)" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </GovernancePage>
  );
}
