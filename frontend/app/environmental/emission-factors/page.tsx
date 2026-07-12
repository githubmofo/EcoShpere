// app/environmental/emission-factors/page.tsx
// Member 1 – Emission Factors Studio (Premium Apple/Linear Redesign)
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Check, 
  AlertCircle, 
  Sparkles, 
  X, 
  Flame, 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Eye, 
  Calendar,
  Cpu,
  Calculator,
  Activity,
  ChevronRight
} from "lucide-react";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { EmissionFactor } from "@/lib/types";

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

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function EmissionFactorsPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected factor for details drawer
  const [selectedFactor, setSelectedFactor] = useState<EmissionFactor | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState("kg CO2e / kWh");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formCategory, setFormCategory] = useState("Electricity");
  const [formSource, setFormSource] = useState("Grid");
  const [formError, setFormError] = useState("");

  // Live calculator states inside form
  const [calcQuantity, setCalcQuantity] = useState("1000");

  useEffect(() => {
    async function loadFactors() {
      try {
        const data = await apiGet<EmissionFactor[]>("/environmental/emission-factors");
        setFactors(data);
      } catch (err) {
        console.error("Failed to load emission factors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFactors();
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

  const openCreateModal = () => {
    setEditingId(null);
    setFormName("");
    setFormValue("");
    setFormUnit("kg CO2e / kWh");
    setFormStatus("Active");
    setFormCategory("Electricity");
    setFormSource("Grid");
    setFormError("");
    setCalcQuantity("1000");
    setIsOpen(true);
  };

  const openEditModal = (factor: EmissionFactor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // prevent opening drawer
    setEditingId(factor.id);
    setFormName(factor.name);
    setFormValue(factor.factorValue.toString());
    setFormUnit(factor.unit);
    setFormStatus(factor.status);
    setFormCategory(factor.category || "Electricity");
    setFormSource(factor.source || "Grid");
    setFormError("");
    setCalcQuantity("1000");
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const value = parseFloat(formValue);

    if (!formName.trim()) {
      setFormError("Factor Name is required.");
      return;
    }
    if (isNaN(value) || value <= 0) {
      setFormError("Factor Value must be a positive number.");
      return;
    }

    const duplicate = factors.find(
      f => f.name.toLowerCase() === formName.trim().toLowerCase() && f.id !== editingId
    );
    if (duplicate) {
      setFormError("An emission factor with this name already exists.");
      return;
    }

    const itemData = {
      name: formName.trim(),
      factorValue: value,
      unit: formUnit,
      status: formStatus,
      category: formCategory,
      source: formSource,
      factor: value
    };

    const previousFactors = [...factors];

    if (editingId) {
      const updatedList = factors.map(f => 
        f.id === editingId ? { ...f, ...itemData, updatedAt: new Date().toISOString().split("T")[0] } : f
      );
      setFactors(updatedList);
      
      // Update drawer if active
      if (selectedFactor?.id === editingId) {
        setSelectedFactor({ ...selectedFactor, ...itemData } as EmissionFactor);
      }

      setIsOpen(false);
      triggerToast("Emission factor updated successfully!");

      try {
        await apiPatch(`/environmental/emission-factors/${editingId}`, itemData);
      } catch (err) {
        console.error(err);
        setFactors(previousFactors);
        triggerToast("Failed to update factor on server.", "error");
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const newTempFactor: EmissionFactor = {
        ...itemData,
        id: tempId,
        updatedAt: new Date().toISOString().split("T")[0]
      };
      
      setFactors(prev => [...prev, newTempFactor]);
      setIsOpen(false);
      triggerToast("Emission factor created successfully!");

      try {
        const saved = await apiPost<EmissionFactor>("/environmental/emission-factors", itemData);
        setFactors(prev => prev.map(f => f.id === tempId ? saved : f));
      } catch (err) {
        console.error(err);
        setFactors(previousFactors);
        triggerToast("Failed to save factor on server.", "error");
      }
    }
  };

  // Filtered lists
  const getFilteredFactors = () => {
    return factors.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (f.category?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredFactors = getFilteredFactors();

  // Metrics
  const activeCount = factors.filter(f => f.status === "Active").length;
  const avgMultiplier = factors.length > 0 
    ? Number((factors.reduce((sum, f) => sum + f.factorValue, 0) / factors.length).toFixed(3)) 
    : 0;

  // Form calculator logic
  const getLiveCalculation = () => {
    const qty = parseFloat(calcQuantity);
    const fact = parseFloat(formValue);
    if (isNaN(qty) || isNaN(fact)) return 0;
    return Number((qty * fact).toFixed(2));
  };

  return (
    <div className="space-y-6 relative min-h-[80vh] pb-12 animate-in fade-in-0 duration-500">
      
      {/* Toast Alert Banner Stack */}
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

      {/* 1. STUDIO HERO & METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Module Title Card */}
        <Card className="lg:col-span-2 bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full pointer-events-none animate-pulse" />
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5" />
              Factor Registry Module
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Environmental configuration studio</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintain standard emissions multipliers to establish audit-compliant greenhouse gas calculations.
            </p>
          </div>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 font-bold px-4 py-2.5 shadow-[0_4px_15px_rgba(22,163,74,0.25)] transition-all hover:scale-[1.02] cursor-pointer mt-4 w-fit">
            <Plus className="h-4 w-4" />
            New Factor
          </Button>
        </Card>

        {/* Metric Total Factors */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Factors</span>
            <Flame className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-white font-mono">{factors.length}</div>
            <p className="text-[10px] text-slate-400 mt-2">Active mappings registry</p>
          </CardContent>
        </Card>

        {/* Metric Avg Multiplier */}
        <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <CardHeader className="p-0 flex flex-row items-center justify-between pb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Coefficient</span>
            <Calculator className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="text-3xl font-black text-white font-mono">{avgMultiplier}</div>
            <p className="text-[10px] text-slate-400 mt-2">Average CO₂ equivalent multiplier</p>
          </CardContent>
        </Card>

      </div>

      {/* 2. FILTERS & SEARCH CONTROL DESK */}
      <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search factors or categories..."
            className="pl-10 h-10 bg-slate-950/40 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl text-xs text-white"
          />
        </div>

        {/* Filter items & view modes */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-1 text-xs text-white shadow-xs focus-visible:outline-none"
            >
              <option value="All" className="bg-slate-900">All Statuses</option>
              <option value="Active" className="bg-slate-900">Active</option>
              <option value="Inactive" className="bg-slate-900">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-white/5 rounded-xl">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("card")}
              className={`h-7 w-7 rounded-lg cursor-pointer ${viewMode === "card" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "text-slate-400 hover:text-white"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("table")}
              className={`h-7 w-7 rounded-lg cursor-pointer ${viewMode === "table" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "text-slate-400 hover:text-white"}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </Card>

      {/* 3. DYNAMIC factor VIEW */}
      {filteredFactors.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400 border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
          No custom emission factors found matching the query.
        </div>
      ) : viewMode === "card" ? (
        
        // Grid cards view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFactors.map((factor) => (
            <motion.div
              layoutId={`factor-card-${factor.id}`}
              key={factor.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedFactor(factor)}
              className="bg-slate-900/30 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-3xl p-6 flex flex-col justify-between h-44 shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{factor.category || "Utility"}</span>
                  <h4 className="text-xs font-black text-white group-hover:text-green-400 transition-colors uppercase truncate tracking-wider">{factor.name}</h4>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  factor.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-500/15 text-slate-400 border-slate-500/20"
                }`}>
                  {factor.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-3xl font-black text-white font-mono tracking-tighter">{factor.factorValue}</span>
                <span className="text-[10px] text-slate-400 font-bold">{factor.unit}</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Source: {factor.source || "System"}</span>
                <div className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                  <span>Audit Logs</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        
        // Table view
        <div className="overflow-x-auto rounded-3xl border border-white/5 bg-slate-900/15">
          <Table>
            <TableHeader className="bg-slate-950/40">
              <TableRow className="border-b border-white/5">
                <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Name</TableHead>
                <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Category</TableHead>
                <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Value</TableHead>
                <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Unit</TableHead>
                <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Status</TableHead>
                <TableHead className="text-right font-black text-xs text-slate-300 uppercase tracking-wider py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactors.map((factor) => (
                <TableRow 
                  key={factor.id} 
                  onClick={() => setSelectedFactor(factor)}
                  className="hover:bg-white/[0.02] border-b border-white/5 transition-colors cursor-pointer"
                >
                  <TableCell className="font-bold text-xs text-white py-4 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-green-400/80" />
                    <span>{factor.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300 py-4 font-semibold uppercase tracking-wider">{factor.category || "Utility"}</TableCell>
                  <TableCell className="font-mono text-xs text-green-400 font-extrabold py-4">{factor.factorValue}</TableCell>
                  <TableCell className="text-xs text-slate-400 py-4 font-bold">{factor.unit}</TableCell>
                  <TableCell className="py-4">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      factor.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-500/15 text-slate-400 border-slate-500/20"
                    }`}>
                      {factor.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => openEditModal(factor, e)}
                      className="h-8 w-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent hover:border-white/5 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. PREVIEW DRAWER (Slide-in detailed panel) */}
      <AnimatePresence>
        {selectedFactor && (
          <>
            {/* Backdrop Blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFactor(null)}
              className="fixed inset-0 z-45 bg-black/40 backdrop-blur-xs"
            />
            {/* Slide-in drawer container */}
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
                    Audit profile factor
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedFactor(null)}
                    className="h-7 w-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Factor Name</span>
                    <h4 className="text-base font-black text-white uppercase tracking-wide mt-1 leading-normal">{selectedFactor.name}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Coefficient</span>
                      <p className="text-md font-black text-green-400 mt-1 font-mono">{selectedFactor.factorValue}</p>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                      <p className="text-xs font-black text-white mt-1.5">{selectedFactor.status}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border border-white/5 p-4 rounded-3xl bg-slate-950/15">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Category classification</span>
                      <span className="text-white font-bold">{selectedFactor.category || "General"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Unit type</span>
                      <span className="text-white font-bold">{selectedFactor.unit}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Audited Source origin</span>
                      <span className="text-white font-bold">{selectedFactor.source || "Grid System"}</span>
                    </div>
                  </div>

                  {/* usage info */}
                  <div className="p-4 rounded-3xl border border-white/5 bg-slate-950/40 space-y-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      Usage Metrics
                    </span>
                    <div className="flex justify-between text-xs leading-none">
                      <span className="text-slate-400">Total logged uses</span>
                      <span className="text-white font-bold">124 transaction entries</span>
                    </div>
                    <div className="flex justify-between text-xs leading-none">
                      <span className="text-slate-400">Last calculation audit</span>
                      <span className="text-white font-bold">{selectedFactor.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t border-white/5 pt-4">
                <Button 
                  onClick={() => {
                    const fact = selectedFactor;
                    setSelectedFactor(null);
                    openEditModal(fact);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-xl gap-2 font-bold py-3.5 shadow-lg cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. CREATE/EDIT MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-slate-900/95 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-400" />
              {editingId ? "Update Factor Profile" : "New Factor Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Configure energy multipliers to enable automatic greenhouse gas output calculations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            
            {/* Form Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5 animate-bounce">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Factor Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Biofuel Generator, Direct Solar Grid"
                className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl text-white py-5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Multiplier Value</label>
                <Input
                  type="number"
                  step="any"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. 0.42"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl text-white py-5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Unit Type</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="flex h-[42px] w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-white shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  <option value="kg CO2e / kWh" className="bg-slate-900">kg CO2e / kWh</option>
                  <option value="kg CO2e / therm" className="bg-slate-900">kg CO2e / therm</option>
                  <option value="kg CO2e / gallon" className="bg-slate-900">kg CO2e / gallon</option>
                  <option value="kg CO2e / passenger-mile" className="bg-slate-900">kg CO2e / passenger-mile</option>
                  <option value="kg CO2e / kg" className="bg-slate-900">kg CO2e / kg</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Utility, Heating"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl text-white py-5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Source Origin</label>
                <Input
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. EPA Average"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl text-white py-5"
                />
              </div>
            </div>

            {/* Calculations Preview panel inside modal */}
            <div className="p-4 rounded-2xl border border-white/5 bg-slate-950/40 space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-green-400" />
                Live Mapped Calculation Preview
              </span>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Input Qty</span>
                  <Input
                    type="number"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(e.target.value)}
                    className="h-8 bg-slate-900/60 border-white/5 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Emissions Output</span>
                  <div className="h-8 flex items-center px-2 bg-green-500/5 border border-green-500/20 text-xs font-mono font-bold text-green-400 rounded-lg">
                    {getLiveCalculation().toLocaleString()} kg CO₂e
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
              <div className="flex items-center gap-3 bg-slate-950/40 border border-white/5 p-3.5 rounded-xl">
                <input 
                  type="checkbox"
                  id="statusToggle"
                  checked={formStatus === "Active"}
                  onChange={(e) => setFormStatus(e.target.checked ? "Active" : "Inactive")}
                  className="h-4 w-4 accent-green-500 rounded cursor-pointer"
                />
                <label htmlFor="statusToggle" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                  Set multiplier to <span className={formStatus === "Active" ? "text-green-400" : "text-slate-400"}>{formStatus}</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-white/5">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-white/10 text-slate-300 hover:bg-slate-800 cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold px-5 shadow-lg cursor-pointer">
                Save Factor
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
