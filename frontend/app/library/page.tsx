"use client";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Upload, FileText, Trash2 } from "lucide-react";
import type { Document } from "@/types";

export default function LibraryPage() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = useQuery({ queryKey: ["documents"], queryFn: () => api.get<Document[]>("/api/v1/documents/") });
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => { const fd = new FormData(); fd.append("file", file); return api.upload<{ id: string }>("/api/v1/documents/upload", fd); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document uploaded"); },
    onError: (err: any) => toast.error(err.message || "Upload failed"),
  });
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { await uploadMutation.mutateAsync(file); }
    finally { setUploading(false); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => api.post(`/api/v1/documents/${docId}/delete`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document deleted"); },
    onError: (err: any) => toast.error(err.message || "Delete failed"),
  });

  const confirmDelete = (docId: string, filename: string) => {
    if (window.confirm(`Delete "${filename}"?`)) deleteMutation.mutate(docId);
  };
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">Knowledge Library</h1><p className="text-muted-foreground">Upload and manage documents</p></div>
          <div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.txt,.md" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload Document"}</Button>
          </div>
        </div>
        <Card><CardTitle className="mb-4">Documents ({documents?.length ?? 0})</CardTitle>
          {isLoading ? <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : documents?.length === 0 ? <p className="py-8 text-center text-muted-foreground">No documents uploaded yet.</p>
          : <div className="space-y-2">{documents?.map(doc => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div><p className="font-medium">{doc.original_filename}</p><p className="text-xs text-muted-foreground">{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "—"} · {doc.chunk_count} chunks · <span className={doc.status === "indexed" ? "text-green-600" : doc.status === "failed" ? "text-red-600" : "text-yellow-600"}>{doc.status}</span></p></div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => confirmDelete(doc.id, doc.original_filename)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          ))}</div>}
        </Card>
      </div>
    </AppShell>
  );
}
