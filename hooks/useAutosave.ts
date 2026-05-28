// hooks/useAutosave.ts
import { useEffect, useCallback, useRef } from "react";
import { openDB } from "idb";

const DB_NAME = "editecc";
const DB_VERSION = 1;
const STORE = "documents";

export interface DocumentData {
  id: string;
  html: string;
  cover: Record<string, string>;
  updatedAt: string;
}

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export async function saveDocument(data: DocumentData) {
  const db = await getDB();
  await db.put(STORE, { ...data, updatedAt: new Date().toISOString() });
}

export async function loadDocument(id: string): Promise<DocumentData | undefined> {
  const db = await getDB();
  return db.get(STORE, id);
}

export async function listDocuments(): Promise<DocumentData[]> {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function deleteDocument(id: string) {
  const db = await getDB();
  return db.delete(STORE, id);
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseAutosaveOptions {
  documentId: string;
  getHtml: () => string;
  getCover: () => Record<string, string>;
  intervalMs?: number;
  onSave?: () => void;
}

export function useAutosave({
  documentId,
  getHtml,
  getCover,
  intervalMs = 15000,
  onSave,
}: UseAutosaveOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const save = useCallback(async () => {
    try {
      await saveDocument({
        id: documentId,
        html: getHtml(),
        cover: getCover(),
        updatedAt: new Date().toISOString(),
      });
      onSave?.();
    } catch (err) {
      console.error("[EditeCC] Autosave falhou:", err);
    }
  }, [documentId, getHtml, getCover, onSave]);

  // Autosave por intervalo
  useEffect(() => {
    timerRef.current = setInterval(save, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [save, intervalMs]);

  // Salva ao fechar a aba
  useEffect(() => {
    const handler = () => {
      saveDocument({
        id: documentId,
        html: getHtml(),
        cover: getCover(),
        updatedAt: new Date().toISOString(),
      });
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [documentId, getHtml, getCover]);

  return { save };
}
