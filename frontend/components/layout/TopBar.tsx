// components/layout/TopBar.tsx
// Global top navigation bar with search, notification dropdown and user profile details
"use client";

import { useEffect, useState } from "react";
import { Search, Bell, User, LogOut, Shield, Settings, Info } from "lucide-react";
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
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await apiGet<RecentActivityItem[]>("/dashboard/recent-activity");
        setActivities(data.slice(0, 5)); // Show top 5
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    loadNotifications();
    // Refresh notifications occasionally
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearNotifications = () => {
    setUnreadCount(0);
  };

  return (
    <header className="h-16 border-b border-border bg-card/45 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Title / Brand */}
      <div className="flex items-center gap-4">
        <h1 className="text-md font-bold tracking-tight text-foreground/90">
          EcoSphere: <span className="text-emerald-400 font-semibold">ESG Management Platform</span>
        </h1>
      </div>

      {/* Global search & actions */}
      <div className="flex items-center gap-6">
        {/* Simple Global Search (Non-functional MVP) */}
        <div className="relative w-64 max-w-sm hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search metrics, reports, logs..."
            className="pl-9 h-9 w-full bg-background/50 border-border/80 focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xl"
            disabled
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell with Dropdown */}
          <DropdownMenu onOpenChange={(open) => { if (open) handleClearNotifications(); }}>
            <DropdownMenuTrigger 
              render={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/30"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card animate-pulse" />
                  )}
                </Button>
              }
            />
            
            <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl border-border bg-card/95 backdrop-blur-md shadow-2xl">
              <DropdownMenuLabel className="font-semibold text-sm px-3 py-2 flex items-center justify-between">
                <span>Recent Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              
              <div className="max-h-64 overflow-y-auto py-1">
                {activities.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No recent notifications
                  </div>
                ) : (
                  activities.map((act) => (
                    <div 
                      key={act.id} 
                      className="px-3 py-2.5 hover:bg-muted/50 rounded-xl transition-all duration-200 cursor-pointer flex gap-2.5 items-start mt-0.5"
                    >
                      <div className={`p-1.5 rounded-lg border mt-0.5 ${
                        act.type === "carbon" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        act.type === "csr" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        act.type === "compliance" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        <Info className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground/90 truncate">{act.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{act.description}</p>
                        <span className="text-[9px] text-muted-foreground/60 block mt-1">{act.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button 
                  variant="ghost" 
                  className="gap-2.5 px-3 py-1.5 rounded-xl border border-border/40 hover:bg-muted/80 text-foreground/90 hover:text-foreground"
                >
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    AN
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold leading-none">Ansh Nayak</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Lead ESG Analyst</p>
                  </div>
                </Button>
              }
            />
            
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border bg-card/95 backdrop-blur-md shadow-2xl">
              <DropdownMenuLabel className="font-semibold px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-muted cursor-pointer">
                <User className="h-4 w-4 text-emerald-400" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-muted cursor-pointer">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Credentials</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs hover:bg-muted cursor-pointer">
                <Settings className="h-4 w-4 text-emerald-400" />
                <span>System Config</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-border/60" />
              
              <DropdownMenuItem className="gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

    </header>
  );
}
