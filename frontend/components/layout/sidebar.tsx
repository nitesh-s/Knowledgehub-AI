"use client";
import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, LayoutDashboard, Library, Settings, Users, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/library", label: "Knowledge Library", icon: Library },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: Settings, adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">K</div>
        <span className="text-lg font-semibold">KnowledgeHub</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.filter(item => !item.adminOnly || user?.role === "admin").map(item => (
          <button key={item.href} onClick={() => router.push(item.href)}
            className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
            <item.icon className="h-4 w-4" />{item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={() => { logout(); router.push("/login"); }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          <LogOut className="h-4 w-4" />Sign out
        </button>
      </div>
    </aside>
  );
}
