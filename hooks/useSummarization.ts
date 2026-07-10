"use client";

import { useState, useCallback, useRef } from "react";

/**
 * @deprecated Usado apenas para sumarização com IA (distilbart-cnn-6-6).
 * Para slides, use `lib/tfidf.ts` (extractiveSummarize) — mais rápido, sem crash.
 * Este hook será removido em v1.0.
 */
const MODEL_KEY = "editecc-model-summarization";

// Timeout por inferência: 60s por chamada
const INFERENCE_TIMEOUT_MS = 60_000;

async function clearModelCache() {
  localStorage.removeItem(MODEL_KEY);
  try {
    const cache = await caches.open("transformers-cache");
    const keys = await cache.keys();
    await Promise.all(
      keys.filter(k => k.url.includes("distilbart")).map(k => cache.delete(k))
    );
  } catch {}
}

function getMemoryMB(): string {
  try {
    const m = (performance as any).memory;
    if (m) return ` | ${Math.round(m.usedJSHeapSize / 1e6)}MB heap`;
  } catch {}
  return "";
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${label} não respondeu em ${ms / 1000}s — worker pode ter morrido.`));
    }, ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

export function useSummarization() {
  const pipeRef = useRef<any>(null);
  const inferenceCount = useRef(0);
  const loadCount = useRef(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelStatus, setModelStatus] = useState<"idle" | "downloading" | "ready" | "error">(
    () => (typeof window !== "undefined" && localStorage.getItem(MODEL_KEY) === "ready") ? "ready" : "idle"
  );
  const [error, setError] = useState("");

  const resetModel = useCallback(() => {
    pipeRef.current = null;
    inferenceCount.current = 0;
    setModelStatus("idle");
  }, []);

  const loadModel = useCallback(async () => {
    loadCount.current++;
    const n = loadCount.current;
    if (pipeRef.current) {
      console.log(`[useSummarization] loadModel #${n}: modelo JÁ CARREGADO, retornando cedo${getMemoryMB()}`);
      setModelStatus("ready");
      return;
    }
    console.log(`[useSummarization] loadModel #${n}: CARREGANDO MODELO DO ZERO${getMemoryMB()}`);
    setLoading(true);
    setProgress(0);
    setModelStatus("downloading");
    setError("");
    inferenceCount.current = 0;
    try {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowRemoteModels = true;
      env.useBrowserCache = false;
      env.useFSCache = false;
      // Forçar proxy via Web Worker pra não travar a UI
      (env.backends as any).onnx.wasm.proxy = true;
      const p = await pipeline("summarization", "Xenova/distilbart-cnn-6-6", {
        quantized: true,
        progress_callback: (p: any) => {
          if (p.status === "progress" && typeof p.progress === "number") {
            const val = p.progress > 1 ? p.progress : Math.round(p.progress * 100);
            setProgress(Math.min(val, 100));
          }
        },
      });
      pipeRef.current = p;
      setModelStatus("ready");
      localStorage.setItem(MODEL_KEY, "ready");
      console.log(`[useSummarization] Modelo distilbart carregado com sucesso${getMemoryMB()}`);
    } catch (err: any) {
      await clearModelCache();
      setModelStatus("error");
      const msg = err?.message || err?.toString() || "Falha ao carregar modelo de sumarização";
      console.error("[useSummarization] Erro ao carregar modelo:", err);
      if (msg.includes("Object.keys")) {
        setError("Cache corrompido. Limpo e pronto para tentar novamente.");
      } else if (msg.includes("SIGILL") || msg.includes("illegal instruction")) {
        setError("CPU incompatível com WASM. Tente em outro navegador ou dispositivo.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const summarizeChunk = useCallback(
    async (text: string): Promise<string> => {
      if (!pipeRef.current) throw new Error("Modelo não carregado");

      inferenceCount.current++;
      const n = inferenceCount.current;
      const start = performance.now();
      console.log(`[useSummarization] Inferência #${n} (${text.length} chars)${getMemoryMB()}`);
      try {
        const result = await withTimeout(
          pipeRef.current(text, {
            max_length: 150,
            min_length: 30,
          }),
          INFERENCE_TIMEOUT_MS,
          `sumarização #${n}`
        );
        const elapsed = Math.round(performance.now() - start);
        console.log(`[useSummarization] Inferência #${n} OK em ${elapsed}ms${getMemoryMB()}`);
        return (result as any)[0]?.summary_text || text.slice(0, 300);
      } catch (err: any) {
        const elapsed = Math.round(performance.now() - start);
        console.error(`[useSummarization] Inferência #${n} FALHOU em ${elapsed}ms:`, err?.message);
        throw err;
      }
    },
    []
  );

  const summarize = useCallback(
    async (text: string): Promise<string> => {
      if (!pipeRef.current) {
        await loadModel();
      }
      if (!pipeRef.current) throw new Error("Modelo não carregado");

      const MAX_CHARS = 400;
      if (text.length <= MAX_CHARS) {
        return summarizeChunk(text);
      }

      // Tenta splitar por frases primeiro
      const rawSentences = text.match(/[^.!?]+[.!?]+\s*/g);
      // Se regex não encontrou frases (sem pontuação), fallback por espaço
      let sentences: string[];
      if (!rawSentences || rawSentences.length === 1) {
        sentences = [];
        const words = text.split(/\s+/);
        let buf = "";
        for (const w of words) {
          if (buf.length + w.length + 1 > MAX_CHARS && buf.length > 0) {
            sentences.push(buf.trim() + " ");
            buf = "";
          }
          buf += w + " ";
        }
        if (buf.trim()) sentences.push(buf.trim());
      } else {
        sentences = rawSentences;
      }
      const chunks: string[] = [];
      let current = "";
      for (const s of sentences) {
        if (current.length + s.length > MAX_CHARS && current.length > 0) {
          chunks.push(current.trim());
          current = "";
        }
        current += s;
      }
      if (current.trim()) chunks.push(current.trim());

      console.log(`[useSummarization] Texto longo (${text.length} chars) → ${chunks.length} chunks`);
      const results: string[] = [];
      for (const chunk of chunks) {
        results.push(await summarizeChunk(chunk));
      }
      const combined = results.join(" ");
      const finalResult = await summarizeChunk(combined);
      return finalResult;
    },
    [loadModel, summarizeChunk]
  );

  return {
    summarize,
    loadModel,
    resetModel,
    loading,
    progress,
    modelStatus,
    error,
  };
}
