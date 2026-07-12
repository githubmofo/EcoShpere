// app/environmental/page.tsx
// Member 1 – Environmental Intelligence Center Landing Page (Premium Redesign)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Leaf, 
  Target, 
  Award, 
  ShieldAlert, 
  BarChart3, 
  FileSpreadsheet, 
  Settings, 
  Globe,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Flame,
  LineChart,
  Grid
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { CarbonTransaction, EnvironmentalGoal } from "@/lib/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Planet Health Score Circular Progress
function PlanetHealthScoreRing({ score }: { score: number }) {
  const size = 180;
  const radius = size * 0.4;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer spinning dash ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-emerald-500/10"
      />
      
      <svg height={size} width={size} className="transform -rotate-90 z-10">
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
          stroke="url(#planetHealthGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="planetHealthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Score Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <span className="text-4xl font-black text-white leading-none font-mono tracking-tighter">
          {score}%
        </span>
        <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mt-1">Health Index</span>
      </div>
    </div>
  );
}

export default function EnvironmentalLandingPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiGet<any>("/environmental/summary");
        setSummary(data);
      } catch (err) {
        console.error("Failed to load environmental landing stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEmissions = summary?.totalEmissions ?? 25157;
  const activeGoals = summary?.activeGoals ?? 3;
  const avgAchievement = summary?.avgAchievement ?? 84;

  const navCards = [
    {
      title: "Emission Factors Studio",
      desc: "Configure raw energy conversion multipliers into CO₂ values.",
      href: "/environmental/emission-factors",
      icon: FileSpreadsheet,
      glow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-green-500/30",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/5"
    },
    {
      title: "Carbon Operations Center",
      desc: "Log departmental fuel usage, packaging and grid offsets.",
      href: "/environmental/carbon-transactions",
      icon: Leaf,
      glow: "hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:border-blue-500/30",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/5"
    },
    {
      title: "Strategic Goals Roadmap",
      desc: "Establish ESG thresholds, limits and reduction objectives.",
      href: "/environmental/goals",
      icon: Target,
      glow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:border-purple-500/30",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/5"
    },
    {
      title: "Environmental Analytics",
      desc: "Deep-dive carbon trend forecasting and source distribution.",
      href: "/environmental/dashboard",
      icon: BarChart3,
      glow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/30",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/5"
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Entering Environmental Intel Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      
      {/* 1. INTEL CENTER HERO */}
      <div className="relative overflow-hidden p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="space-y-4 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-wider">
            <Cpu className="h-3.5 w-3.5" />
            Module Mode: Mission Control
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            Environmental <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Intelligence Center</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Monitor organizational carbon offset accounting, adjust emission multiplier indexes, and manage sustainability limits cycles for Fortune 500 ESG compliance reporting.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">CO₂ buffer</span>
              <p className="text-xs font-black text-green-400 mt-1 font-mono">9,843 kg left</p>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Offset credits</span>
              <p className="text-xs font-black text-white mt-1 font-mono">1,245 Verified</p>
            </div>
          </div>
        </div>

        {/* Planet Health score circular widget */}
        <div className="flex items-center gap-6 bg-slate-950/30 p-6 rounded-3xl border border-white/5">
          <PlanetHealthScoreRing score={92} />
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Planet Health</span>
            <p className="text-sm font-black text-green-400">Class: Excellent</p>
            <p className="text-xs text-slate-300">Target reduction objectives are **92%** mapped and under corporate limits.</p>
          </div>
        </div>
      </div>

      {/* 2. ENVIRONMENTAL STATUS RIBBON (Alert Ticker) */}
      <div className="p-4 bg-muted border border-border rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-4.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-wider shrink-0">
          <Flame className="h-3.5 w-3.5" />
          Status Feed
        </div>
        <div className="flex-1 overflow-hidden text-xs text-foreground/80 font-semibold tracking-wide flex flex-col sm:flex-row gap-4 sm:gap-8 justify-around">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Operations logged 15,000 kWh Grid Average offset</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> Warning: R&D department is nearing goal limits</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Sales logged 800 miles Fleet travel</span>
        </div>
      </div>

      {/* 3. ENVIRONMENTAL SUMMARY KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Carbon Output */}
        <Card className="bg-card backdrop-blur-md border border-border rounded-3xl relative overflow-hidden hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Carbon Emissions</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground font-mono tracking-tighter">
              {totalEmissions.toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">kg CO₂e</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Aggregated energy logs footprint index</p>
          </CardContent>
        </Card>

        {/* KPI 2: Saved Carbon */}
        <Card className="bg-card backdrop-blur-md border border-border rounded-3xl relative overflow-hidden hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Reduction Targets</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground font-mono tracking-tighter">
              {activeGoals} <span className="text-xs font-semibold text-muted-foreground">Departments</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Active reduction goals mapped under cycle</p>
          </CardContent>
        </Card>

        {/* KPI 3: Goal Achievement */}
        <Card className="bg-card backdrop-blur-md border border-border rounded-3xl relative overflow-hidden hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Goal Achievement Rate</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-500 font-mono tracking-tighter">
              {avgAchievement}%
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Average progress of all active goal caps</p>
          </CardContent>
        </Card>

      </div>

      {/* 4. AI ENVIRONMENTAL INSIGHTS */}
      <Card className="bg-card border border-green-500/20 rounded-3xl relative overflow-hidden shadow-lg">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 z-10">
          <div className="space-y-1.5 flex-1 pl-1">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest block flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              AI Environmental Advisor
            </span>
            <p className="text-xs text-foreground font-bold leading-normal mt-1">
              "We project Operations will hit its reduction cap within 14 days if manufacturing emission multipliers remain active. Consider migrating grid average multipliers to solar indexes."
            </p>
          </div>
          <Link href="/environmental/goals" className="shrink-0">
            <Button className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-2 font-bold px-4 py-3 shadow-[0_4px_15px_rgba(22,163,74,0.2)] transition-all cursor-pointer">
              Go to Roadmap
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 5. tabs replacement (Large Premium Navigation Cards) */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Sustain OS Command Centers</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {navCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link href={card.href} key={index} className="block">
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-card backdrop-blur-md border border-border rounded-3xl p-6 h-48 flex flex-col justify-between transition-all duration-300 cursor-pointer ${card.glow}`}
                >
                  <div className={`p-3 rounded-2xl border border-border w-fit ${card.iconBg} ${card.iconColor.replace('400', '500')}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-wider">{card.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
