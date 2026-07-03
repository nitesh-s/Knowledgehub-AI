import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isAuthenticated() && pathname !== "/login") router.push("/login");
  }, [isAuthenticated, pathname, router]);
  if (!isAuthenticated() && pathname !== "/login") return null;
  return <>{children}</>;
}
