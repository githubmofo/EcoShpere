// components/layout/TopBar.tsx
// Global top navigation bar with switcher, breadcrumbs, search, notification dropdown and user profile details (Stripe/Linear Redesign)
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, LogOut, Shield, Settings, Info, Building, ChevronRight } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { RecentActivityItem } from "@/lib/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TopBar() {
  const pathname = usePathname();
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [currentOrg, setCurrentOrg] = useState("Fortune 500 Global");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await apiGet<RecentActivityItem[]>("/dashboard/recent-activity");
        setActivities(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleClearNotifications = () => {
    setUnreadCount(0);
  };

  // Generate dynamic breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ name: "Sustain OS", active: true }];
    
    return [
      { name: "Sustain OS", active: false },
      ...segments.map((seg, idx) => {
        // Format name (replace hyphens, capitalize)
        const name = seg
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return {
          name,
          active: idx === segments.length - 1
        };
      })
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-16 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30"
    >
      
      {/* Left side: Org Switcher & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Organization Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <Button 
                variant="ghost" 
                className="gap-2.5 px-3 py-1.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-800 text-white cursor-pointer"
              >
                <Building className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">{currentOrg}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl border-white/5 bg-slate-950/95 backdrop-blur-md shadow-2xl">
            <div className="font-bold text-[9px] text-slate-400 uppercase tracking-widest px-3 py-1.5 select-none">Switch Corporation</div>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem onClick={() => setCurrentOrg("Fortune 500 Global")} className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/5 cursor-pointer">
              <Building className="h-4 w-4 text-emerald-400" />
              <span>Fortune 500 Global</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentOrg("EcoSphere West Region")} className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/5 cursor-pointer">
              <Building className="h-4 w-4 text-blue-400" />
              <span>EcoSphere West Region</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-slate-600">/</span>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden lg:flex items-center gap-1.5">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
              <span className={`text-xs font-bold tracking-wider uppercase ${
                crumb.active ? "text-emerald-400 font-extrabold" : "text-slate-400"
              }`}>
                {crumb.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-5">
        
        {/* Modernized Search bar */}
        <div className="relative w-64 max-w-sm hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Command + K to search..."
            className="pl-9 h-9 w-full bg-slate-900/40 border-white/5 focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xl text-xs text-white"
            disabled
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Notification dropdown */}
          <DropdownMenu onOpenChange={(open) => { if (open) handleClearNotifications(); }}>
            <DropdownMenuTrigger 
              render={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent hover:border-white/5 cursor-pointer"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-950 animate-pulse" />
                  )}
                </Button>
              }
            />
            
            <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl">
              <div className="font-bold text-[10px] uppercase tracking-widest text-white px-3 py-2 flex items-center justify-between select-none">
                <span>Recent Updates</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              
              <div className="max-h-64 overflow-y-auto py-1">
                {activities.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No recent notifications
                  </div>
                ) : (
                  activities.map((act) => (
                    <div 
                      key={act.id} 
                      className="px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer flex gap-2.5 items-start mt-0.5"
                    >
                      <div className={`p-1.5 rounded-lg border mt-0.5 shrink-0 ${
                        act.type === "carbon" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        act.type === "csr" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        act.type === "compliance" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        <Info className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{act.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{act.description}</p>
                        <span className="text-[8px] text-slate-500 font-bold block mt-1 uppercase">{act.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button 
                  variant="ghost" 
                  className="gap-2.5 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black shadow-inner">
                    AN
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-wider leading-none">Ansh Nayak</p>
                    <p className="text-[8px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Lead Analyst</p>
                  </div>
                </Button>
              }
            />
            
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl">
              <div className="font-bold px-3 py-2 text-[9px] text-slate-500 uppercase tracking-widest select-none">
                My Profile
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/5 cursor-pointer">
                <User className="h-4 w-4 text-emerald-400" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/5 cursor-pointer">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Credentials</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/5 cursor-pointer">
                <Settings className="h-4 w-4 text-emerald-400" />
                <span>System Config</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/5" />
              
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

    </motion.header>
  );
}
