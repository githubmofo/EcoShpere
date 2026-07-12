// app/social/page.tsx
// Member 2 – Social Tab

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";

export default function SocialPage({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (value: string) => {
    if (value === "overview") router.push("/social");
    else router.push(`/social/${value}`);
  };

  const currentTab = pathname === "/social" ? "overview" : pathname.split("/").pop() || "overview";

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social & Community</h1>
          <p className="text-muted-foreground mt-1">Manage CSR activities, diversity metrics, and employee participation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active CSR Activities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anticipated Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,250</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="csr-activities">CSR Activities</TabsTrigger>
          <TabsTrigger value="participation">Participation</TabsTrigger>
          <TabsTrigger value="diversity-training">Diversity & Training</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        {children || (
          <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-medium mb-4">Welcome to Social & Community</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              This module allows you to manage corporate social responsibility (CSR) activities, 
              track employee participation, and monitor key diversity and training metrics across the organization.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/social/csr-activities')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">CSR Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Create and manage community events.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/social/participation')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Participation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Review and approve employee entries.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/social/diversity-training')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Diversity & Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Monitor inclusion and learning metrics.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/social/dashboard')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Analyze overall social impact.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
