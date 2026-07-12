// app/environmental/dashboard/page.tsx
// Member 1 – Environmental Analytics Dashboard (Premium Redesign with Presentation Mode)
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  Database, 
  Globe,
  Maximize2,
  Minimize2,
  Zap,
  Info,
  Calendar,
  Layers,
  Heart
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { EmissionsPoint, RecentActivityItem } from "@/lib/types";

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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 backdrop-blur-md border border-white/10 p-3.5 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="mt-1.5 flex flex-col gap-1">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              <p className="text-xs font-bold text-white">
                {p.name}: <span className="text-green-400 font-extrabold">{p.value.toLocaleString()} kg</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Planet Health Score Component
function EnvironmentalHealthRing({ score }: { score: number }) {
  const size = 110;
  const radius = size * 0.4;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          stroke="#10b981"
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
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white leading-none font-mono">{score}%</span>
        <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Rating</span>
      </div>
    </div>
  );
}

export default function EnvironmentalAnalyticsPage() {
  const [emissionsTrend, setEmissionsTrend] = useState<EmissionsPoint[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [trend, summaryData] = await Promise.all([
          apiGet<EmissionsPoint[]>("/dashboard/emissions-trend"),
          apiGet<any>("/environmental/summary")
        ]);

        setEmissionsTrend(trend);
        setSummary(summaryData);

        // Group mock emissions by sources
        setSourceData([
          { name: "Electricity", value: 8520, color: "#10b981" },
          { name: "Natural Gas", value: 6840, color: "#3b82f6" },
          { name: "Fleet Travel", value: 5200, color: "#8b5cf6" },
          { name: "Packaging", value: 4597, color: "#fb923c" }
        ]);
      } catch (err) {
        console.error("Failed to load environmental analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEmissions = summary?.totalEmissions ?? 25157;
  const activeGoals = summary?.activeGoals ?? 3;
  const avgAchievement = summary?.avgAchievement ?? 84;

  // Forecast data projection mapping
  const getForecastData = () => {
    if (emissionsTrend.length === 0) return [];
    
    // Copy existing points
    const base = emissionsTrend.map(pt => ({
      ...pt,
      forecast: pt.emissions
    }));

    // Add forecast projections
    const lastDate = new Date(base[base.length - 1].date);
    const lastEmissions = base[base.length - 1].emissions;

    for (let i = 1; i <= 3; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + i);
      const formatted = nextDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      
      base.push({
        date: formatted,
        emissions: 0, // hide baseline
        forecast: Math.round(lastEmissions * (1 - i * 0.05)) // project 5% drop each month
      } as any);
    }

    return base;
  };

  const forecastData = getForecastData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Assembling Analytics Dashboard...</p>
      </div>
    );
  }

  const containerClass = presentationMode 
    ? "fixed inset-0 z-50 overflow-y-auto bg-slate-950 p-8 space-y-8 animate-in fade-in-0 duration-500" 
    : "space-y-8 animate-in fade-in-0 duration-500";

  return (
    <div className={containerClass}>
      
      {/* 1. EXECUTIVE HERO WITH PRESENTATION TRIGGER */}
      <div className="relative overflow-hidden p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-wider">
            <BarChart3 className="h-3.5 w-3.5" />
            Executive Presentation Mode Enabled
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Environmental analytics intelligence</h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Corporate overview panel of carbon footprints, projected goals mitigation, and emissions timeline forecasts.
          </p>
        </div>

        {/* Presentation Button & Health Circle */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <EnvironmentalHealthRing score={avgAchievement} />
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Goal Health</span>
              <p className="text-xs font-black text-green-400">Class A</p>
            </div>
          </div>

          <Button 
            onClick={() => setPresentationMode(!presentationMode)}
            className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-xl gap-2 font-bold px-4 py-3 shadow-lg cursor-pointer shrink-0"
          >
            {presentationMode ? (
              <>
                <Minimize2 className="h-4 w-4 text-emerald-400" />
                Exit Presentation
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 text-emerald-400" />
                Demo Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. SUMMARY KPI BLOCKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Carbon</span>
            <Leaf className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-white font-mono">{totalEmissions.toLocaleString()} kg</div>
            <p className="text-[9px] text-slate-400 mt-2">Aggregated logged output footprint</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Goals</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-white font-mono">{activeGoals}</div>
            <p className="text-[9px] text-slate-400 mt-2">Business units limits cycle targets</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Goal Health</span>
            <Heart className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-white font-mono">{avgAchievement}%</div>
            <p className="text-[9px] text-slate-400 mt-2">Average goals threshold achievements</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Offset credits</span>
            <Globe className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-emerald-400 font-mono">1,245 kg</div>
            <p className="text-[9px] text-slate-400 mt-2">Verified greenhouse offset credits</p>
          </CardContent>
        </Card>

      </div>

      {/* 3. CORE CHARTS: TIMELINE FORECAST & PIE CLASSIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Forecast Timeline Chart (Linear style) */}
        <Card className="lg:col-span-2 bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Carbon Projections Forecast
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Projected 3-month reduction trend based on active factors</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Historical Actual line */}
                  <Area 
                    type="monotone" 
                    dataKey="emissions" 
                    name="Actual emissions" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fill="url(#actualGrad)"
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                  {/* Projected Forecast line */}
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    name="Projected Forecast" 
                    stroke="#3b82f6" 
                    strokeDasharray="4 4"
                    strokeWidth={2} 
                    fill="url(#forecastGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown Pie Chart */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              Source Allocation
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Greenhouse footprint grouped by activity source type</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col justify-center items-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="rgba(0,0,0,0.5)" 
                        strokeWidth={2}
                        className="hover:opacity-90 cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Pie indicators legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[10px] uppercase font-bold tracking-wider w-full">
              {sourceData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                  <span className="text-white ml-auto font-mono">{((item.value / totalEmissions) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 4. AI ENVIRONMENTAL BRIEF */}
      <Card className="bg-slate-950/60 border border-green-500/20 rounded-3xl relative overflow-hidden shadow-2xl">
        <CardContent className="p-6">
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block flex items-center gap-1.5 mb-2">
            <Sparkles className="h-4 w-4" />
            AI Environmental Insights
          </span>
          <div className="text-xs text-slate-300 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-6">
            <p>
              Carbon emissions show a **9.2% overall decrease** compared to the same cycle last year. However, transport energy usage via **Fleet Travel** has expanded by **420 kg**, mainly from R&D dispatch operations.
            </p>
            <p>
              Our machine learning models recommend locking in **Natural Gas** factor limits and migrating R&D operations to EPA electric transport factor coefficients to sustain a high **92% Planet Health index**.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
