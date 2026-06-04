// hooks/useAutosave.ts
import { useEffect, useCallback, useRef } from "react";
import { openDB } from "idb";

const DB_NAME    = "editecc";
const DB_VERSION = 1;
const STORE      = "documents";

export interface DocumentData {
  id:        string;
  html:      string;
  cover:     Record<string, string>;
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
// Suporta dois formatos de chamada:
// 1. Formato legado:  { documentId, getHtml, getCover, intervalMs?, onSave? }
// 2. Formato novo:    { key, data, enabled?, interval?, onSave? }

interface UseAutosaveLegacy {
  documentId: string;
  getHtml:    () => string;
  getCover:   () => Record<string, string>;
  intervalMs?: number;
  onSave?:    () => void;
}

interface UseAutosaveNew {
  key:      string;
  data:     Record<string, unknown>;
  enabled?: boolean;
  interval?: number;
  onSave?:  () => void;
  // campos legado opcionais (ignorados nesse modo)
  documentId?: never;
  getHtml?:    never;
  getCover?:   never;
}

type UseAutosaveOptions = UseAutosaveLegacy | UseAutosaveNew;

function isNewFormat(opts: UseAutosaveOptions): opts is UseAutosaveNew {
  return "key" in opts && opts.key !== undefined;
}

export function useAutosave(opts: UseAutosaveOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const intervalMs = isNewFormat(opts)
    ? (opts.interval ?? 20000)
    : (opts.intervalMs ?? 15000);

  const enabled = isNewFormat(opts) ? (opts.enabled ?? true) : true;

  const save = useCallback(async () => {
    if (!enabled) return;
    try {
      if (isNewFormat(opts)) {
        // Modo novo: salva no localStorage (compatível com o que o page.tsx carrega)
        localStorage.setItem(opts.key, JSON.stringify(opts.data));
      } else {
        // Modo legado: salva no IndexedDB
        await saveDocument({
          id:        opts.documentId,
          html:      opts.getHtml(),
          cover:     opts.getCover(),
          updatedAt: new Date().toISOString(),
        });
      }
      opts.onSave?.();
    } catch (err) {
      console.error("[EditeCC] Autosave falhou:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs]);

  useEffect(() => {
    if (!enabled) return;
    timerRef.current = setInterval(save, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [save, intervalMs, enabled]);

  // Salva ao fechar a aba
  useEffect(() => {
    if (!enabled) return;
    const handler = () => { save(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [save, enabled]);

  return { save };
}
