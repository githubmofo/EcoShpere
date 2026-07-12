// app/environmental/carbon-transactions/page.tsx
// Member 1 – Carbon Transactions Subpage (Enhanced Premium Design)
"use client";

import { useEffect, useState } from "react";
import { Plus, Check, AlertCircle, Calendar, Filter, BarChart2, X, Leaf, Sparkles, Database, Calculator } from "lucide-react";
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

// Custom Tooltip for bottom chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 p-3.5 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.color || "#10b981" }} />
          <p className="text-xs font-bold text-white">
            Emissions: <span className="text-emerald-400 font-extrabold">{payload[0].value.toLocaleString()} kg CO₂e</span>
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

  // Config State
  const [autoCalculateEnabled, setAutoCalculateEnabled] = useState(true);

  // Filters State
  const [filterDept, setFilterDept] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Log Transaction Form State
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
        console.error("Failed to load carbon transactions data:", err);
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

  const getCalculatedEmissions = () => {
    const quantity = parseFloat(formQuantity);
    const selectedFactor = factors.find(f => f.id === formFactorId);
    if (isNaN(quantity) || !selectedFactor) return 0;
    return Number((quantity * selectedFactor.factorValue).toFixed(2));
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

    // Curated ESG color themes
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

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      
      {/* Toast Alert Banner Stack */}
      <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4.5 rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "success" 
                ? "bg-emerald-950/80 backdrop-blur-md border-emerald-500/20 text-emerald-400" 
                : "bg-red-950/80 backdrop-blur-md border-red-500/20 text-red-400"
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

      {/* FILTER BAR CARD */}
      <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
        <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-xs font-black text-white uppercase tracking-wider">Query Filter Desk</CardTitle>
          </div>
          <Button onClick={openLogModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 font-bold px-4 py-2.5 shadow-[0_4px_15px_rgba(22,163,74,0.25)] transition-all hover:scale-[1.03] cursor-pointer">
            <Plus className="h-4 w-4" />
            Log Transaction
          </Button>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-950/40 px-3 py-1 text-xs text-white shadow-xs focus-visible:outline-none"
              >
                <option value="All" className="bg-slate-900">All Departments</option>
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
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-white/5 bg-slate-950/40 px-3 py-1 text-xs text-white shadow-xs focus-visible:outline-none"
              >
                <option value="All" className="bg-slate-900">All Sources</option>
                <option value="Purchase" className="bg-slate-900">Purchase</option>
                <option value="Manufacturing" className="bg-slate-900">Manufacturing</option>
                <option value="Expense" className="bg-slate-900">Expense</option>
                <option value="Fleet" className="bg-slate-900">Fleet</option>
                <option value="Other" className="bg-slate-900">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">From Date</label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="h-9 bg-slate-950/40 border-white/5 rounded-xl text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">To Date</label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="h-9 bg-slate-950/40 border-white/5 rounded-xl text-xs text-white"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* DATA TABLE */}
      <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
        <CardHeader className="pb-3 border-b border-white/5 bg-slate-950/20">
          <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="h-4 w-4 text-green-400" />
            Transaction Registry
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Showing {filteredTxs.length} carbon transaction records logged.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 border border-dashed border-white/5 rounded-2xl">
              No carbon transactions logged for this query.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/15">
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-b border-white/5">
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Department</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Source Type</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Logged Qty</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Emissions (kg CO₂e)</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Date</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Auto Calc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxs.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                      <TableCell className="font-bold text-xs text-white py-3.5">{tx.department}</TableCell>
                      <TableCell className="py-3.5">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${getSourceBadgeStyle(tx.sourceType)}`}>
                          {tx.sourceType}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-300 py-3.5">{tx.quantity.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs font-extrabold text-green-400 py-3.5">{tx.emissionsValue.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-slate-400 py-3.5">{tx.operationDate}</TableCell>
                      <TableCell className="py-3.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                          tx.autoCalculated 
                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {tx.autoCalculated ? "Auto" : "Manual"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DEPARTMENT SUMMARY CHART */}
      {filteredTxs.length > 0 && (
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
          <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-emerald-400 animate-pulse" />
              Filtered Footprint by Department
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Total footprint aggregated per business unit based on filter parameters</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="department" stroke="#ffffff30" fontSize={10} tickLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} />
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

      {/* NEW TRANSACTION MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-slate-900/95 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-400" />
              Log Carbon Transaction
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Log energy consumption records. Auto calculations map values using active factors.
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
              <div className="space-y-2">
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

              <div className="space-y-2">
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
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Log Qty</label>
                <Input
                  type="number"
                  step="any"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  placeholder="e.g. 15000"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white"
                />
              </div>

              <div className="space-y-2">
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operation Date</label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white"
              />
            </div>

            {/* Calculations Wrapper */}
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
                <div className="space-y-1.5 animate-in fade-in-0 duration-300">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Calculated Footprint Output</span>
                  <div className="p-3 border border-green-500/20 bg-green-500/5 rounded-xl text-xs font-mono font-extrabold text-green-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calculator className="h-4 w-4 text-green-400 animate-pulse" />
                      <span>{getCalculatedEmissions().toLocaleString()} kg CO₂e</span>
                    </div>
                    <span className="text-[9px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">verified</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in-0 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Manual CO₂ Emissions (kg)</label>
                  <Input
                    type="number"
                    step="any"
                    value={formManualEmissions}
                    onChange={(e) => setFormManualEmissions(e.target.value)}
                    placeholder="Enter custom calculated emissions"
                    className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white animate-in"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-white/5">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-white/10 text-slate-300 hover:bg-slate-800 cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold px-5 shadow-[0_4px_15px_rgba(22,163,74,0.2)] cursor-pointer">
                Log Entry
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
