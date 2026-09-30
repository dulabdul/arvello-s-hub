"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Command } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      // Berhasil login, middleware sekarang mendeteksi cookie dan akan mengizinkan masuk
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments (Aesthetic) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-brand-surface/80 backdrop-blur-xl border border-brand-border rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-primary text-brand-surface rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/20">
            <Command className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-brand-text">Freelancer Hub</h1>
          <p className="text-brand-muted text-sm mt-1">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@freelancer.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2 font-medium"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
