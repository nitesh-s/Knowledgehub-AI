"use client";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => api.get<any[]>("/api/v1/users/"), enabled: user?.role === "admin" });
  if (user?.role !== "admin") return <AppShell><p className="text-muted-foreground">Access denied.</p></AppShell>;
  return (
    <AppShell>
      <div className="space-y-6"><h1 className="text-3xl font-bold">User Management</h1>
        <Card><CardTitle className="mb-4">All Users</CardTitle>
          {isLoading ? <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : <div className="space-y-2">{users?.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div><p className="font-medium">{u.full_name || u.username}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">{u.role}</span>
                <span className={`h-2 w-2 rounded-full ${u.is_active ? "bg-green-500" : "bg-red-500"}`} />
              </div>
            </div>
          ))}</div>}
        </Card>
      </div>
    </AppShell>
  );
}
