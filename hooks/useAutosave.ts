"use client";

import { useEffect, useRef, useCallback } from "react";
import { saveAllDocuments } from "@/lib/document";
import type { EditeccDocument } from "@/lib/document";

const AUTOSAVE_INTERVAL = 20000;

export function useAutosave(
  docs: EditeccDocument[],
  currentId: string | null,
  onError?: (msg: string) => void,
) {
  const savedRef = useRef(false);

  const save = useCallback(() => {
    try {
      saveAllDocuments(docs);
      savedRef.current = true;
    } catch (err: unknown) {
      const msg = err instanceof DOMException && err.name === "QuotaExceededError"
        ? "Espaço de armazenamento esgotado. Exporte e limpe documentos antigos."
        : `Erro ao salvar: ${err instanceof Error ? err.message : "desconhecido"}`;
      onError?.(msg);
    }
  }, [docs, onError]);

  // Auto-save em intervalo
  useEffect(() => {
    if (!currentId) return;
    const timer = setInterval(save, AUTOSAVE_INTERVAL);
    return () => clearInterval(timer);
  }, [save, currentId]);

  // Salva ao desmontar
  useEffect(() => {
    return () => {
      if (savedRef.current) return;
      try {
        saveAllDocuments(docs);
      } catch { /* silent */ }
    };
  }, [docs]);

  return { save };
}
