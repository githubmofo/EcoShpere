"use client";

// components/layout/PlatformFrame.tsx
// App shell for the EcoSphere platform: top app bar + module tabs + a "window"
// container. Mirrors the mockup (EcoSphere: <Module> window with orange active tab).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Leaf, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut } from "lucide-react";

const MODULES = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Environmental", href: "/environmental" },
  { label: "Social", href: "/social" },
  { label: "Governance", href: "/governance" },
  { label: "Gamification", href: "/gamification" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export default function PlatformFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  // Prevent flashing of UI before auth checks
  if (isLoading || !user) {
    return <div className="min-h-screen bg-background text-foreground" />;
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top app bar with premium glassmorphism */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white/5 bg-background/60 px-4 backdrop-blur-2xl md:px-6 transition-all">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Leaf className="size-4.5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">EcoSphere</p>
            <p className="text-[10px] text-muted-foreground">
              ESG Management Platform
            </p>
          </div>
        </div>

        <div className="relative ml-auto hidden md:block">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search…"
            className="h-8 w-56 rounded-lg border border-input bg-input/30 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>

        <button
          className="relative flex size-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary active:scale-95 border border-white/5 shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-medium">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {user.role}
              </p>
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden md:block"></div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 text-muted-foreground hover:text-rose-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      {/* Module tabs */}
      <nav className="sticky top-16 z-30 border-b border-white/5 bg-background/60 px-2 backdrop-blur-xl md:px-6 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {MODULES.map((m) => {
            const active = pathname.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "relative whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-lg my-1",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {m.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-t-full bg-primary shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Window content */}
      <main className="mx-auto max-w-[1400px] px-3 py-5 md:px-6 md:py-7">
        {children}
      </main>
    </div>
  );
}
