"use client";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import {
  CheckCircle, XCircle, Server, Database, HardDrive, Cpu, FileText,
} from "lucide-react";

const serviceIcons: Record<string, React.ReactNode> = {
  postgres: <Database className="h-5 w-5" />,
  redis: <HardDrive className="h-5 w-5" />,
  qdrant: <Server className="h-5 w-5" />,
  ollama: <Cpu className="h-5 w-5" />,
};

export default function AdminHealthPage() {
  const { user } = useAuthStore();
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => api.get<{ status: string; details: string; services: Record<string, { status: string; message: string; models?: string[] }> }>("/api/v1/health/"),
    refetchInterval: 10_000,
    enabled: user?.role === "admin",
  });

  const { data: docs } = useQuery({
    queryKey: ["failed-documents"],
    queryFn: () => api.get<any[]>("/api/v1/documents/"),
    enabled: user?.role === "admin",
  });

  const failedDocs = docs?.filter(d => d.status === "failed") ?? [];
  const pendingDocs = docs?.filter(d => d.status === "pending") ?? [];

  if (user?.role !== "admin") return <AppShell><p className="text-muted-foreground">Access denied.</p></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">System Health</h1><p className="text-muted-foreground">Monitor service status and connectivity</p></div>
          <button onClick={() => refetch()} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent cursor-pointer">Refresh</button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {health?.services && Object.entries(health.services as Record<string, { status: string; message: string; models?: string[] }>).map(([name, svc]) => {
              const isHealthy = svc.status === "healthy";
              return (
                <Card key={name}>
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-3 ${isHealthy ? "bg-green-500/10" : "bg-red-500/10"}`}>
                      {serviceIcons[name] || <Server className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize">{name}</CardTitle>
                        {isHealthy ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                      <CardDescription className="mt-1">{svc.message}</CardDescription>
                      {svc.models && svc.models.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {svc.models.map(m => <span key={m} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{m}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardTitle className="mb-2">Overall Status</CardTitle>
          {health && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${health.status === "healthy" ? "bg-green-500" : "bg-yellow-500"}`} />
                <span className={`font-medium capitalize ${health.status === "healthy" ? "text-green-500" : "text-yellow-500"}`}>{health.status}</span>
              </div>
              {health.details && <p className="text-sm text-muted-foreground">{health.details}</p>}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-2">Documents with Errors</CardTitle>
          {failedDocs.length === 0 && pendingDocs.length === 0 ? (
            <CardDescription>No failed or stuck documents.</CardDescription>
          ) : (
            <div className="space-y-3">
              {failedDocs.map((d: any) => (
                <div key={d.id} className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-red-700"><FileText className="h-4 w-4" />{d.original_filename}</div>
                  <p className="mt-1 text-red-600">Error: {d.error_message || "Unknown error"}</p>
                </div>
              ))}
              {pendingDocs.map((d: any) => (
                <div key={d.id} className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-yellow-700"><FileText className="h-4 w-4" />{d.original_filename}</div>
                  <p className="mt-1 text-yellow-600">Status: pending — worker may not be processing. Check arq-worker logs.</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
