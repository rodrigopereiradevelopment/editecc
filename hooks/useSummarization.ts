"use client";

import { useState, useCallback, useRef } from "react";

const MODEL_KEY = "editecc-model-summarization";

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

export function useSummarization() {
  const pipeRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelStatus, setModelStatus] = useState<"idle" | "downloading" | "ready" | "error">(
    () => (typeof window !== "undefined" && localStorage.getItem(MODEL_KEY) === "ready") ? "ready" : "idle"
  );
  const [error, setError] = useState("");

  const loadModel = useCallback(async () => {
    if (pipeRef.current) {
      setModelStatus("ready");
      return;
    }
    setLoading(true);
    setProgress(0);
    setModelStatus("downloading");
    setError("");
    try {
      await clearModelCache();
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowRemoteModels = true;
      env.useBrowserCache = false;
      env.useFSCache = false;
      try { (env.backends as any).onnx.wasm.proxy = true; } catch {}
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
    } catch (err: any) {
      await clearModelCache();
      setModelStatus("error");
      const msg = err?.message || err?.toString() || "Falha ao carregar modelo de sumarização";
      setError(msg.includes("Object.keys") ? "Cache corrompido. Limpo e pronto para tentar novamente." : msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const summarize = useCallback(
    async (text: string): Promise<string> => {
      if (!pipeRef.current) {
        await loadModel();
      }
      if (!pipeRef.current) throw new Error("Modelo não carregado");

      const result = await pipeRef.current(text, {
        max_length: 150,
        min_length: 30,
      });
      return (result as any)[0]?.summary_text || text.slice(0, 300);
    },
    [loadModel]
  );

  return {
    summarize,
    loadModel,
    loading,
    progress,
    modelStatus,
    error,
  };
}
