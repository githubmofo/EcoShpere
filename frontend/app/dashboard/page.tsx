// app/dashboard/page.tsx
// Member 1 – Executive Dashboard Page (Premium Vision Control Center Redesign)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  TrendingDown,
  Activity,
  BrainCircuit,
  Maximize2
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

// ─── Sub-Components for Premium UI ─────────────────────────────

// Animated Counter Component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    const duration = 1200; // ms
    const increment = end / (duration / 16); // 60 FPS
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

// Circular ESG Progress Ring Component
function EsgProgressRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = size * 0.4;
  const stroke = size * 0.08;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg height={size} width={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress Circle */}
        <motion.circle
          stroke="url(#esgGrad)"
          fill="transparent"
          strokeWidth={stroke + 1}
          strokeDasharray={circumference + " " + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          className="shadow-xl"
        />
        <defs>
          <linearGradient id="esgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
            <stop offset="50%" stopColor="#3b82f6" /> {/* Electric Blue */}
            <stop offset="100%" stopColor="#8b5cf6" /> {/* Purple */}
          </linearGradient>
        </defs>
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none font-mono">
          <AnimatedNumber value={score} />
        </span>
        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Index</span>
      </div>
    </div>
  );
}

// Mini SVG Sparkline Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const width = 120;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Recharts Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
          <p className="text-xs font-black text-white">
            {payload[0].name}: <span className="text-emerald-400 font-extrabold">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────

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
  const [aiExpanded, setAiExpanded] = useState(true);

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
        console.error("Dashboard data load error:", err);
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
      sparklineColor: "#22c55e",
      gradient: "from-green-500/5 to-transparent"
    };
    if (score >= 50) return {
      border: "border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]",
      text: "text-amber-400",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      sparklineColor: "#eab308",
      gradient: "from-amber-500/5 to-transparent"
    };
    return {
      border: "border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]",
      text: "text-red-400",
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      sparklineColor: "#ef4444",
      gradient: "from-red-500/5 to-transparent"
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing ESG Mission Control...</p>
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
      
      {/* 1. EXECUTIVE HERO BANNER */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-[350px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-blue-500/5 blur-[60px] rounded-full pointer-events-none animate-pulse" />
        
        <div className="space-y-3 z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Live ESG Console Status: Nominal
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">
            Good Morning, <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Ansh Nayak</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Welcome to the Executive Command Center. Our systems are currently analyzing 5 major department portfolios. The average ESG score is rated as <span className="text-emerald-400 font-bold">Excellent</span>.
          </p>
        </div>

        {/* Circular ESG Index Ring */}
        <div className="flex items-center gap-4 bg-slate-950/40 p-4.5 rounded-2xl border border-white/5 z-10">
          <EsgProgressRing score={overall} />
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Index</span>
            <p className="text-sm font-black text-white leading-none">Grade {overall >= 80 ? "A+" : "B"}</p>
            <p className="text-[9px] text-green-400 font-bold flex items-center gap-0.5 mt-1.5">
              <TrendingUp className="h-3 w-3" />
              <span>+2.4% vs last period</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. AI EXECUTIVE BRIEF PANEL */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <Card className="bg-slate-950/60 backdrop-blur-xl border border-emerald-500/20 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-emerald-500/[0.02] border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BrainCircuit className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-xs font-black text-white uppercase tracking-wider">AI Executive Brief</CardTitle>
                <CardDescription className="text-[10px] text-slate-400">Machine learning carbon & compliance projections</CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="xs" 
              onClick={() => setAiExpanded(!aiExpanded)} 
              className="text-[10px] uppercase font-black tracking-wider text-slate-400 hover:text-white cursor-pointer"
            >
              {aiExpanded ? "Collapse" : "Expand Insights"}
            </Button>
          </CardHeader>
          
          <AnimatePresence>
            {aiExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CardContent className="p-6 space-y-4 text-xs leading-relaxed text-slate-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 border-r border-white/5 pr-6">
                      <p className="font-bold text-white uppercase text-[10px] tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Leaf className="h-3.5 w-3.5" />
                        Carbon Reduction Forecast
                      </p>
                      <p>
                        Current carbon transactions mapped inside **Operations** and **Facilities** show a projected reduction of **18.4 tons** over the next quarter. Enabling smart calculation configurations client-side has improved mapping accuracy by **95%**.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-white uppercase text-[10px] tracking-wider text-blue-400 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        System Recommendation
                      </p>
                      <p>
                        R&D compliance score is at **65** (behind reduction limits). The AI recommends adjusting target goal limits for the R&D cycle or migrating fleet operations to electric average emission factors to optimize overall ratings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* 3. KPI CARDS (Environmental, Social, Governance, Overall) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Environmental */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <Card className={`group bg-slate-900/40 backdrop-blur-md border relative overflow-hidden transition-all duration-500 rounded-3xl ${envStyle.border}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environmental</CardTitle>
              <div className="p-2 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                <Leaf className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className={`text-4xl font-black tracking-tight ${envStyle.text}`}><AnimatedNumber value={env} /></span>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${envStyle.badge}`}>
                  {env >= 80 ? "On Track" : "Alert"}
                </span>
              </div>
              
              {/* Sparkline Visual */}
              <div className="py-1">
                <Sparkline data={[65, 70, 68, 74, 82, env]} color={envStyle.sparklineColor} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Carbon accounting</span>
                <span className="font-bold text-green-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +12%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className={`group bg-slate-900/40 backdrop-blur-md border relative overflow-hidden transition-all duration-500 rounded-3xl ${socStyle.border}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Social</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className={`text-4xl font-black tracking-tight ${socStyle.text}`}><AnimatedNumber value={soc} /></span>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${socStyle.badge}`}>
                  {soc >= 80 ? "On Track" : "Alert"}
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="py-1">
                <Sparkline data={[82, 80, 85, 83, 81, soc]} color={socStyle.sparklineColor} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>CSR activity rate</span>
                <span className="font-bold text-blue-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +4%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Governance */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Card className={`group bg-slate-900/40 backdrop-blur-md border relative overflow-hidden transition-all duration-500 rounded-3xl ${govStyle.border}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Governance</CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className={`text-4xl font-black tracking-tight ${govStyle.text}`}><AnimatedNumber value={gov} /></span>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${govStyle.badge}`}>
                  {gov >= 80 ? "On Track" : "Alert"}
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="py-1">
                <Sparkline data={[78, 80, 84, 82, 85, gov]} color={govStyle.sparklineColor} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Audited policies</span>
                <span className="font-bold text-purple-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +8%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overall ESG Score */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className={`group bg-slate-950/60 backdrop-blur-md border relative overflow-hidden transition-all duration-500 rounded-3xl ${overallStyle.border}`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none animate-pulse" />
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-[10px] font-black text-white uppercase tracking-wider">Overall ESG Index</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Award className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-black tracking-tight text-white"><AnimatedNumber value={overall} /></span>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${overallStyle.badge}`}>
                  Grade {overall >= 90 ? "A+" : "A"}
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="py-1">
                <Sparkline data={[75, 77, 80, 79, 82, overall]} color="#10b981" />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Composite ratings</span>
                <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +6%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* 4. ANALYTICS (Emissions Trend & Rankings) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Emissions Trend line chart */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Carbon Footprint Trend
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">Overall carbon emissions logged (kg CO₂e)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowEmissionsMain" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#glowEmissionsMain)"
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
            <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              Department ESG Leaderboard
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400">Pillar score index mapping per department unit</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.departmentScores || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="department" stroke="#ffffff30" fontSize={10} tickLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="overall" name="ESG score" radius={[8, 8, 0, 0]}>
                    {(metrics?.departmentScores || []).map((entry, index) => {
                      const color = entry.overall >= 80 ? "#10b981" : entry.overall >= 60 ? "#eab308" : "#ef4444";
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

      {/* 5. TIMELINE & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Activity list */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-3 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-xs font-black text-white uppercase tracking-wider">Event Timeline</CardTitle>
            <CardDescription className="text-[10px] text-slate-400">Dynamic log feed of sustainability events</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative pl-6 border-l border-white/10 space-y-6 max-h-[320px] overflow-y-auto pr-1">
              {activities.map((act, idx) => (
                <motion.div 
                  key={act.id} 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * idx, duration: 0.4 }}
                  className="relative group"
                >
                  {/* Timeline Glow Node */}
                  <div className={`absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border ring-4 ring-slate-950 shrink-0 ${
                    act.type === "carbon" ? "bg-green-500 border-green-500/40" :
                    act.type === "csr" ? "bg-blue-500 border-blue-500/40" :
                    act.type === "compliance" ? "bg-purple-500 border-purple-500/40" :
                    "bg-amber-500 border-amber-500/40"
                  }`} />
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{act.title}</span>
                      <span>{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed">{act.description}</p>
                    {act.user && (
                      <span className="text-[9px] text-emerald-400 font-bold block mt-1 uppercase tracking-wider">Author: {act.user}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick Actions card */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-xs font-black text-white uppercase tracking-wider">Command Console</CardTitle>
            <CardDescription className="text-[10px] text-slate-400">Launch workflows or trigger audits</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Link href="/environmental/carbon-transactions" className="block w-full">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl border border-white/5 bg-slate-950/50 hover:bg-green-500/5 hover:border-green-500/30 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.12)] cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 group-hover:scale-105 transition-all shadow-md">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">Log Carbon</span>
                </motion.div>
              </Link>

              <Link href="/gamification/challenges" className="block w-full">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl border border-white/5 bg-slate-950/50 hover:bg-amber-500/5 hover:border-amber-500/30 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)] cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400 group-hover:scale-105 transition-all shadow-md">
                    <Play className="h-5 w-5 fill-amber-500/10" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">Start Goal</span>
                </motion.div>
              </Link>

              <Link href="/reports" className="block w-full">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center gap-3 h-32 rounded-2xl border border-white/5 bg-slate-950/50 hover:bg-cyan-500/5 hover:border-cyan-500/30 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-all shadow-md">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">View Reports</span>
                </motion.div>
              </Link>

            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 text-[11px] text-slate-400 leading-relaxed relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex gap-2.5 items-start pl-1">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>AI Advisor:</strong> Current carbon logs are performing under target benchmarks. Complete the active "Carbon Challenge" in settings to unlock additional ESG weight bonuses!
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}
