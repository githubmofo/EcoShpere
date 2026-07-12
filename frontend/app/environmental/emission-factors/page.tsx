// app/environmental/emission-factors/page.tsx
// Member 1 – Emission Factors Subpage (Enhanced Premium Design)
"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Check, AlertCircle, Sparkles, X, Activity, Flame } from "lucide-react";
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

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState("kg CO2e / kWh");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formError, setFormError] = useState("");

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
    setFormError("");
    setIsOpen(true);
  };

  const openEditModal = (factor: EmissionFactor) => {
    setEditingId(factor.id);
    setFormName(factor.name);
    setFormValue(factor.factorValue.toString());
    setFormUnit(factor.unit);
    setFormStatus(factor.status);
    setFormError("");
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
      factor: value
    };

    const previousFactors = [...factors];

    if (editingId) {
      const updatedList = factors.map(f => 
        f.id === editingId ? { ...f, ...itemData, updatedAt: new Date().toISOString().split("T")[0] } : f
      );
      setFactors(updatedList);
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

      {/* Main factors panel */}
      <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5 bg-slate-950/20">
          <div>
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-400" />
              Environmental Factor Mapping registry
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Manage greenhouse gas calculation multipliers mapping consumption metrics to CO₂ equivalents
            </CardDescription>
          </div>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 self-start sm:self-center font-bold px-4 py-2.5 transition-all hover:scale-[1.03] shadow-[0_4px_15px_rgba(22,163,74,0.25)] cursor-pointer">
            <Plus className="h-4 w-4" />
            New Factor
          </Button>
        </CardHeader>
        
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : factors.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 border border-dashed border-white/5 rounded-2xl">
              No custom emission factors logged. Click "New Factor" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/15">
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-b border-white/5">
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Name</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Multiplier Value</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Standard Unit</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Status</TableHead>
                    <TableHead className="font-black text-xs text-slate-300 uppercase tracking-wider py-4">Last Updated</TableHead>
                    <TableHead className="text-right font-black text-xs text-slate-300 uppercase tracking-wider py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factors.map((factor) => (
                    <TableRow key={factor.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                      <TableCell className="font-bold text-xs text-white py-3.5 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-green-400/80" />
                        <span>{factor.name}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-green-400 font-extrabold py-3.5">
                        {factor.factorValue}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 py-3.5">{factor.unit}</TableCell>
                      <TableCell className="py-3.5">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                          factor.status === "Active"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-slate-500/15 text-slate-400 border-slate-500/20"
                        }`}>
                          {factor.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 py-3.5">{factor.updatedAt}</TableCell>
                      <TableCell className="text-right py-3.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditModal(factor)}
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
        </CardContent>
      </Card>

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-slate-900/95 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400 animate-pulse" />
              {editingId ? "Update Emission Factor" : "New Emission Factor"}
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Factor Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Electricity (Grid Average), Gasoline Fuel"
                className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Factor Value</label>
                <Input
                  type="number"
                  step="any"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. 0.385"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white"
                />
              </div>

              <div className="space-y-2">
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
              <div className="flex items-center gap-3 bg-slate-950/40 border border-white/5 p-3.5 rounded-xl">
                <input 
                  type="checkbox"
                  id="statusToggle"
                  checked={formStatus === "Active"}
                  onChange={(e) => setFormStatus(e.target.checked ? "Active" : "Inactive")}
                  className="h-4 w-4 accent-green-500 rounded cursor-pointer"
                />
                <label htmlFor="statusToggle" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  Set status to <span className={formStatus === "Active" ? "text-green-400 font-bold" : "text-slate-400 font-bold"}>{formStatus}</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-white/5">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-white/10 text-slate-300 hover:bg-slate-800 cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold px-5 shadow-[0_4px_15px_rgba(22,163,74,0.2)] cursor-pointer">
                Save Factor
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
