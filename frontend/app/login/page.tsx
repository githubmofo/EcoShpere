"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Leaf, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please enter a valid email and password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative min-h-screen overflow-hidden bg-background">
      {/* Immersive background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[150px] mix-blend-screen" style={{ animation: "pulse 4s infinite reverse" }} />

      <Card className="w-full max-w-md p-8 glass-card relative z-10 mx-4">
        <div className="flex flex-col items-center mb-10">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Leaf className="size-8 text-primary relative z-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">EcoSphere</h1>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-widest">Sustain OS Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="Enterprise Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 bg-background/50 border border-border rounded-xl pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-12 bg-background/50 border border-border rounded-xl pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Initiate Uplink
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-border text-center flex flex-col gap-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            New to EcoSphere?
          </p>
          <Link href="/register" className="text-primary hover:text-primary/80 text-xs font-bold uppercase tracking-widest transition-colors">
            Register Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
