"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import SocialPage from "../page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart } from "recharts";

const mockTrendData = [
  { month: "Jan", participants: 20, points: 500 },
  { month: "Feb", participants: 35, points: 800 },
  { month: "Mar", participants: 45, points: 1200 },
  { month: "Apr", participants: 60, points: 1500 },
  { month: "May", participants: 85, points: 2100 },
  { month: "Jun", participants: 128, points: 3000 },
];

const mockDeptData = [
  { dept: "Engineering", rate: 75 },
  { dept: "Sales", rate: 45 },
  { dept: "HR", rate: 90 },
  { dept: "Marketing", rate: 60 },
];

export default function SocialDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    apiGet("/social/dashboard").then(setMetrics).catch(console.error);
  }, []);

  return (
    <SocialPage>
      <div className="mb-6 mt-4">
        <h2 className="text-xl font-semibold">Social KPIs Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.totalActivities || "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Participation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.participationRate || "-"}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Points Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.pointsAwarded || "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Training Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.trainingCompletionRate || "-"}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Participation Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="var(--color-muted-foreground)" />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted-foreground)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} 
                    itemStyle={{ color: 'hsl(var(--foreground))' }} 
                  />
                  <Line type="monotone" dataKey="participants" stroke="var(--color-primary)" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participation by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDeptData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false} stroke="var(--color-muted-foreground)" />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted-foreground)" />
                  <Tooltip 
                    cursor={{fill: 'var(--color-muted)'}} 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} 
                    itemStyle={{ color: 'hsl(var(--foreground))' }} 
                  />
                  <Bar dataKey="rate" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </SocialPage>
  );
}
