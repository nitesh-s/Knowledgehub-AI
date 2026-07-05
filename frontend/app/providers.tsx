"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>{children}</AuthGuard>
      <Toaster position="top-right" duration={2000} />
    </QueryClientProvider>
  );
}
