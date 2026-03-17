"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-light px-4">
      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-5 shadow-lg shadow-accent/20">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-content-primary tracking-tight">Quản Lý Tài Chính</h1>
          <p className="text-content-muted mt-2 text-sm">Đăng nhập vào tài khoản của bạn</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-surface-primary border border-border text-content-primary text-sm focus-ring placeholder:text-content-muted transition-colors"
                placeholder="ban@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-2">Mật khẩu</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-surface-primary border border-border text-content-primary text-sm focus-ring placeholder:text-content-muted transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-expense bg-expense-soft px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/30"
            >
              {loading ? "Đang đăng nhập..." : <><span>Đăng nhập</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-content-muted mt-6">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="text-accent hover:text-accent-hover font-semibold transition-colors">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
