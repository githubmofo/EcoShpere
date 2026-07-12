// app/dashboard/page.tsx
// Member 1 – Executive Dashboard Page
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Leaf, 
  Users, 
  ShieldCheck, 
  Award, 
  ArrowUpRight, 
  TrendingUp, 
  Zap, 
  Plus, 
  FileText, 
  Play 
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { calculateOverallScore } from "@/lib/scoring";
import { 
  DepartmentScore, 
  EmissionsPoint, 
  RecentActivityItem 
} from "@/lib/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<{
    environmentalScore: number;
    socialScore: number;
    governanceScore: number;
    overallScore: number;
    departmentScores: DepartmentScore[];
  } | null>(null);

  const [emissionsTrend, setEmissionsTrend] = useState<EmissionsPoint[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryData, trendData, activityData] = await Promise.all([
          apiGet<any>("/dashboard/summary"),
          apiGet<EmissionsPoint[]>("/dashboard/emissions-trend"),
          apiGet<RecentActivityItem[]>("/dashboard/recent-activity")
        ]);

        // Recalculate Overall ESG Score client-side using scoring.ts rules
        const scores: DepartmentScore[] = summaryData.departmentScores || [];
        if (scores.length > 0) {
          const envAvg = scores.reduce((sum, s) => sum + s.environmental, 0) / scores.length;
          const socAvg = scores.reduce((sum, s) => sum + s.social, 0) / scores.length;
          const govAvg = scores.reduce((sum, s) => sum + s.governance, 0) / scores.length;
          
          // Using default configuration weights (0.4, 0.3, 0.3)
          const computedOverall = calculateOverallScore(envAvg, socAvg, govAvg);
          
          setMetrics({
            environmentalScore: Math.round(envAvg),
            socialScore: Math.round(socAvg),
            governanceScore: Math.round(govAvg),
            overallScore: Math.round(computedOverall),
            departmentScores: scores
          });
        } else {
          setMetrics({
            environmentalScore: summaryData.environmentalScore,
            socialScore: summaryData.socialScore,
            governanceScore: summaryData.governanceScore,
            overallScore: summaryData.overallScore,
            departmentScores: []
          });
        }

        setEmissionsTrend(trendData);
        setActivities(activityData);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Return color-coding class ranges (>=80 green, 50-79 yellow, <50 red)
  const getScoreRangeStyle = (score: number) => {
    if (score >= 80) return { border: "border-green-500/20 hover:border-green-500/40", text: "text-green-400", badge: "bg-green-500/10 text-green-400 border-green-500/20" };
    if (score >= 50) return { border: "border-yellow-500/20 hover:border-yellow-500/40", text: "text-yellow-400", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
    return { border: "border-red-500/20 hover:border-red-500/40", text: "text-red-400", badge: "bg-red-500/10 text-red-400 border-red-500/20" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // Fallbacks
  const env = metrics?.environmentalScore ?? 0;
  const soc = metrics?.socialScore ?? 0;
  const gov = metrics?.governanceScore ?? 0;
  const overall = metrics?.overallScore ?? 0;

  const envStyle = getScoreRangeStyle(env);
  const socStyle = getScoreRangeStyle(soc);
  const govStyle = getScoreRangeStyle(gov);
  const overallStyle = getScoreRangeStyle(overall);

  return (
    <div className="space-y-6">
      
      {/* Introduction Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 to-transparent p-6 rounded-2xl border border-emerald-500/10">
        <div>
          <h2 className="text-xl font-bold text-foreground">Welcome back, Ansh!</h2>
          <p className="text-sm text-muted-foreground mt-1">Here is a summary of EcoSphere's environmental impact and ESG compliance stats.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/environmental/carbon-transactions">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 font-medium">
              <Plus className="h-4 w-4" />
              Log Carbon Data
            </Button>
          </Link>
        </div>
      </div>

      {/* TOP ROW: 4 metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Environmental Score Card */}
        <Card className={`bg-card/40 backdrop-blur-sm border transition-all duration-300 ${envStyle.border}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Environmental Score</CardTitle>
            <Leaf className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className={`text-4xl font-extrabold tracking-tight ${envStyle.text}`}>{env}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${envStyle.badge}`}>
                {env >= 80 ? "On Track" : env >= 50 ? "Caution" : "Critical"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Carbon efficiency & target goals</p>
          </CardContent>
        </Card>

        {/* Social Score Card */}
        <Card className={`bg-card/40 backdrop-blur-sm border transition-all duration-300 ${socStyle.border}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Social Score</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className={`text-4xl font-extrabold tracking-tight ${socStyle.text}`}>{soc}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${socStyle.badge}`}>
                {soc >= 80 ? "On Track" : soc >= 50 ? "Caution" : "Critical"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">CSR activities & staff diversity</p>
          </CardContent>
        </Card>

        {/* Governance Score Card */}
        <Card className={`bg-card/40 backdrop-blur-sm border transition-all duration-300 ${govStyle.border}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Governance Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className={`text-4xl font-extrabold tracking-tight ${govStyle.text}`}>{gov}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${govStyle.badge}`}>
                {gov >= 80 ? "On Track" : gov >= 50 ? "Caution" : "Critical"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Audits, policies & compliance</p>
          </CardContent>
        </Card>

        {/* Overall ESG Score Card */}
        <Card className={`bg-card/45 backdrop-blur-sm border relative overflow-hidden transition-all duration-300 ${overallStyle.border}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Overall ESG Score</CardTitle>
            <Award className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className={`text-4xl font-black tracking-tight ${overallStyle.text}`}>{overall}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${overallStyle.badge}`}>
                Grade {overall >= 90 ? "A+" : overall >= 80 ? "A" : overall >= 70 ? "B" : overall >= 60 ? "C" : "D"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Weighted average of E, S, and G</p>
          </CardContent>
        </Card>

      </div>

      {/* MIDDLE ROW: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Emissions Trend line chart */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Carbon Emissions Trend
                </CardTitle>
                <CardDescription className="text-xs">Weekly and monthly aggregate GHG emissions (kg CO₂e)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emissionsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #ffffff1a" }} 
                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emissions" 
                    name="Emissions" 
                    stroke="#22c55e" 
                    strokeWidth={3} 
                    dot={{ fill: "#22c55e", r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Department ESG Ranking bar chart */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              Department ESG Performance
            </CardTitle>
            <CardDescription className="text-xs">Comparison of average overall compliance score per department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.departmentScores || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                  <XAxis dataKey="department" stroke="#ffffff40" fontSize={11} tickLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #ffffff1a" }} 
                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  />
                  <Bar dataKey="overall" name="Overall score" radius={[6, 6, 0, 0]}>
                    {(metrics?.departmentScores || []).map((entry, index) => {
                      const color = entry.overall >= 80 ? "#22c55e" : entry.overall >= 60 ? "#fbbf24" : "#f87171";
                      return <Cell key={`cell-${index}`} fill={color} opacity={0.8} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* BOTTOM ROW: Activity & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Activity list */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Recent Activities</CardTitle>
            <CardDescription className="text-xs">Real-time status updates from environmental, social, and governance modules</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-4 p-3 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/30 transition-all duration-200">
                  <div className={`p-2 h-9 w-9 rounded-xl border flex items-center justify-center ${
                    act.type === "carbon" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    act.type === "csr" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    act.type === "compliance" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {act.type === "carbon" ? <Leaf className="h-4 w-4" /> :
                     act.type === "csr" ? <Users className="h-4 w-4" /> :
                     act.type === "compliance" ? <ShieldCheck className="h-4 w-4" /> :
                     <Award className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-foreground truncate">{act.title}</p>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{act.description}</p>
                    {act.user && (
                      <span className="text-[10px] text-emerald-400/80 block mt-1.5 font-medium">Logged by: {act.user}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick Actions card */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold">Quick Operations</CardTitle>
            <CardDescription className="text-xs">Quick navigation shortcuts to perform daily operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Link href="/environmental/carbon-transactions" className="block w-full">
                <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-3 h-28 rounded-2xl hover:bg-green-500/5 hover:border-green-500/30 group">
                  <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 group-hover:scale-110 transition-all">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">Log Carbon Data</span>
                </Button>
              </Link>

              <Link href="/gamification/challenges" className="block w-full">
                <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-3 h-28 rounded-2xl hover:bg-amber-500/5 hover:border-amber-500/30 group">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-all">
                    <Play className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">Start Challenge</span>
                </Button>
              </Link>

              <Link href="/reports" className="block w-full">
                <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-3 h-28 rounded-2xl hover:bg-cyan-500/5 hover:border-cyan-500/30 group">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-all">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">View Reports</span>
                </Button>
              </Link>

            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-xs text-muted-foreground mt-2 leading-relaxed">
              <strong>Tip:</strong> Automatic emission calculations can be enabled in settings. If enabled, the system uses custom emission factors to compute CO₂ emissions automatically based on log quantities.
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}
