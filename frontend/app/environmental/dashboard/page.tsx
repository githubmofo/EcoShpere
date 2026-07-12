// app/environmental/dashboard/page.tsx
// Member 1 – Environmental Dashboard Subpage
"use client";

import { useEffect, useState } from "react";
import { Leaf, Target, Award, ShieldAlert, BarChart3, PieChartIcon } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { CarbonTransaction, EnvironmentalGoal } from "@/lib/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie, Legend } from "recharts";

interface SummaryData {
  totalEmissions: number;
  activeGoals: number;
  avgAchievement: number;
  period: string;
}

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

  // Process data for charts
  // 1. Trend per date (grouped by month or transaction date)
  const getTrendData = () => {
    // Sort transactions by date
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.operationDate).getTime() - new Date(b.operationDate).getTime()
    );
    
    // Group emissions by date
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

  // 2. Group by Source Type for Pie/Bar Chart
  const getSourceData = () => {
    const groups: { [source: string]: number } = {};
    transactions.forEach(tx => {
      const src = tx.sourceType || "Other";
      groups[src] = (groups[src] || 0) + tx.emissionsValue;
    });

    const colors = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#64748b"];
    return Object.keys(groups).map((src, i) => ({
      name: src,
      value: groups[src],
      color: colors[i % colors.length]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const trendData = getTrendData();
  const sourceData = getSourceData();

  return (
    <div className="space-y-6">
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Footprint KPI */}
        <Card className="bg-card/30 backdrop-blur-sm border-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Carbon Output</CardTitle>
            <Leaf className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-400">
              {summary ? `${summary.totalEmissions.toLocaleString()} kg` : "0 kg"}
            </div>
            <p className="text-[10px] text-muted-foreground/80 mt-1">Accumulated carbon emissions (CO₂e)</p>
          </CardContent>
        </Card>

        {/* Goals KPI */}
        <Card className="bg-card/30 backdrop-blur-sm border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Targets</CardTitle>
            <Target className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {summary ? summary.activeGoals : 0} / {goals.length}
            </div>
            <p className="text-[10px] text-muted-foreground/80 mt-1">Goals currently under target limits</p>
          </CardContent>
        </Card>

        {/* Average Achievement KPI */}
        <Card className="bg-card/30 backdrop-blur-sm border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goal Health Rating</CardTitle>
            <Award className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400">
              {summary ? `${summary.avgAchievement}%` : "0%"}
            </div>
            <p className="text-[10px] text-muted-foreground/80 mt-1">Average emission reduction progress rate</p>
          </CardContent>
        </Card>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-400" />
              GHG Emissions Over Time
            </CardTitle>
            <CardDescription className="text-xs">Cumulative carbon emissions logged per reporting date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No transaction data logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} />
                    <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #ffffff1a" }}
                      labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="emissions" 
                      name="Emissions (kg CO2e)" 
                      stroke="#22c55e" 
                      fillOpacity={1} 
                      fill="url(#colorEmissions)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Source breakdown chart */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-400" />
              Emissions by Source Type
            </CardTitle>
            <CardDescription className="text-xs">Distribution of carbon footprint by category source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex items-center justify-center">
              {sourceData.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No source category data available.
                </div>
              ) : (
                <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-4">
                  <div className="h-[200px] w-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #ffffff1a" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Total</span>
                      <span className="text-base font-black text-foreground">
                        {summary ? `${summary.totalEmissions.toLocaleString()}` : "0"}
                      </span>
                      <span className="text-[9px] text-muted-foreground">kg CO₂e</span>
                    </div>
                  </div>
                  
                  {/* Custom legend */}
                  <div className="space-y-2">
                    {sourceData.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <div className="text-xs">
                          <span className="font-bold text-foreground/90">{entry.name}</span>
                          <span className="text-muted-foreground ml-2">({entry.value.toLocaleString()} kg)</span>
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
