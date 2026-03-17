"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, ArrowRight, Mail } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-light px-4">
        <div className="text-center max-w-sm animate-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-soft rounded-2xl mb-5">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold font-display text-content-primary mb-2">Kiểm tra email của bạn</h2>
          <p className="text-content-muted text-sm leading-relaxed">
            Chúng tôi đã gửi liên kết xác nhận đến <strong className="text-content-secondary">{email}</strong>. Nhấp vào đó để kích hoạt tài khoản.
          </p>
          <Link href="/login" className="inline-flex items-center gap-1 mt-6 text-accent hover:text-accent-hover text-sm font-semibold transition-colors">
            Quay lại đăng nhập <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-light px-4">
      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-5 shadow-lg shadow-accent/20">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-content-primary tracking-tight">Quản Lý Tài Chính</h1>
          <p className="text-content-muted mt-2 text-sm">Tạo tài khoản của bạn</p>
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
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-surface-primary border border-border text-content-primary text-sm focus-ring placeholder:text-content-muted transition-colors"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            {error && (
              <p className="text-sm text-expense bg-expense-soft px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/30"
            >
              {loading ? "Đang tạo tài khoản..." : <><span>Tạo tài khoản</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-content-muted mt-6">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-accent hover:text-accent-hover font-semibold transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
