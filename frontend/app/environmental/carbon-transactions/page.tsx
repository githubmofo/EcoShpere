// app/environmental/carbon-transactions/page.tsx
// Member 1 – Carbon Transactions Subpage
"use client";

import { useEffect, useState } from "react";
import { Plus, Check, AlertCircle, Calendar, Filter, BarChart2, X, Leaf } from "lucide-react";
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

  // Auto-calculated value helper
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

    // Optimistic Update
    setTransactions(prev => [tempTx, ...prev]);
    setIsOpen(false);
    triggerToast("Carbon transaction logged successfully!");
    
    // Dispatch a custom event to notify layout layout to update top stats
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ecosphere_carbon_updated"));
    }

    try {
      const saved = await apiPost<CarbonTransaction>("/environmental/carbon-transactions", payload);
      setTransactions(prev => prev.map(t => t.id === tempId ? saved : t));
    } catch (err) {
      console.error("API Error logging carbon:", err);
      setTransactions(previousTxs); // rollback
      triggerToast("Failed to log transaction on backend.", "error");
    }
  };

  // Filter transactions
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

  // Aggregate emissions per department for bottom chart
  const getChartData = () => {
    const deptTotals: { [dept: string]: number } = {};
    filteredTxs.forEach(tx => {
      deptTotals[tx.department] = (deptTotals[tx.department] || 0) + tx.emissionsValue;
    });

    const colors = ["#22c55e", "#3b82f6", "#a855f7", "#fb923c", "#06b6d4"];
    return Object.keys(deptTotals).map((dept, idx) => ({
      department: dept,
      emissions: Number(deptTotals[dept].toFixed(2)),
      color: colors[idx % colors.length]
    }));
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-center justify-between gap-4 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "success" 
                ? "bg-green-500/10 border-green-500/30 text-green-400" 
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-current opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* FILTER BAR CARD */}
      <Card className="bg-card/25 backdrop-blur-sm border border-border/80 rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm font-bold">Query Filters</CardTitle>
          </div>
          <Button onClick={openLogModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 font-medium">
            <Plus className="h-4 w-4" />
            Log Transaction
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-border bg-background/50 px-3 py-1 text-xs shadow-xs focus-visible:outline-none"
              >
                <option value="All" className="bg-slate-900">All Departments</option>
                <option value="Operations" className="bg-slate-900">Operations</option>
                <option value="Facilities" className="bg-slate-900">Facilities</option>
                <option value="Sales" className="bg-slate-900">Sales</option>
                <option value="R&D" className="bg-slate-900">R&D</option>
                <option value="HR" className="bg-slate-900">HR</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Source Type</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-border bg-background/50 px-3 py-1 text-xs shadow-xs focus-visible:outline-none"
              >
                <option value="All" className="bg-slate-900">All Sources</option>
                <option value="Purchase" className="bg-slate-900">Purchase</option>
                <option value="Manufacturing" className="bg-slate-900">Manufacturing</option>
                <option value="Expense" className="bg-slate-900">Expense</option>
                <option value="Fleet" className="bg-slate-900">Fleet</option>
                <option value="Other" className="bg-slate-900">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">From Date</label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="h-9 bg-background/50 border-border rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">To Date</label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="h-9 bg-background/50 border-border rounded-xl text-xs"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* DATA TABLE */}
      <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-400" />
            Transaction Registry
          </CardTitle>
          <CardDescription className="text-xs">
            Showing {filteredTxs.length} carbon emission entries mapped by filter query.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
              No transactions match selected query criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold text-xs">Department</TableHead>
                    <TableHead className="font-bold text-xs">Source Type</TableHead>
                    <TableHead className="font-bold text-xs">Quantity</TableHead>
                    <TableHead className="font-bold text-xs">Emissions (kg CO₂e)</TableHead>
                    <TableHead className="font-bold text-xs">Operation Date</TableHead>
                    <TableHead className="font-bold text-xs">Auto Calculated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxs.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/10">
                      <TableCell className="font-semibold text-xs text-foreground/90">{tx.department}</TableCell>
                      <TableCell className="text-xs">{tx.sourceType}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.quantity.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-green-400">{tx.emissionsValue.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.operationDate}</TableCell>
                      <TableCell>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                          tx.autoCalculated 
                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {tx.autoCalculated ? "Yes" : "No"}
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
        <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-emerald-400" />
              Departmental Carbon Footprint Summary
            </CardTitle>
            <CardDescription className="text-xs">Aggregate CO₂ output matching currently filtered records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                  <XAxis dataKey="department" stroke="#ffffff40" fontSize={11} tickLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #ffffff1a" }}
                  />
                  <Bar dataKey="emissions" name="CO₂ Emissions (kg)" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
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
        <DialogContent className="w-[90vw] max-w-md bg-card/95 backdrop-blur-md border border-border p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Log Carbon Transaction</DialogTitle>
            <DialogDescription className="text-xs">
              Log raw greenhouse gas emission activities manually or compute automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            
            {/* Form Error Message */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Department</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="flex h-9 w-full rounded-xl border border-border bg-background/40 px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  <option value="Operations" className="bg-slate-900 text-foreground">Operations</option>
                  <option value="Facilities" className="bg-slate-900 text-foreground">Facilities</option>
                  <option value="Sales" className="bg-slate-900 text-foreground">Sales</option>
                  <option value="R&D" className="bg-slate-900 text-foreground">R&D</option>
                  <option value="HR" className="bg-slate-900 text-foreground">HR</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Source Type</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="flex h-9 w-full rounded-xl border border-border bg-background/40 px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  <option value="Purchase" className="bg-slate-900 text-foreground">Purchase</option>
                  <option value="Manufacturing" className="bg-slate-900 text-foreground">Manufacturing</option>
                  <option value="Expense" className="bg-slate-900 text-foreground">Expense</option>
                  <option value="Fleet" className="bg-slate-900 text-foreground">Fleet</option>
                  <option value="Other" className="bg-slate-900 text-foreground">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Quantity</label>
                <Input
                  type="number"
                  step="any"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  placeholder="e.g. 1500"
                  className="bg-background/40 border-border/80 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Emission Factor</label>
                <select
                  value={formFactorId}
                  onChange={(e) => setFormFactorId(e.target.value)}
                  disabled={!formAutoCalc}
                  className="flex h-9 w-full rounded-xl border border-border bg-background/40 px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 disabled:opacity-50"
                >
                  {factors.length === 0 ? (
                    <option className="text-foreground bg-slate-900">No Active Factors Available</option>
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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Operation Date</label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="bg-background/40 border-border/80 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl"
              />
            </div>

            {/* Auto calculate control */}
            <div className="p-3 rounded-xl border border-border/80 bg-background/20 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoCalcCheck"
                  checked={formAutoCalc}
                  onChange={(e) => setFormAutoCalc(e.target.checked)}
                  className="h-4 w-4 accent-green-600 rounded"
                />
                <label htmlFor="autoCalcCheck" className="text-xs font-bold cursor-pointer">
                  Auto Calculate CO₂ Emissions
                </label>
              </div>

              {formAutoCalc ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">Calculated Emissions Value</span>
                  <div className="p-2 border border-border/60 bg-muted/30 rounded-lg text-xs font-mono font-bold text-green-400">
                    {getCalculatedEmissions().toLocaleString()} kg CO₂e
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Manual Emissions (kg CO₂e)</label>
                  <Input
                    type="number"
                    step="any"
                    value={formManualEmissions}
                    onChange={(e) => setFormManualEmissions(e.target.value)}
                    placeholder="Enter manual calculation"
                    className="bg-background/40 border-border/80 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium">
                Log Entry
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
