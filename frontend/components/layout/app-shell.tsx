"use client";
import { Sidebar } from "./sidebar";
export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen"><Sidebar /><main className="flex-1 overflow-auto bg-background p-8">{children}</main></div>;
}
