"use client";

// components/feedback/Toaster.tsx
// Minimal dependency-free toast system. Call `toast({...})` from anywhere and
// render <Toaster /> once on the page.

import { useEffect, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: Listener[] = [];
let nextId = 1;

function emit() {
  for (const l of listeners) l([...toasts]);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(input: {
  title: string;
  description?: string;
  variant?: ToastVariant;
}) {
  const item: ToastItem = {
    id: nextId++,
    title: input.title,
    description: input.description,
    variant: input.variant ?? "success",
  };
  toasts = [...toasts, item];
  emit();
  setTimeout(() => dismiss(item.id), 3600);
}

const variantStyles: Record<ToastVariant, string> = {
  success: "border-primary/40 text-foreground",
  error: "border-destructive/50 text-foreground",
  info: "border-border text-foreground",
};

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-primary" />,
  error: <XCircle className="size-4 text-destructive" />,
  info: <Info className="size-4 text-muted-foreground" />,
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    setItems([...toasts]);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-card px-3.5 py-3 shadow-lg ring-1 ring-foreground/10 animate-in slide-in-from-right-4 fade-in",
            variantStyles[t.variant]
          )}
        >
          <span className="mt-0.5">{icons[t.variant]}</span>
          <div className="flex-1">
            <p className="text-sm font-medium leading-snug">{t.title}</p>
            {t.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <XCircle className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
