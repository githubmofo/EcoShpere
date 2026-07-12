// app/environmental/goals/page.tsx
// Member 1 – Strategic Sustainability Roadmap (Premium Stripe/Linear Redesign)
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Check, 
  AlertCircle, 
  Target, 
  Calendar, 
  BarChart, 
  X, 
  Shield, 
  Sparkles,
  Award,
  ChevronRight,
  Brain,
  TrendingUp,
  Cpu,
  ArrowRight,
  Eye,
  Rocket
} from "lucide-react";
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

// Custom animated progress circle inside goal cards
function GoalProgressRing({ score, target, status }: { score: number; target: number; status: string }) {
  const size = 70;
  const radius = size * 0.4;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const percentage = target > 0 ? Math.min((score / target) * 100, 100) : 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = "#10b981"; // green
  if (status === "at-risk") color = "#f59e0b"; // amber
  if (status === "behind") color = "#ef4444"; // red

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
          stroke={color}
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black text-white font-mono">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<EnvironmentalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Slide-in Goal Details Drawer
  const [selectedGoal, setSelectedGoal] = useState<EnvironmentalGoal | null>(null);

  // Multi-step Wizard States
  const [wizardStep, setWizardStep] = useState(1);

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
    setWizardStep(1);
    setIsOpen(true);
  };

  const openEditModal = (goal: EnvironmentalGoal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(goal.id);
    setFormDept(goal.department);
    setFormTarget(goal.targetEmissions.toString());
    setFormCurrent(goal.currentEmissions.toString());
    setFormStart(goal.startDate);
    setFormEnd(goal.endDate);
    setFormStatus(goal.status);
    setFormError("");
    setWizardStep(1);
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
      setFormError("Start and End dates are required.");
      return;
    }
    if (new Date(formStart) > new Date(formEnd)) {
      setFormError("Start Date cannot be after End Date.");
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
      
      // Update drawer if active
      if (selectedGoal?.id === editingId) {
        setSelectedGoal({ ...selectedGoal, ...payload } as EnvironmentalGoal);
      }

      setIsOpen(false);
      triggerToast("Reduction goal updated successfully!");

      try {
        await apiPatch(`/environmental/goals/${editingId}`, payload);
      } catch (err) {
        console.error("API error updating goal:", err);
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
        console.error("API error creating goal:", err);
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
    <div className="space-y-8 relative min-h-[85vh] pb-12 animate-in fade-in-0 duration-500">
      
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

      {/* 1. ROADMAP MILESTONES ROW */}
      <Card className="bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full pointer-events-none" />
        <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
          <Rocket className="h-4 w-4 text-green-400" />
          Sustainability roadmap timeline
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div className="p-3 bg-slate-950/40 rounded-2xl border border-green-500/10 relative">
            <span className="absolute -top-2.5 left-3.5 bg-green-500 text-slate-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Phase 1</span>
            <p className="text-xs font-bold text-white mt-1 uppercase tracking-wide">Q1 Mappings</p>
            <p className="text-[10px] text-slate-400 mt-1">Configure active factor registry parameters. (100% Mapped)</p>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-2xl border border-emerald-500/10 relative">
            <span className="absolute -top-2.5 left-3.5 bg-emerald-500 text-slate-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Phase 2</span>
            <p className="text-xs font-bold text-white mt-1 uppercase tracking-wide">Q2 Reductions</p>
            <p className="text-[10px] text-slate-400 mt-1">Aggregate logged entries under department caps. (Active)</p>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 relative">
            <span className="absolute -top-2.5 left-3.5 bg-slate-800 text-slate-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Phase 3</span>
            <p className="text-xs font-bold text-white mt-1 uppercase tracking-wide">Q3 Offsets</p>
            <p className="text-[10px] text-slate-400 mt-1">Initiate tree planting and solar grid credits. (Pending)</p>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 relative">
            <span className="absolute -top-2.5 left-3.5 bg-slate-800 text-slate-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Phase 4</span>
            <p className="text-xs font-bold text-white mt-1 uppercase tracking-wide">Q4 Net Zero</p>
            <p className="text-[10px] text-slate-400 mt-1">Final audit reports validation for executive brief. (Pending)</p>
          </div>
        </div>
      </Card>

      {/* 2. ROADMAP CARD VIEW & AI COACH PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Goals Cards Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Goals</h3>
            </div>
            <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-500 text-white rounded-xl gap-1.5 font-bold px-4 py-2.5 shadow-[0_4px_15px_rgba(22,163,74,0.25)] transition-all hover:scale-[1.02] cursor-pointer">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <motion.div
                layoutId={`goal-card-${goal.id}`}
                key={goal.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedGoal(goal)}
                className="bg-slate-900/30 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-3xl p-6 flex flex-col justify-between h-48 shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 relative group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Department Unit</span>
                    <h4 className="text-xs font-black text-white group-hover:text-green-400 mt-1 uppercase tracking-wider transition-colors">{goal.department}</h4>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[8px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(goal.status)}`}>
                    <span className={`h-1 w-1 rounded-full ${
                      goal.status === "on-track" ? "bg-green-400 animate-ping" : goal.status === "at-risk" ? "bg-yellow-400 animate-ping" : "bg-red-400 animate-ping"
                    }`} />
                    {goal.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-6 mt-3">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Logged actual</span>
                    <p className="text-sm font-extrabold text-white font-mono leading-none">{goal.currentEmissions.toLocaleString()} kg</p>
                    <span className="text-[8px] text-slate-500 font-bold block pt-1.5 uppercase tracking-wide">Target Cap: {goal.targetEmissions.toLocaleString()} kg</span>
                  </div>
                  <GoalProgressRing score={goal.currentEmissions} target={goal.targetEmissions} status={goal.status} />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Cycle: {goal.startDate}</span>
                  <div className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                    <span>Audit details</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: AI Sustainability Coach */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest block">AI Sustainability Coach</h3>
          
          <Card className="bg-slate-900/30 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Brain className="h-5 w-5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Strategic Recommendations</span>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed text-slate-300">
                <p>
                  We analyzed **{goals.length} active departmental goals**. 
                </p>
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-[11px] text-red-400 flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>
                    **Operations** and **R&D** units are currently executing **behind** or **at-risk** status limits thresholds.
                  </p>
                </div>
                <p>
                  <strong>Coach Recommendation:</strong> Initiate carbon transactions under Operations using cleaner factors (e.g. Biofuel or Solar) to reduce composite averages before the **Q2 reduction cycle** ends.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5">
                <Button className="w-full bg-slate-950/60 hover:bg-slate-900 border border-white/5 text-xs text-white rounded-xl gap-2 font-bold py-3.5 cursor-pointer">
                  Generate Full ESG Brief
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* 3. GOAL DETAIL DRAWER */}
      <AnimatePresence>
        {selectedGoal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGoal(null)}
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
                    Audit goal roadmap
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedGoal(null)}
                    className="h-7 w-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Department Unit</span>
                    <h4 className="text-base font-black text-white uppercase tracking-wide mt-1 leading-normal">{selectedGoal.department}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Cap</span>
                      <p className="text-md font-black text-white mt-1 font-mono">{selectedGoal.targetEmissions.toLocaleString()} kg</p>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current Log</span>
                      <p className="text-md font-black text-green-400 mt-1 font-mono">{selectedGoal.currentEmissions.toLocaleString()} kg</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border border-white/5 p-4 rounded-3xl bg-slate-950/15 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Start cycle date</span>
                      <span className="text-white font-bold">{selectedGoal.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">End cycle date</span>
                      <span className="text-white font-bold">{selectedGoal.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Roadmap status</span>
                      <span className="text-white font-bold uppercase">{selectedGoal.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t border-white/5 pt-4">
                <Button 
                  onClick={() => {
                    const goal = selectedGoal;
                    setSelectedGoal(null);
                    openEditModal(goal);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-xl gap-2 font-bold py-3.5 shadow-lg cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Target
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. MULTI-STEP CREATION WIZARD MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-slate-900/95 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <DialogTitle className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                {editingId ? "Modify Reduction Goal" : "New Reduction Goal"}
              </DialogTitle>
              {/* Wizard Steps indicator */}
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-full border border-white/5 text-[9px] font-bold text-slate-400">
                <span className={wizardStep === 1 ? "text-green-400" : ""}>1</span>
                <span>/</span>
                <span className={wizardStep === 2 ? "text-green-400" : ""}>2</span>
                <span>/</span>
                <span className={wizardStep === 3 ? "text-green-400" : ""}>3</span>
              </div>
            </div>
            <DialogDescription className="text-xs text-slate-400 mt-2">
              Step {wizardStep} of 3: {
                wizardStep === 1 ? "Configure Scope" : wizardStep === 2 ? "Target Parameters" : "Audit Timeline"
              }
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

            {/* STEP 1: CONFIGURE SCOPE */}
            {wizardStep === 1 && (
              <motion.div 
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Department Unit</label>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pillar Status</label>
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
              </motion.div>
            )}

            {/* STEP 2: TARGET PARAMETERS */}
            {wizardStep === 2 && (
              <motion.div 
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Emissions Cap (kg CO₂e)</label>
                  <Input
                    type="number"
                    step="any"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="e.g. 8000"
                    className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl py-5 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Level (kg CO₂e)</label>
                  <Input
                    type="number"
                    step="any"
                    value={formCurrent}
                    onChange={(e) => setFormCurrent(e.target.value)}
                    placeholder="e.g. 1200"
                    className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl py-5 text-white"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: AUDIT TIMELINE */}
            {wizardStep === 3 && (
              <motion.div 
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Cycle Date</label>
                  <Input
                    type="date"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl py-5 text-white text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">End Cycle Date</label>
                  <Input
                    type="date"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="bg-slate-950/60 border-white/5 focus-visible:ring-1 focus-visible:ring-green-500 rounded-xl py-5 text-white text-xs"
                  />
                </div>
              </motion.div>
            )}

            {/* wizard navigation controls */}
            <DialogFooter className="pt-4 border-t border-white/5">
              {wizardStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setWizardStep(prev => prev - 1)} 
                  className="rounded-xl border-white/10 text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </Button>
              )}
              {wizardStep < 3 ? (
                <Button 
                  type="button" 
                  onClick={() => setWizardStep(prev => prev + 1)} 
                  className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold px-5 shadow-lg cursor-pointer"
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" className="bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold px-5 shadow-lg cursor-pointer">
                  Save Roadmap
                </Button>
              )}
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
