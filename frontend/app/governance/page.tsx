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
            <h3 className="text-2xl font-bold tracking-tight mb-2 text-slate-800 dark:text-slate-100">Governance Command Center</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl text-sm">
              Centralized oversight for corporate policies, internal audits, and critical compliance risk mitigation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 auto-rows-fr">
              {/* Bento 1: Large Hero - Compliance Issues */}
              <div 
                className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-xl border border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-slate-900 p-6 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] group"
                onClick={() => router.push('/governance/compliance-issues')}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldAlert className="w-32 h-32 text-red-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <h4 className="text-lg font-bold text-red-900 dark:text-red-400">Critical Compliance Flags</h4>
                  </div>
                  <p className="text-sm text-red-800/70 dark:text-red-200/50 mb-6">Action required immediately</p>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    {/* Hardcoded slice of mockComplianceIssues for visual impact */}
                    <div className="bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm p-4 rounded-lg border border-red-200/50 dark:border-red-900/50 flex justify-between items-center">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Unencrypted backups</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">Database backups to offsite storage are not encrypted at rest.</p>
                      </div>
                      <span className="shrink-0 px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-[10px] font-bold uppercase tracking-wider">Overdue</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm p-4 rounded-lg border border-red-200/50 dark:border-red-900/50 flex justify-between items-center">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Missing MFA on legacy systems</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">Internal applications do not enforce Multi-Factor Authentication.</p>
                      </div>
                      <span className="shrink-0 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded text-[10px] font-bold uppercase tracking-wider">High</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento 2: Policy Acknowledgements */}
              <div 
                className="md:col-span-1 md:row-span-1 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between group"
                onClick={() => router.push('/governance/acknowledgements')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Policy Ack Rate</h4>
                    <p className="text-xs text-muted-foreground mt-1">Company-wide Goal: 100%</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                    <CheckSquare className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">87%</span>
                  <div className="w-full max-w-[80px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5 ml-3">
                    <div className="h-full bg-red-500 w-[87%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Bento 3: Audits */}
              <div 
                className="md:col-span-1 md:row-span-1 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between group"
                onClick={() => router.push('/governance/audits')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Scheduled Audits</h4>
                    <p className="text-xs text-muted-foreground mt-1">Next 30 Days</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                    <FileSignature className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">1</span>
                  <span className="text-sm text-muted-foreground ml-2">HR Compliance Review</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
