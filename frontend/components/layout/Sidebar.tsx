// components/layout/Sidebar.tsx
// Global sidebar navigation component with Stripe/Linear-style glassmorphism and Framer Motion
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  ShieldAlert, 
  Trophy, 
  FileSpreadsheet, 
  Settings, 
  Globe 
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  color: string;
  activeBg: string;
  hoverColor: string;
}

const navItems: NavItem[] = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    color: "text-emerald-500", 
    activeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    hoverColor: "hover:text-emerald-400 hover:bg-emerald-500/5"
  },
  { 
    name: "Environmental", 
    href: "/environmental", 
    icon: Leaf, 
    color: "text-green-500", 
    activeBg: "bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]",
    hoverColor: "hover:text-green-400 hover:bg-green-500/5"
  },
  { 
    name: "Social", 
    href: "/social", 
    icon: Users, 
    color: "text-blue-500", 
    activeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    hoverColor: "hover:text-blue-400 hover:bg-blue-500/5"
  },
  { 
    name: "Governance", 
    href: "/governance", 
    icon: ShieldAlert, 
    color: "text-purple-500", 
    activeBg: "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    hoverColor: "hover:text-purple-400 hover:bg-purple-500/5"
  },
  { 
    name: "Gamification", 
    href: "/gamification", 
    icon: Trophy, 
    color: "text-amber-500", 
    activeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    hoverColor: "hover:text-amber-400 hover:bg-amber-500/5"
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: FileSpreadsheet, 
    color: "text-cyan-500", 
    activeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    hoverColor: "hover:text-cyan-400 hover:bg-cyan-500/5"
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings, 
    color: "text-slate-400", 
    activeBg: "bg-slate-400/15 text-slate-200 border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.1)]",
    hoverColor: "hover:text-slate-200 hover:bg-slate-400/5"
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-64 bg-slate-950/40 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen sticky top-0 z-40"
    >
      {/* Brand logo */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <motion.div 
          whileHover={{ rotate: 18, scale: 1.05 }}
          className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <Globe className="h-5 w-5 animate-pulse" />
        </motion.div>
        <div>
          <span className="font-black text-md tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent uppercase">
            EcoSphere
          </span>
          <p className="text-[9px] text-emerald-400/80 tracking-widest uppercase font-bold mt-0.5">Sustain OS</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.05 * idx, duration: 0.4 }}
            >
              <Link href={item.href} className="block">
                <motion.button
                  whileHover={{ x: 4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-300 text-left ${
                    isActive 
                      ? `${item.activeBg} border-white/10` 
                      : `text-slate-400 border-transparent ${item.hoverColor}`
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? "" : item.color}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" 
                    />
                  )}
                </motion.button>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-950/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/5 mx-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest">Sys Status: Live DB</span>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fortune 500 Console</p>
          <p className="text-[8px] text-slate-600/80 mt-0.5 uppercase tracking-widest">© 2026 EcoSphere Inc</p>
        </div>
      </div>
    </motion.aside>
  );
}
