// components/layout/Sidebar.tsx
// Global sidebar navigation component with premium dark theme and active route styling
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    activeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500",
    hoverColor: "hover:text-emerald-400 hover:bg-emerald-500/5"
  },
  { 
    name: "Environmental", 
    href: "/environmental", 
    icon: Leaf, 
    color: "text-green-500", 
    activeBg: "bg-green-500/10 text-green-400 border-green-500",
    hoverColor: "hover:text-green-400 hover:bg-green-500/5"
  },
  { 
    name: "Social", 
    href: "/social", 
    icon: Users, 
    color: "text-blue-500", 
    activeBg: "bg-blue-500/10 text-blue-400 border-blue-500",
    hoverColor: "hover:text-blue-400 hover:bg-blue-500/5"
  },
  { 
    name: "Governance", 
    href: "/governance", 
    icon: ShieldAlert, 
    color: "text-purple-500", 
    activeBg: "bg-purple-500/10 text-purple-400 border-purple-500",
    hoverColor: "hover:text-purple-400 hover:bg-purple-500/5"
  },
  { 
    name: "Gamification", 
    href: "/gamification", 
    icon: Trophy, 
    color: "text-amber-500", 
    activeBg: "bg-amber-500/10 text-amber-400 border-amber-500",
    hoverColor: "hover:text-amber-400 hover:bg-amber-500/5"
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: FileSpreadsheet, 
    color: "text-cyan-500", 
    activeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500",
    hoverColor: "hover:text-cyan-400 hover:bg-cyan-500/5"
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings, 
    color: "text-slate-400", 
    activeBg: "bg-slate-400/15 text-slate-200 border-slate-400",
    hoverColor: "hover:text-slate-200 hover:bg-slate-400/5"
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card/60 backdrop-blur-md border-r border-border flex flex-col h-screen sticky top-0">
      {/* Platform Branding Logo */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Globe className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            EcoSphere
          </span>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold">ESG platform</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          // Check if current path matches item.href, or starts with it (except for /dashboard)
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border border-transparent font-medium text-sm transition-all duration-300 ${
                isActive 
                  ? item.activeBg 
                  : `text-muted-foreground ${item.hoverColor}`
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "" : item.color}`} />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border bg-card/20 text-center">
        <p className="text-xs text-muted-foreground">Hackathon Project MVP</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">© 2026 EcoSphere Team</p>
      </div>
    </aside>
  );
}
