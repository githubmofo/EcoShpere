"use client";

// components/layout/PlatformFrame.tsx
// App shell for the EcoSphere platform: top app bar + module tabs + a "window"
// container. Mirrors the mockup (EcoSphere: <Module> window with orange active tab).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Leaf, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";

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
  const initials = currentUser.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top app bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/70 bg-background/80 px-4 backdrop-blur md:px-6">
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
          className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-medium">{currentUser.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {currentUser.role}
            </p>
          </div>
        </div>
      </header>

      {/* Module tabs */}
      <nav className="sticky top-14 z-30 border-b border-border/70 bg-background/80 px-2 backdrop-blur md:px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {MODULES.map((m) => {
            const active = pathname.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "relative whitespace-nowrap px-3.5 py-3 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
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
