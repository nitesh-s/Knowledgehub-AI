export interface User { id: string; email: string; username: string; full_name: string | null; role: "admin" | "manager" | "employee"; department_id: string | null; is_active: boolean; created_at: string; }
export interface Conversation { id: string; title: string | null; model: string; created_at: string; updated_at: string; }
export interface Message { id: string; role: "user" | "assistant"; content: string; sources: string | null; created_at: string; }
export interface Document { id: string; filename: string; original_filename: string; file_size: number | null; mime_type: string | null; status: "pending" | "processing" | "indexed" | "failed"; department_id: string | null; chunk_count: number; created_at: string; }
