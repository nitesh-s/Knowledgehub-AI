"use client";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Cpu } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const { data: health } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => api.get<{ status: string; services: Record<string, { status: string; message: string; models?: string[] }> }>("/api/v1/health/"),
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") return <AppShell><p className="text-muted-foreground">Access denied.</p></AppShell>;

  const ollamaModels = health?.services?.ollama?.models;

  return (
    <AppShell>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">System Settings</h1><p className="text-muted-foreground">Model selection and configuration</p></div>

        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3"><Cpu className="h-6 w-6 text-primary" /></div>
            <div className="flex-1">
              <CardTitle>Available Models</CardTitle>
              <CardDescription className="mt-1">
                {ollamaModels ? (
                  ollamaModels.length > 0
                    ? <div className="flex flex-wrap gap-2 mt-2">{[...new Set(ollamaModels.map((m: string) => m.includes(":") ? m.split(":")[0] : m))].map(name => <span key={name} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{name}</span>)}</div>
                    : <p className="mt-2 text-yellow-600">No models found on Ollama server.</p>
                ) : <Skeleton className="h-8 w-48 mt-2" />}
              </CardDescription>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Configuration</CardTitle>
          <CardDescription className="mt-1">Settings are managed via environment variables on the server. Restart the backend after making changes.</CardDescription>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between rounded-lg border border-border px-4 py-3"><span className="text-muted-foreground">Ollama Server</span><span className="font-medium">http://192.168.3.118:11434</span></div>
            <div className="flex justify-between rounded-lg border border-border px-4 py-3"><span className="text-muted-foreground">Default Model</span><span className="font-medium">llama3.1</span></div>
            <div className="flex justify-between rounded-lg border border-border px-4 py-3"><span className="text-muted-foreground">Embedding Model</span><span className="font-medium">bge-m3</span></div>
            <div className="flex justify-between rounded-lg border border-border px-4 py-3"><span className="text-muted-foreground">Max Upload Size</span><span className="font-medium">50 MB</span></div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
