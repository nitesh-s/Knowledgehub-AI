"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await api.post<{ access_token: string }>("/api/v1/auth/login", { email, password });
      const user = await api.get<any>("/api/v1/users/me");
      setAuth(access_token, user);
      router.push("/dashboard");
    } catch { toast.error("Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8">
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">K</div>
          <h1 className="text-2xl font-bold">KnowledgeHub AI</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
      </div>
    </div>
  );
}
