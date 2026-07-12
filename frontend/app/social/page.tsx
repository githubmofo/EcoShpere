// app/social/page.tsx
// Member 2 – Social Tab

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";
import { mockCsrActivities } from "@/lib/mock-data";

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
            <h3 className="text-2xl font-bold tracking-tight mb-2 text-slate-800 dark:text-slate-100">Social Command Center</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl text-sm">
              Real-time insights into corporate social responsibility, diversity metrics, and employee participation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 auto-rows-fr">
              {/* Bento 1: Large Hero - Recent Activities */}
              <div 
                className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-xl border bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-slate-900 p-6 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] group"
                onClick={() => router.push('/social/csr-activities')}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-32 h-32 text-orange-600" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <h4 className="text-lg font-bold text-orange-900 dark:text-orange-400 mb-1">Active CSR Campaigns</h4>
                  <p className="text-sm text-orange-800/70 dark:text-orange-200/50 mb-6">Drive community impact</p>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    {mockCsrActivities.slice(0, 2).map((act) => (
                      <div key={act.id} className="bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm p-4 rounded-lg border border-orange-200/50 dark:border-orange-900/50 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{act.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{act.category} • {act.participantCount} Participants</p>
                        </div>
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded text-[10px] font-bold uppercase tracking-wider">{act.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bento 2: Participation Trends */}
              <div 
                className="md:col-span-1 md:row-span-1 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between group"
                onClick={() => router.push('/social/participation')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Participation</h4>
                    <p className="text-xs text-muted-foreground mt-1">Pending Approvals</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                    <Users className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">128</span>
                  <span className="text-sm text-muted-foreground ml-2">Total</span>
                </div>
              </div>

              {/* Bento 3: Diversity & Training */}
              <div 
                className="md:col-span-1 md:row-span-1 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between group"
                onClick={() => router.push('/social/diversity-training')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Training Completion</h4>
                    <p className="text-xs text-muted-foreground mt-1">Company-wide</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                    <Award className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">80%</span>
                  <div className="w-full max-w-[80px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5 ml-3">
                    <div className="h-full bg-orange-500 w-[80%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
