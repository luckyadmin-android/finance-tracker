"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import {
  TrendingUp, LayoutDashboard, ArrowLeftRight, Tag, Target,
  LogOut, Menu, X, Moon, Sun,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Tổng Quan", icon: LayoutDashboard },
  { href: "/transactions", label: "Giao Dịch", icon: ArrowLeftRight },
  { href: "/categories", label: "Danh Mục", icon: Tag },
  { href: "/goals", label: "Mục Tiêu", icon: Target },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold font-display text-content-primary text-lg tracking-tight">Tài Chính</span>
            <p className="text-[10px] text-content-muted font-medium tracking-widest uppercase">Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold text-content-muted tracking-widest uppercase">Menu</p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href} href={href} onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-content-secondary hover:bg-accent-soft hover:text-accent"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px]", active ? "text-white" : "text-content-muted")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-5 space-y-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-content-secondary hover:bg-accent-soft hover:text-accent transition-all duration-200"
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px] text-income" /> : <Moon className="w-[18px] h-[18px] text-content-muted" />}
          {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
        </button>

        <div className="px-3 py-2">
          <p className="text-[11px] text-content-muted truncate">{userEmail}</p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-content-secondary hover:bg-expense-soft hover:text-expense transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] text-content-muted" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-72 bg-surface-secondary/80 backdrop-blur-xl border-r border-border z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-surface-secondary/80 backdrop-blur-xl border-b border-border z-30 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-accent-soft transition-colors">
          <Menu className="w-5 h-5 text-content-secondary" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold font-display text-content-primary">Tài Chính</span>
        </div>
        <div className="ml-auto">
          <button onClick={toggle} className="p-2 rounded-xl hover:bg-accent-soft transition-colors">
            {theme === "dark" ? <Sun className="w-5 h-5 text-income" /> : <Moon className="w-5 h-5 text-content-muted" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-surface-secondary z-50 flex flex-col shadow-card-lg">
            <div className="absolute right-3 top-4">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-accent-soft transition-colors">
                <X className="w-5 h-5 text-content-muted" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      <div className="lg:hidden h-16" />
    </>
  );
}
