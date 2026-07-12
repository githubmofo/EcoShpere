// app/dashboard/page.tsx
// Member 1 – Executive Dashboard Page (Enhanced Premium Design)
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
  Play,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";

// Custom premium tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
          <p className="text-sm font-extrabold text-white">
            {payload[0].name}: <span className="text-emerald-400">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

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

        const scores: DepartmentScore[] = summaryData.departmentScores || [];
        if (scores.length > 0) {
          const envAvg = scores.reduce((sum, s) => sum + s.environmental, 0) / scores.length;
          const socAvg = scores.reduce((sum, s) => sum + s.social, 0) / scores.length;
          const govAvg = scores.reduce((sum, s) => sum + s.governance, 0) / scores.length;
          
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

  const getScoreRangeStyle = (score: number) => {
    if (score >= 80) return {
      border: "border-green-500/20 hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.08)]",
      text: "text-green-400",
      badge: "bg-green-500/10 text-green-400 border-green-500/20",
      gradient: "from-green-500/5 to-transparent",
      glow: "bg-green-500/10"
    };
    if (score >= 50) return {
      border: "border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]",
      text: "text-amber-400",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      gradient: "from-amber-500/5 to-transparent",
      glow: "bg-amber-500/10"
    };
    return {
      border: "border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]",
      text: "text-red-400",
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      gradient: "from-red-500/5 to-transparent",
      glow: "bg-red-500/10"
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-background">
        <div className="relative flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-emerald-500 animate-spin" />
          <p className="text-xs text-muted-foreground animate-pulse font-medium tracking-wider uppercase">Loading EcoSphere Summary...</p>
        </div>
      </div>
    );
  }

  const env = metrics?.environmentalScore ?? 0;
  const soc = metrics?.socialScore ?? 0;
  const gov = metrics?.governanceScore ?? 0;
  const overall = metrics?.overallScore ?? 0;

  const envStyle = getScoreRangeStyle(env);
  const socStyle = getScoreRangeStyle(soc);
  const govStyle = getScoreRangeStyle(gov);
  const overallStyle = getScoreRangeStyle(overall);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      
      {/* Premium Hero Header Section */}
      <div className="relative overflow-hidden p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Live ESG Analytics Enabled
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none">
              Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Ansh Nayak</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Monitor real-time compliance matrices, log departmental carbon footprints, and track governance guidelines inside the EcoSphere platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/environmental/carbon-transactions">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl gap-2 font-bold px-5 py-5 shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.03]">
                <Plus className="h-4 w-4" />
                Log Carbon Data
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* TOP ROW: 4 metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Environmental Card */}
        <Card className={`group bg-slate-900/40 backdrop-blur-md border relative overflow-hidden transition-all duration-500 ${envStyle.border}`}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${envStyle.gradient} rounded-bl-full pointer-events-none`} />
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Environmental</CardTitle>
            <div className="p-2 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
              <Leaf className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-5xl font-black tracking-tight ${envStyle.text}`}>{env}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold ${envStyle.badge}`}>
                {env >= 80 ? "Excellent" : env >= 50 ? "Warning" : "Critical"}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${env}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">Carbon footprints, limits & goals</p>
          </CardContent>
        </Card>

        {/* Social Card */}
        <Card className={`group bg-slate-900/40 backdrop-blur-md border relative overflow-hidden transition-all duration-500 ${socStyle.border}`}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${socStyle.gradient} rounded-bl-full pointer-events-none`} />
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Social</CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-5xl font-black tracking-tight ${socStyle.text}`}>{soc}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold ${socStyle.badge}`}>
                {soc >= 80 ? "Excellent" : soc >= 50 ? "Warning" : "Critical"}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${soc}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">CSR activities & staff diversity</p>
          </CardContent>
        </Card>

        {/* Governance Card */}
        <Card className={`group bg-slate-900/40 backdrop-blur-md border relative overflow-hidden transition-all duration-500 ${govStyle.border}`}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${govStyle.gradient} rounded-bl-full pointer-events-none`} />
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Governance</CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-5xl font-black tracking-tight ${govStyle.text}`}>{gov}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold ${govStyle.badge}`}>
                {gov >= 80 ? "Excellent" : gov >= 50 ? "Warning" : "Critical"}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${gov}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">Audits, policies & compliance</p>
          </CardContent>
        </Card>

        {/* Overall ESG Score Card */}
        <Card className={`group bg-slate-950/60 backdrop-blur-md border relative overflow-hidden transition-all duration-500 shadow-2xl ${overallStyle.border}`}>
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xs font-black text-white uppercase tracking-wider">Overall ESG Index</CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:rotate-12 transition-transform">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-5xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent`}>{overall}</span>
              <span className={`text-xs px-3 py-0.5 rounded-full border font-black uppercase tracking-wider ${overallStyle.badge}`}>
                Grade {overall >= 90 ? "A+" : overall >= 80 ? "A" : overall >= 70 ? "B" : overall >= 60 ? "C" : "D"}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500" style={{ width: `${overall}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">Pillar weighted score index rating</p>
          </CardContent>
        </Card>

      </div>

      {/* MIDDLE ROW: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Emissions Trend line chart */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400 animate-bounce" />
                  GHG Emissions Trend
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Total periodic carbon output footprint (kg CO₂e)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="emissions" 
                    name="Emissions" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fill="url(#glowEmissions)"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Department ESG Ranking bar chart */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              Department ESG Leaderboard
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">ESG compliance rating index comparison per business unit</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.departmentScores || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="department" stroke="#ffffff30" fontSize={10} tickLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="overall" name="ESG Index" radius={[8, 8, 0, 0]}>
                    {(metrics?.departmentScores || []).map((entry, index) => {
                      const color = entry.overall >= 80 ? "#10b981" : entry.overall >= 60 ? "#f59e0b" : "#ef4444";
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={color} 
                          fillOpacity={0.7}
                          className="hover:fill-opacity-100 transition-all duration-300 cursor-pointer"
                        />
                      );
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
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-3 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Activity Monitor</CardTitle>
            <CardDescription className="text-xs text-slate-400">Real-time ESG event log stream across all business departments</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {activities.map((act) => (
                <div 
                  key={act.id} 
                  className="flex gap-4 p-3 rounded-2xl hover:bg-slate-800/40 border border-transparent hover:border-white/5 transition-all duration-300"
                >
                  <div className={`p-2.5 h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
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
                      <p className="text-xs font-bold text-white tracking-wide truncate">{act.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>{act.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.description}</p>
                    {act.user && (
                      <div className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Author: {act.user}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick Actions card */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider">Operational Console</CardTitle>
            <CardDescription className="text-xs text-slate-400">Navigation pathways to handle administrative actions</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Link href="/environmental/carbon-transactions" className="block w-full">
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-center justify-center gap-3.5 h-32 rounded-2xl border-white/5 bg-slate-950/40 hover:bg-green-500/5 hover:border-green-500/30 group transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 group-hover:scale-110 transition-all duration-300 shadow-md">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Log Carbon</span>
                </Button>
              </Link>

              <Link href="/gamification/challenges" className="block w-full">
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-center justify-center gap-3.5 h-32 rounded-2xl border-white/5 bg-slate-950/40 hover:bg-amber-500/5 hover:border-amber-500/30 group transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400 group-hover:scale-110 transition-all duration-300 shadow-md">
                    <Play className="h-5 w-5 fill-amber-500/20" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Start Challenge</span>
                </Button>
              </Link>

              <Link href="/reports" className="block w-full">
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-center justify-center gap-3.5 h-32 rounded-2xl border-white/5 bg-slate-950/40 hover:bg-cyan-500/5 hover:border-cyan-500/30 group transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-all duration-300 shadow-md">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">View Reports</span>
                </Button>
              </Link>

            </div>

            <div className="p-4.5 rounded-2xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 leading-relaxed relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex gap-2 items-start pl-1">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Analytics Tip:</strong> Weights for environmental score calculations are managed under ESG Configuration in Settings. Keep thresholds below target caps to ensure an <strong>A+ Grade</strong> score status!
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}
