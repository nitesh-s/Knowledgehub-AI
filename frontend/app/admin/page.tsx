"use client";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { Users, FileText, Settings, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  if (user?.role !== "admin") return <AppShell><p className="text-muted-foreground">Access denied.</p></AppShell>;
  const cards = [
    { label: "User Management", desc: "Manage users, roles, and permissions", icon: Users, href: "/admin/users" },
    { label: "Documents", desc: "Upload, rebuild embeddings, manage collections", icon: FileText, href: "/library" },
    { label: "System Settings", desc: "Model selection, prompt templates, configuration", icon: Settings, href: "#" },
    { label: "System Health", desc: "Monitor services, view logs, inspect prompts", icon: Activity, href: "/admin/health" },
  ];
  return (
    <AppShell>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">System administration and configuration</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map(c => (
            <Card key={c.label} className="cursor-pointer transition-colors hover:bg-accent/50" onClick={() => router.push(c.href)}>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3"><c.icon className="h-6 w-6 text-primary" /></div>
                <div><CardTitle>{c.label}</CardTitle><CardDescription className="mt-1">{c.desc}</CardDescription></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
