"use client";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { FileText, MessageSquare, Users, Activity } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: documents } = useQuery({ queryKey: ["documents"], queryFn: () => api.get<any[]>("/api/v1/documents/") });
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: () => api.get<any>("/api/v1/health/") });
  const stats = [
    { label: "Documents Indexed", value: documents?.length ?? 0, icon: FileText, color: "text-blue-600" },
    { label: "Active Users", value: 1, icon: Users, color: "text-green-600" },
    { label: "Conversations", value: 0, icon: MessageSquare, color: "text-purple-600" },
    { label: "System Status", value: health?.status ?? "checking", icon: Activity, color: health?.status === "healthy" ? "text-green-600" : "text-yellow-600" },
  ];
  return (
    <AppShell>
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-muted-foreground">Welcome back, {user?.full_name || user?.username}</p></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <Card key={s.label}>
              <div className="flex items-center justify-between">
                <div><CardDescription>{s.label}</CardDescription><CardTitle className="mt-1 text-2xl">{s.value}</CardTitle></div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-80`} />
              </div>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardTitle>Recent Documents</CardTitle>
            <div className="mt-4 space-y-3">
              {documents?.slice(0, 5).map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between text-sm"><span className="truncate">{doc.original_filename}</span><span className="text-muted-foreground">{doc.status}</span></div>
              )) ?? <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-full" />)}</div>}
            </div>
          </Card>
          <Card><CardTitle>System Health</CardTitle>
            <div className="mt-4 space-y-2 text-sm">
              {health?.services ? Object.entries(health.services).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between"><span className="capitalize">{k}</span><span className={v.status === "healthy" ? "text-green-600" : "text-red-600"}>{v.status}</span></div>
              )) : <Skeleton className="h-24 w-full" />}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
