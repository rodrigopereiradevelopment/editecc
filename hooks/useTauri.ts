// hooks/useTauri.ts
// Abstrai as chamadas ao backend Rust do Tauri.
// Em desenvolvimento web (sem Tauri), usa fallbacks no browser.

import { useCallback } from "react";

// Detecta se está rodando dentro do Tauri
const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

interface DocumentData {
  id: string;
  html: string;
  cover: Record<string, string>;
  title: string;
  updatedAt: string;
}

interface SaveResult {
  success: boolean;
  path?: string;
  error?: string;
}

export function useTauri() {
  // ─── SALVAR COMO ────────────────────────────────────────────────────────────
  const saveAs = useCallback(async (data: DocumentData): Promise<SaveResult> => {
    if (!isTauri()) {
      // Fallback web: baixa como arquivo JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title || "meu-tcc"}.editecc`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true, path: "download" };
    }

    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<SaveResult>("save_document_as", { data });
  }, []);

  // ─── SALVAR SILENCIOSO ──────────────────────────────────────────────────────
  const saveSilent = useCallback(
    async (path: string, data: DocumentData): Promise<SaveResult> => {
      if (!isTauri()) {
        // Fallback web: localStorage
        localStorage.setItem("editecc_html", data.html);
        localStorage.setItem("editecc_cover", JSON.stringify(data.cover));
        return { success: true };
      }

      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<SaveResult>("save_document_silent", { path, data });
    },
    []
  );

  // ─── ABRIR ──────────────────────────────────────────────────────────────────
  const openDocument = useCallback(async (): Promise<DocumentData | null> => {
    if (!isTauri()) {
      // Fallback web: input file
      return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".editecc,.json";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return resolve(null);
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              resolve(JSON.parse(ev.target?.result as string));
            } catch {
              resolve(null);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }

    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<DocumentData | null>("open_document");
  }, []);

  // ─── EXPORTAR HTML ──────────────────────────────────────────────────────────
  const exportHtml = useCallback(
    async (html: string, title: string): Promise<SaveResult> => {
      if (!isTauri()) {
        // Fallback web: download direto
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title || "meu-tcc"}.html`;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };
      }

      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<SaveResult>("export_html", { html, title });
    },
    []
  );

  // ─── EXPORTAR PDF (via impressão nativa) ────────────────────────────────────
  const exportPdf = useCallback(async () => {
    window.print();
  }, []);

  return {
    isTauri: isTauri(),
    saveAs,
    saveSilent,
    openDocument,
    exportHtml,
    exportPdf,
  };
}
