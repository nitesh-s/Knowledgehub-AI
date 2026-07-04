"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("llama3.1");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<{ services: Record<string, { models?: string[] }> }>("/api/v1/health/"),
    staleTime: 60_000,
  });
  const availableModels = health?.services?.ollama?.models ?? [];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: input };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post<{ conversation_id: string; content: string }>("/api/v1/chat/", { conversation_id: conversationId, message: userMsg.content, model: selectedModel });
      setConversationId(res.conversation_id);
      setMessages(p => [...p, { id: crypto.randomUUID(), role: "assistant", content: res.content }]);
    } catch (err: any) { toast.error(err.message || "Failed to get response"); }
    finally { setLoading(false); }
  };

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">AI Chat</h1><p className="text-sm text-muted-foreground">Ask questions about your knowledge base</p></div>
          <div className="flex items-center gap-2">
            <label htmlFor="model-select" className="text-sm text-muted-foreground">Model:</label>
            <select id="model-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {availableModels.length > 0 ? availableModels.map(m => <option key={m} value={m}>{m}</option>) : <option value="llama3.1">llama3.1</option>}
            </select>
          </div>
        </div>
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground"><Bot className="mx-auto mb-2 h-12 w-12" /><p>Ask a question to get started</p></div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground shrink-0"><Bot className="h-4 w-4" /></div>}
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                {msg.role === "user" && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs shrink-0"><User className="h-4 w-4" /></div>}
              </div>
            ))}
            {loading && <div className="flex gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"><Bot className="h-4 w-4" /></div><div className="rounded-lg bg-muted px-4 py-2"><Loader2 className="h-5 w-5 animate-spin" /></div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-border p-4">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." disabled={loading} />
              <Button type="submit" disabled={loading || !input.trim()}><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
