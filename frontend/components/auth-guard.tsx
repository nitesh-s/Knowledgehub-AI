import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const publicPaths = ["/login", "/register"];
  const isPublic = publicPaths.includes(pathname);
  useEffect(() => {
    if (!isAuthenticated() && !isPublic) router.push("/login");
  }, [isAuthenticated, pathname, router, isPublic]);
  if (!isAuthenticated() && !isPublic) return null;
  return <>{children}</>;
}
