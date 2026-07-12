// app/environmental/goals/page.tsx
// Member 1 – Environmental Goals Subpage (Enhanced Premium Design)
"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Check, AlertCircle, Target, Calendar, BarChart, X, Shield, Sparkles } from "lucide-react";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { EnvironmentalGoal } from "@/lib/types";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function GoalsPage() {
  const [goals, setGoals] = useState<EnvironmentalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDept, setFormDept] = useState("Operations");
  const [formTarget, setFormTarget] = useState("");
  const [formCurrent, setFormCurrent] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formStatus, setFormStatus] = useState<"on-track" | "at-risk" | "behind">("on-track");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await apiGet<EnvironmentalGoal[]>("/environmental/goals");
        setGoals(data);
      } catch (err) {
        console.error("Failed to load goals:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGoals();
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
    setFormDept("Operations");
    setFormTarget("");
    setFormCurrent("0");
    setFormStart(new Date().toISOString().split("T")[0]);
    setFormEnd(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setFormStatus("on-track");
    setFormError("");
    setIsOpen(true);
  };

  const openEditModal = (goal: EnvironmentalGoal) => {
    setEditingId(goal.id);
    setFormDept(goal.department);
    setFormTarget(goal.targetEmissions.toString());
    setFormCurrent(goal.currentEmissions.toString());
    setFormStart(goal.startDate);
    setFormEnd(goal.endDate);
    setFormStatus(goal.status);
    setFormError("");
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const target = parseFloat(formTarget);
    const current = parseFloat(formCurrent);

    if (isNaN(target) || target <= 0) {
      setFormError("Target Emissions must be a positive number.");
      return;
    }
    if (isNaN(current) || current < 0) {
      setFormError("Current Emissions must be a non-negative number.");
      return;
    }
    if (!formStart || !formEnd) {
      setFormError("Start Date and End Date are required.");
      return;
    }
    if (new Date(formStart) > new Date(formEnd)) {
      setFormError("Start Date cannot be later than End Date.");
      return;
    }

    const payload = {
      department: formDept,
      targetEmissions: target,
      currentEmissions: current,
      startDate: formStart,
      endDate: formEnd,
      status: formStatus,
      target: target,
      current: current,
      title: `${formDept} Reduction Target`
    };

    const previousGoals = [...goals];

    if (editingId) {
      const updatedList = goals.map(g => 
        g.id === editingId ? { ...g, ...payload } : g
      );
      setGoals(updatedList);
      setIsOpen(false);
      triggerToast("Reduction goal updated successfully!");

      try {
        await apiPatch(`/environmental/goals/${editingId}`, payload);
      } catch (err) {
        console.error("API error while updating goal:", err);
        setGoals(previousGoals);
        triggerToast("Failed to update goal on server.", "error");
      }
    } else {
      const tempId = `goal-temp-${Date.now()}`;
      const tempGoal: EnvironmentalGoal = {
        ...payload,
        id: tempId
      } as EnvironmentalGoal;

      setGoals(prev => [...prev, tempGoal]);
      setIsOpen(false);
      triggerToast("Reduction goal created successfully!");

      try {
        const saved = await apiPost<EnvironmentalGoal>("/environmental/goals", payload);
        setGoals(prev => prev.map(g => g.id === tempId ? saved : g));
      } catch (err) {
        console.error("API error while creating goal:", err);
        setGoals(previousGoals);
        triggerToast("Failed to save goal on server.", "error");
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ecosphere_carbon_updated"));
    }
  };

  const getStatusBadge = (status: "on-track" | "at-risk" | "behind") => {
    switch (status) {
      case "on-track":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      case "at-risk":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      case "behind":
        return "bg-red-500/10 border-red-500/20 text-red-400";
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Departmental Reduction Targets
          </h3>
          <p className="text-xs text-slate-400">Establish and monitor carbon limitation target goals</p>
        </div>
        <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 font-bold px-4 py-2.5 shadow-[0_4px_15px_rgba(22,163,74,0.25)] transition-all hover:scale-[1.03] cursor-pointer">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 border border-dashed border-white/5 rounded-3xl">
          No carbon target goals logged yet. Setup a departmental limit using the editor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = goal.targetEmissions > 0 
              ? Math.min((goal.currentEmissions / goal.targetEmissions) * 100, 100) 
              : 100;
            const progressPct = progress.toFixed(1);
            
            let progressColor = "bg-green-500";
            let shadowColor = "shadow-[0_0_10px_rgba(34,197,94,0.3)]";
            if (goal.status === "at-risk") {
              progressColor = "bg-yellow-500";
              shadowColor = "shadow-[0_0_10px_rgba(245,158,11,0.3)]";
            }
            if (goal.status === "behind") {
              progressColor = "bg-red-500";
              shadowColor = "shadow-[0_0_10px_rgba(239,68,68,0.3)]";
            }

            return (
              <Card key={goal.id} className="group bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-300 relative flex flex-col justify-between hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
                <CardHeader className="pb-4 border-b border-white/5 bg-slate-950/20 flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-slate-300 group-hover:scale-105 transition-transform">
                      <Target className="h-4.5 w-4.5 text-green-400" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Business Unit</span>
                      <CardTitle className="text-sm font-black text-white mt-0.5">{goal.department}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(goal.status)}`}>
                      <span className={`h-1 w-1 rounded-full ${
                        goal.status === "on-track" ? "bg-green-400" : goal.status === "at-risk" ? "bg-yellow-400" : "bg-red-400"
                      } animate-ping`} />
                      {goal.status === "on-track" ? "On Track" : goal.status === "at-risk" ? "At Risk" : "Behind"}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditModal(goal)}
                      className="h-8 w-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent hover:border-white/5 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="py-6 space-y-4 flex-1">
                  
                  {/* Target details */}
                  <div className="grid grid-cols-2 gap-4 border border-white/5 p-3 rounded-2xl bg-slate-950/20">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Cap</span>
                      <p className="text-xs font-bold text-white mt-0.5">{goal.targetEmissions.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Output</span>
                      <p className="text-xs font-bold text-white mt-0.5">{goal.currentEmissions.toLocaleString()} kg</p>
                    </div>
                  </div>

                  {/* Progress bar container */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Threshold Progress</span>
                      <span className="font-extrabold text-white">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5 relative">
                      <div className={`h-full ${progressColor} ${shadowColor} rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                </CardContent>

                <CardFooter className="border-t border-white/5 text-[9px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5 bg-slate-950/20 px-6 py-3.5 uppercase">
                  <Calendar className="h-3.5 w-3.5 text-green-400/80 shrink-0" />
                  <span>Cycle Period: {goal.startDate} to {goal.endDate}</span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* NEW/EDIT GOAL MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-slate-900/95 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400 animate-pulse" />
              {editingId ? "Update Reduction Goal" : "New Reduction Goal"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Establish emissions limitations targets and track execution cycle schedules.
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="flex h-[42px] w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-white shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                >
                  <option value="on-track" className="bg-slate-900">On Track</option>
                  <option value="at-risk" className="bg-slate-900">At Risk</option>
                  <option value="behind" className="bg-slate-900">Behind</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Cap (kg CO₂e)</label>
                <Input
                  type="number"
                  step="any"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="e.g. 8000"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Level (kg)</label>
                <Input
                  type="number"
                  step="any"
                  value={formCurrent}
                  onChange={(e) => setFormCurrent(e.target.value)}
                  placeholder="e.g. 1200"
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Cycle Date</label>
                <Input
                  type="date"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">End Cycle Date</label>
                <Input
                  type="date"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl py-5 text-white text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-white/5">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-white/10 text-slate-300 hover:bg-slate-800 cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold px-5 shadow-[0_4px_15px_rgba(22,163,74,0.2)] cursor-pointer">
                Save Target
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
