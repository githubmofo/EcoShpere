"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Leaf, Lock, Mail, ArrowRight, Loader2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (register) {
        await register(name, email, password);
      } else {
        throw new Error("Registration not implemented in AuthProvider yet.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative min-h-screen overflow-hidden">
      {/* Immersive background elements */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] mix-blend-screen" style={{ animation: "pulse 4s infinite reverse" }} />

      <Card className="w-full max-w-md p-8 glass-card border-white/10 relative z-10 mx-4">
        <div className="flex flex-col items-center mb-10">
          <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Leaf className="size-8 text-emerald-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Join EcoSphere</h1>
          <p className="text-sm font-medium text-emerald-400/80 uppercase tracking-widest">Sustain OS Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                placeholder="Enterprise Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="password"
                placeholder="Secure Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center flex flex-col gap-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
            Already have an account?
          </p>
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-widest transition-colors">
            Login Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
