"use client";

import { useEffect, useState } from "react";
import { DiversitySummary } from "@/lib/types";
import { apiGet } from "@/lib/api-client";
import SocialPage from "../page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function DiversityTrainingPage() {
  const [data, setData] = useState<DiversitySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DiversitySummary>("/social/diversity-summary")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <SocialPage>
        <div className="text-center py-12">Loading metrics...</div>
      </SocialPage>
    );
  }

  return (
    <SocialPage>
      <div className="mb-6 mt-4">
        <h2 className="text-xl font-semibold">Diversity & Training Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">Key metrics for company demographics and ESG training.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Overall company demographic breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.genderDistribution} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="percentage" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mandatory ESG Training</CardTitle>
            <CardDescription>Company-wide completion rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[250px]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-bold">{data.trainingCompletion.percentage}%</span>
              <span className="text-muted-foreground">
                {data.trainingCompletion.completed} / {data.trainingCompletion.total} employees
              </span>
            </div>
            <Progress value={data.trainingCompletion.percentage} className="h-4" />
            <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
              Target: 100% completion by end of Q3. Unfinished employees have been sent automated reminders.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Age Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ageGroups} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="percentage" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </SocialPage>
  );
}
