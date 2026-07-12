// app/environmental/emission-factors/page.tsx
// Member 1 – Emission Factors Subpage
"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Check, AlertCircle, Sparkles, X } from "lucide-react";
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

    // Validation
    if (!formName.trim()) {
      setFormError("Factor Name is required.");
      return;
    }
    if (isNaN(value) || value <= 0) {
      setFormError("Factor Value must be a positive number.");
      return;
    }

    // Name uniqueness check (client-side)
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
      factor: value // backward compatibility
    };

    // Keep backup for optimistic rollbacks
    const previousFactors = [...factors];

    if (editingId) {
      // Optimistic update
      const updatedList = factors.map(f => 
        f.id === editingId ? { ...f, ...itemData, updatedAt: new Date().toISOString().split("T")[0] } : f
      );
      setFactors(updatedList);
      setIsOpen(false);
      triggerToast("Emission factor updated successfully!");

      try {
        await apiPatch(`/environmental/emission-factors/${editingId}`, itemData);
      } catch (err) {
        console.error("API error while updating factor:", err);
        setFactors(previousFactors); // rollback
        triggerToast("Failed to update factor on server.", "error");
      }
    } else {
      // Optimistic create
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
        // Replace temp object with database saved object
        setFactors(prev => prev.map(f => f.id === tempId ? saved : f));
      } catch (err) {
        console.error("API error while creating factor:", err);
        setFactors(previousFactors); // rollback
        triggerToast("Failed to save factor on server.", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Banner Stack */}
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

      {/* Main card panel */}
      <Card className="bg-card/30 backdrop-blur-sm border border-border/80 rounded-2xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-400" />
              Factors List
            </CardTitle>
            <CardDescription className="text-xs">
              Manage factors mapping raw energy consumption metrics into CO₂ equivalents
            </CardDescription>
          </div>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 self-start sm:self-center font-medium">
            <Plus className="h-4 w-4" />
            New Factor
          </Button>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : factors.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
              No custom emission factors found. Click "New Factor" to log the first one.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold text-xs">Name</TableHead>
                    <TableHead className="font-bold text-xs">Factor Value</TableHead>
                    <TableHead className="font-bold text-xs">Unit</TableHead>
                    <TableHead className="font-bold text-xs">Status</TableHead>
                    <TableHead className="font-bold text-xs">Last Updated</TableHead>
                    <TableHead className="text-right font-bold text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factors.map((factor) => (
                    <TableRow key={factor.id} className="hover:bg-muted/10">
                      <TableCell className="font-semibold text-xs text-foreground/90">{factor.name}</TableCell>
                      <TableCell className="font-mono text-xs">{factor.factorValue}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{factor.unit}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          factor.status === "Active"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}>
                          {factor.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground/80">{factor.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditModal(factor)}
                          className="h-7 w-7 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/30"
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

      {/* dialog component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-card/95 backdrop-blur-md border border-border p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingId ? "Update Emission Factor" : "New Emission Factor"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure energy multipliers to enable automatic greenhouse gas output calculations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            
            {/* Form Error Banner */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Factor Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Solar Energy, Biofuel Mix"
                className="bg-background/40 border-border/80 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Factor Value</label>
                <Input
                  type="number"
                  step="any"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="e.g. 0.125"
                  className="bg-background/40 border-border/80 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Unit</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="flex h-9 w-full rounded-xl border border-border/85 bg-background/40 px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  <option value="kg CO2e / kWh" className="bg-slate-900 text-foreground">kg CO2e / kWh</option>
                  <option value="kg CO2e / therm" className="bg-slate-900 text-foreground">kg CO2e / therm</option>
                  <option value="kg CO2e / gallon" className="bg-slate-900 text-foreground">kg CO2e / gallon</option>
                  <option value="kg CO2e / passenger-mile" className="bg-slate-900 text-foreground">kg CO2e / passenger-mile</option>
                  <option value="kg CO2e / kg" className="bg-slate-900 text-foreground">kg CO2e / kg</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">Status</label>
              <div className="flex items-center gap-3 bg-background/30 border border-border/80 p-3 rounded-xl">
                <input 
                  type="checkbox"
                  id="statusToggle"
                  checked={formStatus === "Active"}
                  onChange={(e) => setFormStatus(e.target.checked ? "Active" : "Inactive")}
                  className="h-4 w-4 accent-green-600 rounded"
                />
                <label htmlFor="statusToggle" className="text-xs font-medium cursor-pointer">
                  Mark this factor as <span className="font-bold">{formStatus}</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium">
                Save Factor
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
