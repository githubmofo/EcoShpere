// app/environmental/dashboard/page.tsx
// Member 1 – Environmental Dashboard Subpage (Enhanced Premium Design)
"use client";

import { useEffect, useState } from "react";
import { Leaf, Target, Award, ShieldAlert, BarChart3, PieChartIcon, Calendar, Sparkles } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { CarbonTransaction, EnvironmentalGoal } from "@/lib/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from "recharts";

interface SummaryData {
  totalEmissions: number;
  activeGoals: number;
  avgAchievement: number;
  period: string;
}

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label || "Details"}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color || payload[0].color || "#10b981" }} />
          <p className="text-xs font-bold text-white">
            {payload[0].name}: <span className="text-green-400 font-extrabold">{payload[0].value.toLocaleString()} kg CO₂e</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function EnvironmentalDashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [goals, setGoals] = useState<EnvironmentalGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryData, txsData, goalsData] = await Promise.all([
          apiGet<SummaryData>("/environmental/summary"),
          apiGet<CarbonTransaction[]>("/environmental/carbon-transactions"),
          apiGet<EnvironmentalGoal[]>("/environmental/goals")
        ]);
        setSummary(summaryData);
        setTransactions(txsData);
        setGoals(goalsData);
      } catch (err) {
        console.error("Error loading environmental dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getTrendData = () => {
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.operationDate).getTime() - new Date(b.operationDate).getTime()
    );
    
    const groups: { [date: string]: number } = {};
    sorted.forEach(tx => {
      const dateStr = tx.operationDate;
      groups[dateStr] = (groups[dateStr] || 0) + tx.emissionsValue;
    });

    return Object.keys(groups).map(date => ({
      date,
      emissions: groups[date]
    }));
  };

  const getSourceData = () => {
    const groups: { [source: string]: number } = {};
    transactions.forEach(tx => {
      const src = tx.sourceType || "Other";
      groups[src] = (groups[src] || 0) + tx.emissionsValue;
    });

    // Curated ESG green-blue HSL colors for pie slices
    const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#64748b"];
    return Object.keys(groups).map((src, i) => ({
      name: src,
      value: Number(groups[src].toFixed(2)),
      color: colors[i % colors.length]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold animate-pulse">Retrieving greenhouse gas logs...</p>
        </div>
      </div>
    );
  }

  const trendData = getTrendData();
  const sourceData = getSourceData();

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Footprint KPI */}
        <Card className="group bg-slate-900/30 backdrop-blur-md border border-green-500/10 hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.06)] relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Carbon Footprint</CardTitle>
            <div className="p-1.5 rounded-lg bg-green-500/5 border border-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
              <Leaf className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-400 tracking-tight">
              {summary ? `${summary.totalEmissions.toLocaleString()} kg` : "0 kg"}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Accumulated Scope 1 & 2 carbon output</p>
          </CardContent>
        </Card>

        {/* Goals KPI */}
        <Card className="group bg-slate-900/30 backdrop-blur-md border border-white/5 hover:border-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Limit Targets</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tight">
              {summary ? summary.activeGoals : 0} <span className="text-sm font-semibold text-slate-400">/ {goals.length} active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Pillars executing under emission thresholds</p>
          </CardContent>
        </Card>

        {/* Average Achievement KPI */}
        <Card className="group bg-slate-900/30 backdrop-blur-md border border-white/5 hover:border-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Progress Rate</CardTitle>
            <div className="p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              {summary ? `${summary.avgAchievement}%` : "0%"}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Average compliance progress metrics ratings</p>
          </CardContent>
        </Card>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-400" />
              GHG Output Trend
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Total logged carbon equivalents per transaction operation date</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[285px] w-full">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No logged transactions. Set up entries under Carbon Transactions.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEmissionsSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
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
                      fillOpacity={1} 
                      fill="url(#colorEmissionsSub)" 
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6, fill: "#fff", stroke: "#10b981", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Source breakdown chart */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-400" />
              Source Category Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">GHG emissions contribution aggregated by operational category</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[285px] w-full flex items-center justify-center">
              {sourceData.length === 0 ? (
                <div className="text-xs text-slate-400">
                  No carbon transaction records available.
                </div>
              ) : (
                <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-6">
                  
                  {/* Glass donut wrapper */}
                  <div className="h-[185px] w-[185px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {sourceData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              className="hover:opacity-90 cursor-pointer"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Aggregate</span>
                      <span className="text-base font-black text-white">
                        {summary ? `${summary.totalEmissions.toLocaleString()}` : "0"}
                      </span>
                      <span className="text-[9px] text-slate-400">kg CO₂e</span>
                    </div>
                  </div>
                  
                  {/* Legend list */}
                  <div className="space-y-2 border border-white/5 p-4 rounded-2xl bg-slate-950/25 min-w-[160px]">
                    {sourceData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: entry.color }} />
                        <div className="text-xs leading-none">
                          <p className="font-bold text-slate-300">{entry.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">{entry.value.toLocaleString()} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
