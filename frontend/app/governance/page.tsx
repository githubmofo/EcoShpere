// app/governance/page.tsx
// Member 2 – Governance Tab

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, CheckSquare, FileSignature } from "lucide-react";

export default function GovernancePage({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (value: string) => {
    if (value === "overview") router.push("/governance");
    else router.push(`/governance/${value}`);
  };

  const currentTab = pathname === "/governance" ? "overview" : pathname.split("/").pop() || "overview";

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Governance & Compliance</h1>
          <p className="text-muted-foreground mt-1">Manage policies, audits, and compliance tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Compliance Issues</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
            <p className="text-xs text-muted-foreground mt-1">2 overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Acknowledgement</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83%</div>
            <p className="text-xs text-muted-foreground mt-1">Company-wide</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="acknowledgements">Acknowledgements</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="compliance-issues">Compliance Issues</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        {children || (
          <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-medium mb-4">Welcome to Governance & Compliance</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              This module centralizes corporate policies, internal audits, and compliance tracking 
              to ensure organizational integrity and risk mitigation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/governance/policies')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage and distribute corporate policies.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/governance/acknowledgements')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acknowledgements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Track employee policy sign-offs.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/governance/audits')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Audits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Schedule and review internal audits.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/governance/compliance-issues')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Compliance Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Resolve flagged compliance risks.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
