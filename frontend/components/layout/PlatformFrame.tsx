"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  Bell, Leaf, Search, Menu, X, 
  LayoutDashboard, Globe, Users, Shield, 
  Trophy, FileText, Settings, Sun, Moon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut } from "lucide-react";

const MODULES = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Environmental", href: "/environmental", icon: Globe },
  { label: "Social", href: "/social", icon: Users },
  { label: "Governance", href: "/governance", icon: Shield },
  { label: "Gamification", href: "/gamification", icon: Trophy },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function PlatformFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-esg-bg-root text-esg-text-primary flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  // Prevent flashing of UI before auth checks
  if (isLoading || !user) {
    return <div className="min-h-screen bg-esg-bg-root text-esg-text-primary" />;
  }

  const initials = user.name.split(" ").map((p) => p[0]).join("");

  // Determine current module for the Topbar title
  const currentModule = MODULES.find(m => pathname.startsWith(m.href)) || MODULES[0];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-esg-bg-root text-esg-text-primary transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-esg-border-subtle bg-esg-bg-surface transition-transform duration-300 md:translate-x-0 md:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-esg-border-subtle">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-esg-accent-primary)]/15 text-[var(--color-esg-accent-primary)] shadow-sm">
            <Leaf className="size-4.5" />
          </span>
          <div className="leading-tight">
            <h2 className="text-sm font-bold tracking-tight">EcoSphere</h2>
            <p className="text-[10px] font-medium text-esg-text-muted uppercase tracking-wider">ESG Platform</p>
          </div>
          <button className="ml-auto md:hidden text-esg-text-muted" onClick={() => setIsSidebarOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-none">
          {MODULES.map((m) => {
            const active = pathname.startsWith(m.href);
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-4",
                  active
                    ? "bg-[var(--color-esg-accent-primary)]/10 text-[var(--color-esg-accent-primary)] border-[var(--color-esg-accent-primary)] shadow-sm"
                    : "text-esg-text-muted border-transparent hover:bg-esg-bg-surface-muted hover:text-esg-text-primary"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className={cn("size-4.5 transition-colors", active ? "text-[var(--color-esg-accent-primary)]" : "group-hover:text-esg-text-primary")} />
                {m.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-esg-border-subtle bg-esg-bg-surface/80 px-4 backdrop-blur-2xl md:px-6">
          <button 
            className="md:hidden flex size-9 items-center justify-center rounded-xl bg-esg-bg-surface-muted border border-esg-border-subtle text-esg-text-muted"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <h1 className="text-lg font-bold tracking-tight hidden sm:block">
            {currentModule.label}
          </h1>

          <div className="relative ml-auto flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-esg-text-muted" />
            <input
              placeholder="Search platform..."
              className="h-9 w-full rounded-full border border-esg-border-subtle bg-esg-bg-surface-muted pl-9 pr-4 text-sm outline-none transition-all placeholder:text-esg-text-muted focus-visible:border-[var(--color-esg-accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-esg-accent-primary)]/30 focus-visible:bg-esg-bg-surface"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative flex size-9 items-center justify-center rounded-full bg-esg-bg-surface-muted text-esg-text-muted transition-all hover:bg-esg-bg-surface-muted/80 hover:text-esg-text-primary active:scale-95 border border-esg-border-subtle"
            >
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>

            <button
              className="relative flex size-9 items-center justify-center rounded-full bg-esg-bg-surface-muted text-esg-text-muted transition-all hover:bg-esg-bg-surface-muted/80 hover:text-esg-text-primary active:scale-95 border border-esg-border-subtle"
            >
              <Bell className="size-4.5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--color-esg-accent-danger)] shadow-[0_0_8px_var(--color-esg-accent-danger)] animate-pulse" />
            </button>

            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-esg-border-subtle">
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-esg-accent-primary)] text-xs font-bold text-white shadow-sm">
                {initials}
              </span>
              <div className="hidden leading-tight lg:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[10px] text-esg-text-muted uppercase tracking-wide">
                  {user.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="ml-2 flex items-center gap-2 text-esg-text-muted hover:text-[var(--color-esg-accent-danger)] transition-colors"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
