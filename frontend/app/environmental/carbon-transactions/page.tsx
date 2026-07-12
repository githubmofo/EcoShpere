// app/environmental/carbon-transactions/page.tsx
// Member 1 – Carbon Operations Center (Premium Apple/Linear Redesign)
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Check, 
  AlertCircle, 
  Calendar, 
  Filter, 
  BarChart2, 
  X, 
  Leaf, 
  Sparkles, 
  Database, 
  Calculator, 
  Activity, 
  ArrowRight,
  TrendingDown,
  Globe,
  Sliders,
  Eye,
  Info
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { CarbonTransaction, EmissionFactor } from "@/lib/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 backdrop-blur-md border border-white/10 p-3.5 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color || "#10b981" }} />
          <p className="text-xs font-bold text-white">
            CO₂ output: <span className="text-green-400 font-extrabold">{payload[0].value.toLocaleString()} kg</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function CarbonTransactionsPage() {
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Selected Transaction for Details Drawer
  const [selectedTx, setSelectedTx] = useState<CarbonTransaction | null>(null);

  // Config State
  const [autoCalculateEnabled, setAutoCalculateEnabled] = useState(true);

  // Filters State
  const [filterDept, setFilterDept] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Form State
  const [formDept, setFormDept] = useState("Operations");
  const [formSource, setFormSource] = useState("Purchase");
  const [formQuantity, setFormQuantity] = useState("");
  const [formFactorId, setFormFactorId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formManualEmissions, setFormManualEmissions] = useState("");
  const [formAutoCalc, setFormAutoCalc] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [txsData, factorsData, configData] = await Promise.all([
          apiGet<CarbonTransaction[]>("/environmental/carbon-transactions"),
          apiGet<EmissionFactor[]>("/environmental/emission-factors"),
          apiGet<any>("/settings/esg-config").catch(() => ({ auto_emission_enabled: true }))
        ]);
        
        setTransactions(txsData);
        
        const activeFactors = factorsData.filter(f => f.status === "Active");
        setFactors(activeFactors);
        if (activeFactors.length > 0) {
          setFormFactorId(activeFactors[0].id);
        }
        
        setAutoCalculateEnabled(configData.auto_emission_enabled);
        setFormAutoCalc(configData.auto_emission_enabled);
      } catch (err) {
        console.error("Failed to load carbon transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openLogModal = () => {
    setFormDept("Operations");
    setFormSource("Purchase");
    setFormQuantity("");
    if (factors.length > 0) {
      setFormFactorId(factors[0].id);
    }
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormManualEmissions("");
    setFormAutoCalc(autoCalculateEnabled);
    setFormError("");
    setIsOpen(true);
  };

  // Math Helper for Real-time Equivalence Calculations
  const getCalculatedEmissions = () => {
    const quantity = parseFloat(formQuantity);
    const selectedFactor = factors.find(f => f.id === formFactorId);
    if (isNaN(quantity) || !selectedFactor) return 0;
    return Number((quantity * selectedFactor.factorValue).toFixed(2));
  };

  const getEquivalents = (emissions: number) => {
    return {
      trees: Math.round(emissions * 0.04), // tree seedlings grown for 10 years
      miles: Math.round(emissions * 2.5),  // gasoline vehicle miles driven
      homes: Math.round(emissions * 0.12),  // homes powered for a day
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const quantity = parseFloat(formQuantity);
    const dateInput = formDate;

    if (!formDept) {
      setFormError("Department is required.");
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      setFormError("Quantity must be a positive number.");
      return;
    }
    if (!dateInput) {
      setFormError("Operation Date is required.");
      return;
    }

    let calculatedEmissions = 0;
    if (formAutoCalc) {
      calculatedEmissions = getCalculatedEmissions();
    } else {
      calculatedEmissions = parseFloat(formManualEmissions);
      if (isNaN(calculatedEmissions) || calculatedEmissions < 0) {
        setFormError("Manual Emissions Value must be a non-negative number.");
        return;
      }
    }

    const payload = {
      department: formDept,
      sourceType: formSource,
      quantity,
      emissionsValue: calculatedEmissions,
      operationDate: dateInput,
      autoCalculated: formAutoCalc,
      emissionFactorId: formFactorId
    };

    const previousTxs = [...transactions];
    const tempId = `tx-temp-${Date.now()}`;
    const tempTx: CarbonTransaction = {
      ...payload,
      id: tempId
    } as CarbonTransaction;

    setTransactions(prev => [tempTx, ...prev]);
    setIsOpen(false);
    triggerToast("Carbon transaction logged successfully!");
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ecosphere_carbon_updated"));
    }

    try {
      const saved = await apiPost<CarbonTransaction>("/environmental/carbon-transactions", payload);
      setTransactions(prev => prev.map(t => t.id === tempId ? saved : t));
    } catch (err) {
      console.error(err);
      setTransactions(previousTxs);
      triggerToast("Failed to log transaction on backend.", "error");
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      const deptMatch = filterDept === "All" || tx.department === filterDept;
      const srcMatch = filterSource === "All" || tx.sourceType === filterSource;
      
      let dateMatch = true;
      if (filterStartDate) {
        dateMatch = dateMatch && new Date(tx.operationDate) >= new Date(filterStartDate);
      }
      if (filterEndDate) {
        dateMatch = dateMatch && new Date(tx.operationDate) <= new Date(filterEndDate);
      }

      return deptMatch && srcMatch && dateMatch;
    });
  };

  const filteredTxs = getFilteredTransactions();

  const getChartData = () => {
    const deptTotals: { [dept: string]: number } = {};
    filteredTxs.forEach(tx => {
      deptTotals[tx.department] = (deptTotals[tx.department] || 0) + tx.emissionsValue;
    });

    const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#fb923c", "#06b6d4"];
    return Object.keys(deptTotals).map((dept, idx) => ({
      department: dept,
      emissions: Number(deptTotals[dept].toFixed(2)),
      color: colors[idx % colors.length]
    }));
  };

  const chartData = getChartData();

  const getSourceBadgeStyle = (src: string) => {
    switch (src) {
      case "Purchase": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Manufacturing": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Fleet": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Expense": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // Calculations for calculator helper
  const loggedEmissions = formAutoCalc ? getCalculatedEmissions() : parseFloat(formManualEmissions) || 0;
  const loggedEquiv = getEquivalents(loggedEmissions);

  return (
    <div className="space-y-6 relative min-h-[85vh] pb-12 animate-in fade-in-0 duration-500">
      
      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4.5 rounded-2xl border shadow-2xl flex items-center justify-between gap-4 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "success" 
                ? "bg-emerald-950/90 backdrop-blur-md border-emerald-500/20 text-emerald-400" 
                : "bg-red-950/90 backdrop-blur-md border-red-500/20 text-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span className="text-xs font-bold tracking-wide">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-current opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 1. SNAPSHOT & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card backdrop-blur-md border border-border rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Carbon Snapshot</span>
            <h4 className="text-base font-black text-foreground uppercase tracking-wider">Carbon operations center</h4>
            <p className="text-xs text-muted-foreground leading-normal mt-1">
              Live financial-style transaction logging system.
            </p>
          </div>
          <Button onClick={openLogModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 font-bold px-4 py-2.5 shadow-[0_4px_15px_rgba(22,163,74,0.25)] transition-all hover:scale-[1.02] cursor-pointer mt-4 w-fit">
            <Plus className="h-4 w-4" />
            Log Carbon
          </Button>
        </Card>

        <Card className="bg-card backdrop-blur-md border border-border rounded-3xl p-6 flex flex-col justify-between">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Footprint</span>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-foreground font-mono">
              {filteredTxs.reduce((sum, tx) => sum + tx.emissionsValue, 0).toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">kg</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Aggregated logged emissions</p>
          </CardContent>
        </Card>

        <Card className="bg-card backdrop-blur-md border border-border rounded-3xl p-6 flex flex-col justify-between">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Logged entries</span>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-foreground font-mono">{filteredTxs.length}</div>
            <p className="text-[10px] text-muted-foreground mt-2">Total transaction registry logs count</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. ADVANCED CONTROL DESK FILTERS */}
      <Card className="bg-card backdrop-blur-md border border-border rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Advanced filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="flex h-9 rounded-xl border border-border bg-muted px-3 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none"
          >
            <option value="All" className="bg-background text-foreground">All Departments</option>
            <option value="Operations" className="bg-background text-foreground">Operations</option>
            <option value="Facilities" className="bg-background text-foreground">Facilities</option>
            <option value="Sales" className="bg-background text-foreground">Sales</option>
            <option value="R&D" className="bg-background text-foreground">R&D</option>
            <option value="HR" className="bg-background text-foreground">HR</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="flex h-9 rounded-xl border border-border bg-muted px-3 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none"
          >
            <option value="All" className="bg-background text-foreground">All Sources</option>
            <option value="Purchase" className="bg-background text-foreground">Purchase</option>
            <option value="Manufacturing" className="bg-background text-foreground">Manufacturing</option>
            <option value="Expense" className="bg-background text-foreground">Expense</option>
            <option value="Fleet" className="bg-background text-foreground">Fleet</option>
            <option value="Other" className="bg-background text-foreground">Other</option>
          </select>

          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="h-9 bg-muted border-border rounded-xl text-xs text-foreground"
          />

          <Input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="h-9 bg-muted border-border rounded-xl text-xs text-foreground"
          />
        </div>
      </Card>

      {/* 3. PREMIUM TRANSACTION TABLE */}
      <Card className="bg-card backdrop-blur-md border border-border rounded-3xl shadow-xl overflow-hidden hover:border-border/80 transition-all duration-300">
        <CardHeader className="pb-3 border-b border-border bg-muted/40">
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Database className="h-4 w-4 text-green-500" />
            Transaction Registry
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Audit logs mapping greenhouse gas coefficients.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
              No transactions match selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border bg-background">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="font-black text-xs text-muted-foreground uppercase tracking-wider py-4">Department</TableHead>
                    <TableHead className="font-black text-xs text-muted-foreground uppercase tracking-wider py-4">Source Type</TableHead>
                    <TableHead className="font-black text-xs text-muted-foreground uppercase tracking-wider py-4">Logged Qty</TableHead>
                    <TableHead className="font-black text-xs text-muted-foreground uppercase tracking-wider py-4">Emissions (kg CO₂e)</TableHead>
                    <TableHead className="font-black text-xs text-muted-foreground uppercase tracking-wider py-4">Operation Date</TableHead>
                    <TableHead className="font-black text-xs text-muted-foreground uppercase tracking-wider py-4 text-right">Audit Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxs.map((tx) => (
                    <TableRow 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-muted/50 border-b border-border transition-colors cursor-pointer"
                    >
                      <TableCell className="font-bold text-xs text-foreground py-4">{tx.department}</TableCell>
                      <TableCell className="py-4">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${getSourceBadgeStyle(tx.sourceType)}`}>
                          {tx.sourceType}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground py-4">{tx.quantity.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs font-extrabold text-green-500 py-4">{tx.emissionsValue.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-4">{tx.operationDate}</TableCell>
                      <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedTx(tx)}
                          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DEPARTMENT COMPARISON CHART */}
      {filteredTxs.length > 0 && (
        <Card className="bg-card backdrop-blur-md border border-border rounded-3xl shadow-xl overflow-hidden hover:border-border/80 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-border bg-muted/40">
            <CardTitle className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-emerald-500" />
              Aggregate Departmental Footprint
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Total emission distribution by business department unit</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-esg-border-subtle, #88888830)" />
                  <XAxis dataKey="department" stroke="var(--color-esg-text-muted, #88888880)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-esg-text-muted, #88888880)" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="emissions" name="CO₂ Emissions (kg)" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        fillOpacity={0.7} 
                        className="hover:fill-opacity-100 cursor-pointer transition-all duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. DETAILS SIDE DRAWER */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 z-45 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 p-6 z-50 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Eye className="h-4.5 w-4.5 text-emerald-400" />
                    Audit profile transaction
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedTx(null)}
                    className="h-7 w-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Department Unit</span>
                    <h4 className="text-base font-black text-white uppercase tracking-wide mt-1 leading-normal">{selectedTx.department}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Calculated Output</span>
                      <p className="text-md font-black text-green-400 mt-1 font-mono">{selectedTx.emissionsValue.toLocaleString()} kg</p>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Source Type</span>
                      <p className="text-xs font-black text-white mt-1.5">{selectedTx.sourceType}</p>
                    </div>
                  </div>

                  {/* Equivalents display inside drawer */}
                  <div className="p-4 rounded-3xl border border-white/5 bg-slate-950/40 space-y-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator className="h-4 w-4 text-emerald-400 animate-pulse" />
                      Environmental Equivalents
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-900/60 p-2.5 rounded-xl">
                        <span className="text-[16px] block">🌳</span>
                        <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold">Trees Grown</span>
                        <span className="font-extrabold text-white font-mono mt-1 block">{getEquivalents(selectedTx.emissionsValue).trees}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-xl">
                        <span className="text-[16px] block">🚗</span>
                        <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold">Car Miles</span>
                        <span className="font-extrabold text-white font-mono mt-1 block">{getEquivalents(selectedTx.emissionsValue).miles}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-xl">
                        <span className="text-[16px] block">🏠</span>
                        <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold">Days Power</span>
                        <span className="font-extrabold text-white font-mono mt-1 block">{getEquivalents(selectedTx.emissionsValue).homes}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 border border-white/5 p-4 rounded-3xl bg-slate-950/15 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Log quantity logged</span>
                      <span className="text-white font-bold">{selectedTx.quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Operation date</span>
                      <span className="text-white font-bold">{selectedTx.operationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Smart calculation mapping</span>
                      <span className="text-white font-bold">{selectedTx.autoCalculated ? "Automated Map" : "Manual override"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t border-white/5 pt-4">
                <Button 
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-xl gap-2 font-bold py-3.5 shadow-lg cursor-pointer"
                >
                  Done auditing
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. NEW TRANSACTION MODAL WITH REAL-TIME CALC & EQUIVALENCE */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-slate-900/95 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-400 animate-pulse" />
              Log Carbon Transaction
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Add raw greenhouse gas logs. Live calculator maps equivalent environmental offsets impact instantly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            
            {/* Form Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Department</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="flex h-[42px] w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-white shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  <option value="Operations" className="bg-slate-900">Operations</option>
                  <option value="Facilities" className="bg-slate-900">Facilities</option>
                  <option value="Sales" className="bg-slate-900">Sales</option>
                  <option value="R&D" className="bg-slate-900">R&D</option>
                  <option value="HR" className="bg-slate-900">HR</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Source Type</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="flex h-[42px] w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-white shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  <option value="Purchase" className="bg-slate-900">Purchase</option>
                  <option value="Manufacturing" className="bg-slate-900">Manufacturing</option>
                  <option value="Expense" className="bg-slate-900">Expense</option>
                  <option value="Fleet" className="bg-slate-900">Fleet</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quantity</label>
                <Input
                  type="number"
                  step="any"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  placeholder="e.g. 12000"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl py-5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Factor</label>
                <select
                  value={formFactorId}
                  onChange={(e) => setFormFactorId(e.target.value)}
                  disabled={!formAutoCalc}
                  className="flex h-[42px] w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-white shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 disabled:opacity-50"
                >
                  {factors.length === 0 ? (
                    <option className="text-foreground bg-slate-900">No active factors</option>
                  ) : (
                    factors.map(f => (
                      <option key={f.id} value={f.id} className="text-foreground bg-slate-900">
                        {f.name} ({f.factorValue})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operation Date</label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl py-5 text-white"
              />
            </div>

            {/* Calculations Box */}
            <div className="p-4.5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoCalcCheck"
                  checked={formAutoCalc}
                  onChange={(e) => setFormAutoCalc(e.target.checked)}
                  className="h-4 w-4 accent-green-500 rounded cursor-pointer"
                />
                <label htmlFor="autoCalcCheck" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                  Enable Smart CO₂ Auto Calculations
                </label>
              </div>

              {formAutoCalc ? (
                <div className="space-y-3 animate-in fade-in-0 duration-300">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Calculated Footprint Output</span>
                    <div className="p-3 border border-green-500/20 bg-green-500/5 rounded-xl text-xs font-mono font-extrabold text-green-400 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calculator className="h-4 w-4 text-green-400 animate-pulse" />
                        <span>{getCalculatedEmissions().toLocaleString()} kg CO₂e</span>
                      </div>
                      <span className="text-[9px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">verified</span>
                    </div>
                  </div>

                  {/* EQUIVALENCE SNAPSHOT */}
                  {loggedEmissions > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Equivalent Environmental Impact</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
                          <span className="text-lg block">🌳</span>
                          <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold">Trees Grown</span>
                          <span className="font-extrabold text-white mt-1 block font-mono">{loggedEquiv.trees}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
                          <span className="text-lg block">🚗</span>
                          <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold">Miles Driven</span>
                          <span className="font-extrabold text-white mt-1 block font-mono">{loggedEquiv.miles}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-xl border border-white/5">
                          <span className="text-lg block">🏠</span>
                          <span className="text-[8px] text-slate-400 block mt-1 uppercase font-bold">Days Power</span>
                          <span className="font-extrabold text-white mt-1 block font-mono">{loggedEquiv.homes}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in-0 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Manual CO₂ Emissions (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    value={formManualEmissions}
                    onChange={(e) => setFormManualEmissions(e.target.value)}
                    placeholder="Enter manual calculation"
                    className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl py-5 text-white"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-white/5">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-white/10 text-slate-300 hover:bg-slate-800 cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold px-5 shadow-lg cursor-pointer">
                Log Entry
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
