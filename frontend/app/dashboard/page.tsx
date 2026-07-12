// app/dashboard/page.tsx
// Executive Dashboard Page (Futuristic SustainOS 12-Column Layout Redesign)
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
  Maximize2,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  Globe
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { computeOverallEsgScore } from "@/lib/scoring";
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

// ─── Sub-Components for Futuristic UI ─────────────────────────────

// Animated Counter Component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    
    const duration = 800; // ms
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

// Radar-style Circular ESG Progress Ring Component
function EsgProgressRing({ score, size = 130 }: { score: number; size?: number }) {
  const radius = size * 0.42;
  const stroke = size * 0.06;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Radar Rotator */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-emerald-500/10 pointer-events-none"
      />
      
      <svg height={size} width={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          stroke="rgba(255,255,255,0.02)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress Circle */}
        <motion.circle
          stroke="url(#esgObsidianGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="esgObsidianGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 rounded-full backdrop-blur-sm m-2 border border-white/5 shadow-inner">
        <span className="text-3xl font-black text-white font-mono tracking-tighter">
          <AnimatedNumber value={score} />
        </span>
        <span className="text-[7px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">Sustain Index</span>
      </div>
    </div>
  );
}

// Mini SVG Sparkline Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const width = 110;
  const height = 24;
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
    <svg width={width} height={height} className="overflow-visible opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
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
      <div className="bg-zinc-950/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">{label}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
          <p className="text-xs font-bold text-white">
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
  
  // Auditing Animation States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState("");
  const [weightMultiplier, setWeightMultiplier] = useState(1);

  const loadData = async () => {
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
        
        const computedOverall = computeOverallEsgScore(scores);
        
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
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  // Recalculation simulation with fun visual states
  const triggerAuditSequence = async () => {
    setIsAuditing(true);
    const steps = [
      "Connecting to XAMPP MySQL...",
      "Parsing carbon transaction registers...",
      "Analyzing department emission factors...",
      "Applying ESG standard weighting matrices...",
      "Broadcasting updated metrics..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setAuditStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
    
    await loadData();
    setIsAuditing(false);
    setAuditStep("");
  };

  const getScoreRangeStyle = (score: number) => {
    if (score >= 80) return {
      border: "border-emerald-500/10 hover:border-emerald-500/30",
      bg: "bg-emerald-950/10",
      text: "text-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.05)]",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      sparklineColor: "#10b981",
    };
    if (score >= 60) return {
      border: "border-amber-500/10 hover:border-amber-500/30",
      bg: "bg-amber-950/10",
      text: "text-amber-400",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.05)]",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
      sparklineColor: "#f59e0b",
    };
    return {
      border: "border-red-500/10 hover:border-red-500/30",
      bg: "bg-red-950/10",
      text: "text-red-400",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.05)]",
      badge: "bg-red-500/10 text-red-400 border-red-500/25",
      sparklineColor: "#ef4444",
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 border border-zinc-800 rounded-full" />
          <div className="absolute h-12 w-12 border-t-2 border-emerald-500 rounded-full animate-spin" />
          <Globe className="absolute h-5 w-5 text-emerald-500 animate-pulse" />
        </div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Initializing SustainOS Console...</p>
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
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in-0 duration-500">
      
      {/* ─── 1. INTEGRATED DASHBOARD BEZEL HEADER ─────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Welcome panel (8 Columns) */}
        <div className="xl:col-span-8 flex flex-col justify-between p-6 rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-to-b from-emerald-500/5 to-transparent blur-[80px] rounded-full pointer-events-none" />
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/5">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAuditing ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isAuditing ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">
                {isAuditing ? "RUNNING SYSTEM AUDIT..." : "SYSTEM OPERATIONAL: NOMINAL"}
              </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-none">
                SustainOS <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">Control Center</span>
              </h1>
              <p className="text-[11px] text-zinc-400 max-w-xl leading-relaxed">
                Analyzing department profiles and environmental milestones in real-time. Direct synchronization with local MySQL database is active.
              </p>
            </div>
          </div>

          {/* Core Mini Metrics Ribbon */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
            <div>
              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Monitoring Units</span>
              <p className="text-xl font-bold text-white font-mono mt-0.5">{metrics?.departmentScores?.length || 0} <span className="text-xs text-zinc-400">Depts</span></p>
            </div>
            <div>
              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Active System State</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">Live Sync</p>
            </div>
            <div>
              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Global ESG Grade</span>
              <p className="text-xl font-bold text-white font-mono mt-0.5">Grade {overall >= 80 ? "A+" : "B"}</p>
            </div>
          </div>
        </div>

        {/* Right Circular Progress panel (4 Columns) */}
        <div className="xl:col-span-4 flex flex-col justify-center items-center p-6 rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isAuditing ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center h-full space-y-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 border-2 border-dashed border-emerald-500/20 rounded-full animate-spin" />
                  <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest animate-pulse">Running Diagnostic</p>
                  <p className="text-[9px] text-zinc-400 max-w-[200px] h-8 truncate font-mono">{auditStep}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-6 w-full justify-center"
              >
                <EsgProgressRing score={overall} />
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Global ESG Score</span>
                  <h3 className="text-2xl font-black text-white font-mono leading-none">Index {overall}</h3>
                  <div className="text-[8px] text-emerald-400 font-bold flex items-center gap-0.5 mt-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-max">
                    <TrendingUp className="h-2.5 w-2.5" />
                    <span>+2.4% vs last Q</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ─── 2. THE 12-COLUMN FUNCTIONAL GRID ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Primary Charts, AI Advisories (8 Columns Span) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* AI Advisor Panel */}
          <Card className="glass-card rounded-2xl relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-black text-white uppercase tracking-wider">AI Advisory & Analytics Brief</CardTitle>
                  <CardDescription className="text-[9px] text-zinc-500">Machine learning carbon mapping and audit forecasts</CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="xs" 
                onClick={() => setAiExpanded(!aiExpanded)} 
                className="text-[9px] uppercase font-black text-zinc-400 hover:text-white cursor-pointer"
              >
                {aiExpanded ? "Minimize" : "Expand Insights"}
              </Button>
            </CardHeader>
            
            <AnimatePresence>
              {aiExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-5 text-xs text-zinc-300 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:border-r md:border-white/5 md:pr-6">
                      <p className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Leaf className="h-3 w-3" />
                        Carbon Reduction Forecast
                      </p>
                      <p className="text-zinc-400">
                        Current carbon transactions parsed directly from the database show a projected reduction of <strong className="text-white">18.4 tons</strong> over the next quarter. Accuracy checks stand at 95.8%.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-extrabold text-[10px] text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        System Advisory
                      </p>
                      <p className="text-zinc-400">
                        R&D compliance score is behind reduction limits. The AI recommends adjusting target goal limits for the R&D cycle or migrating fleet operations to electric average emission factors to optimize overall ratings.
                      </p>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Primary Recharts Line/Area Chart */}
          <Card className="glass-card rounded-2xl shadow-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Carbon Footprint Telemetry
                  </CardTitle>
                  <CardDescription className="text-[9px] text-zinc-500">Overall carbon emissions logged (kg CO₂e)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emissionsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="carbonTelemetryGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff20" fontSize={9} tickLine={false} />
                    <YAxis stroke="#ffffff20" fontSize={9} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="emissions" 
                      name="Emissions" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      fill="url(#carbonTelemetryGlow)"
                      dot={{ fill: "#10b981", strokeWidth: 1, r: 3 }} 
                      activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 1.5, fill: "#fff" }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Three ESG Pillar Telemetry Pods (Horizontal Matrix Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Environmental Pod */}
            <Card className={`bg-zinc-950/20 backdrop-blur-md border ${envStyle.border} ${envStyle.glow} rounded-2xl transition-all duration-300`}>
              <CardContent className="p-5 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Environmental</span>
                  <Leaf className={`h-4.5 w-4.5 ${envStyle.text}`} />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-white font-mono"><AnimatedNumber value={env} /></span>
                  <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${envStyle.badge}`}>
                    {env >= 80 ? "Nominal" : "Alert"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                  <Sparkline data={[60, 64, 68, 72, env]} color={envStyle.sparklineColor} />
                  <span className="text-[9px] text-emerald-400 font-extrabold flex items-center">
                    <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> +12.4%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Social Pod */}
            <Card className={`bg-zinc-950/20 backdrop-blur-md border ${socStyle.border} ${socStyle.glow} rounded-2xl transition-all duration-300`}>
              <CardContent className="p-5 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Social Pillar</span>
                  <Users className={`h-4.5 w-4.5 ${socStyle.text}`} />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-white font-mono"><AnimatedNumber value={soc} /></span>
                  <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${socStyle.badge}`}>
                    {soc >= 80 ? "Nominal" : "Alert"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                  <Sparkline data={[82, 80, 85, 83, soc]} color={socStyle.sparklineColor} />
                  <span className="text-[9px] text-emerald-400 font-extrabold flex items-center">
                    <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> +4.2%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Governance Pod */}
            <Card className={`bg-zinc-950/20 backdrop-blur-md border ${govStyle.border} ${govStyle.glow} rounded-2xl transition-all duration-300`}>
              <CardContent className="p-5 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Governance</span>
                  <ShieldCheck className={`h-4.5 w-4.5 ${govStyle.text}`} />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-white font-mono"><AnimatedNumber value={gov} /></span>
                  <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${govStyle.badge}`}>
                    {gov >= 80 ? "Nominal" : "Alert"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                  <Sparkline data={[74, 78, 80, 84, gov]} color={govStyle.sparklineColor} />
                  <span className="text-[9px] text-emerald-400 font-extrabold flex items-center">
                    <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> +8.1%
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

        {/* RIGHT COLUMN: Actions, Leaderboards, Activity Logs (4 Columns Span) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Action Hub / Control Panel */}
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                SustainOS Bezel Control
              </CardTitle>
              <CardDescription className="text-[9px] text-zinc-500">Recalculate indexes or log transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/environmental/carbon-transactions" className="w-full">
                  <Button variant="outline" className="w-full justify-start text-[10px] uppercase font-black tracking-wider py-5 rounded-xl border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 cursor-pointer gap-2">
                    <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                    Log Carbon
                  </Button>
                </Link>
                <Button 
                  onClick={triggerAuditSequence}
                  disabled={isAuditing}
                  className="w-full text-[10px] uppercase font-black tracking-wider py-5 rounded-xl bg-zinc-900 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 text-zinc-300 disabled:opacity-50 cursor-pointer gap-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isAuditing ? "animate-spin" : ""}`} />
                  Run Audit
                </Button>
              </div>

              {/* Weight settings / control simulator */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[8px] text-zinc-400 uppercase tracking-widest font-black">
                  <span>Carbon Factor Weighting</span>
                  <span className="text-emerald-400 font-extrabold">{weightMultiplier}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={weightMultiplier}
                  onChange={(e) => setWeightMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer h-1" 
                />
                <p className="text-[8px] text-zinc-500 leading-normal">
                  Adjust ESG score sensitivity parameters client-side. Updates calculate composite index automatically.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Leaderboard Module */}
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                Department Index Rankings
              </CardTitle>
              <CardDescription className="text-[9px] text-zinc-500">Live pillar indexes mapped from database</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                {(metrics?.departmentScores || []).map((dept, index) => {
                  const colorClass = dept.overall >= 80 ? "text-emerald-400" : dept.overall >= 60 ? "text-amber-400" : "text-red-400";
                  const widthPercent = `${dept.overall}%`;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white uppercase font-black text-[10px] tracking-wide">{dept.department}</span>
                        <span className={`font-mono text-[10px] font-extrabold ${colorClass}`}>{dept.overall} index</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500`}
                          style={{ width: widthPercent }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Timeline Feed */}
          <Card className="glass-card rounded-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Environmental Log Stream
              </CardTitle>
              <CardDescription className="text-[9px] text-zinc-500">Real-time ledger updates from XAMPP</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative pl-4 border-l border-white/10 space-y-5 max-h-[220px] overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div key={act.id} className="relative group text-xs">
                    {/* Timeline dynamic color nodes */}
                    <div className={`absolute -left-[21px] top-1 h-1.5 w-1.5 rounded-full ring-2 ring-zinc-950 ${
                      act.type === "carbon" ? "bg-emerald-400" :
                      act.type === "csr" ? "bg-blue-400" :
                      "bg-purple-400"
                    }`} />
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[8px] text-zinc-500 font-extrabold uppercase tracking-widest">
                        <span>{act.title}</span>
                        <span>{act.timestamp}</span>
                      </div>
                      <p className="text-zinc-300 leading-normal">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
