"use client";

import { useState, useCallback, useRef } from "react";

export const NLLB_LANGUAGES = {
  en: { label: "English", code: "eng_Latn" },
  es: { label: "Español", code: "spa_Latn" },
  fr: { label: "Français", code: "fra_Latn" },
  de: { label: "Deutsch", code: "deu_Latn" },
  it: { label: "Italiano", code: "ita_Latn" },
  pt: { label: "Português", code: "por_Latn" },
} as const;

export type TargetLang = "en" | "es" | "fr" | "de" | "it" | "pt";

type TranslateFn = (text: string, targetLang?: TargetLang) => Promise<string>;

const MODEL_KEY = "editecc-model-nllb";

// Timeout por inferência: 60s por chamada. Se worker morreu, não vai responder.
const INFERENCE_TIMEOUT_MS = 60_000;

async function clearModelCache() {
  localStorage.removeItem(MODEL_KEY);
  try {
    const cache = await caches.open("transformers-cache");
    const keys = await cache.keys();
    await Promise.all(
      keys.filter(k => k.url.includes("nllb")).map(k => cache.delete(k))
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

export function useTranslation() {
  const pipeRef = useRef<TranslateFn | null>(null);
  const pipelineRef = useRef<any>(null); // referência raw do pipeline pra dispose
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
    pipelineRef.current = null;
    inferenceCount.current = 0;
    setModelStatus("idle");
  }, []);

  const loadModel = useCallback(async () => {
    loadCount.current++;
    const n = loadCount.current;
    if (pipeRef.current) {
      console.log(`[useTranslation] loadModel #${n}: modelo JÁ CARREGADO, retornando cedo${getMemoryMB()}`);
      setModelStatus("ready");
      return;
    }
    console.log(`[useTranslation] loadModel #${n}: CARREGANDO MODELO DO ZERO${getMemoryMB()}`);
    setLoading(true);
    setProgress(0);
    setModelStatus("downloading");
    setError("");
    inferenceCount.current = 0;
    try {
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.useFS = false;
      env.useBrowserCache = false;
      env.useFSCache = false;
      // Forçar proxy via Web Worker pra não travar a UI
      (env.backends as any).onnx.wasm.proxy = true;
      const p = await pipeline("translation", "Xenova/nllb-200-distilled-600M", {
        quantized: true,
        progress_callback: (pr: any) => {
          if (pr?.status === "progress" && typeof pr?.progress === "number") {
            const p = pr.progress > 1 ? pr.progress : Math.round(pr.progress * 100);
            setProgress(Math.min(p, 100));
          }
        },
      });
      pipelineRef.current = p;
      pipeRef.current = async (text: string, targetLang: TargetLang = "en") => {
        const tgt = NLLB_LANGUAGES[targetLang].code;
        const result = await p(text, {
          src_lang: "por_Latn",
          tgt_lang: tgt,
        } as any);
        return (result as any)[0]?.translation_text || "";
      };
      setModelStatus("ready");
      localStorage.setItem(MODEL_KEY, "ready");
      console.log(`[useTranslation] Modelo NLLB carregado com sucesso${getMemoryMB()}`);
    } catch (err: any) {
      await clearModelCache();
      setModelStatus("error");
      const msg = err?.message || err?.toString() || "Falha ao carregar modelo";
      console.error("[useTranslation] Erro ao carregar modelo:", err);
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

  const translateChunk = useCallback(
    async (text: string, targetLang?: TargetLang): Promise<string> => {
      if (!pipeRef.current) throw new Error("Modelo não carregado");
      inferenceCount.current++;
      const n = inferenceCount.current;
      const start = performance.now();
      console.log(`[useTranslation] Inferência #${n} (${text.length} chars)${getMemoryMB()}`);
      try {
        const result = await withTimeout(
          pipeRef.current(text, targetLang),
          INFERENCE_TIMEOUT_MS,
          `tradução #${n}`
        );
        const elapsed = Math.round(performance.now() - start);
        console.log(`[useTranslation] Inferência #${n} OK em ${elapsed}ms${getMemoryMB()}`);
        return result;
      } catch (err: any) {
        const elapsed = Math.round(performance.now() - start);
        console.error(`[useTranslation] Inferência #${n} FALHOU em ${elapsed}ms:`, err?.message);
        throw err;
      }
    },
    []
  );

  const translate = useCallback(
    async (text: string, targetLang?: TargetLang): Promise<string> => {
      if (!pipeRef.current) {
        await loadModel();
      }
      if (!pipeRef.current) throw new Error("Modelo não carregado");

      const MAX_CHARS = 400;
      if (text.length <= MAX_CHARS) {
        return translateChunk(text, targetLang);
      }

      // Tenta splitar por frases primeiro
      let sentences = text.match(/[^.!?]+[.!?]+\s*/g);
      // Se regex não encontrou frases (sem pontuação), fallback por espaço
      if (!sentences || sentences.length === 1) {
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

      console.log(`[useTranslation] Texto longo (${text.length} chars) → ${chunks.length} chunks`);
      const results: string[] = [];
      for (const chunk of chunks) {
        results.push(await translateChunk(chunk, targetLang));
      }
      return results.join(" ");
    },
    [loadModel, translateChunk]
  );

  return {
    translate,
    loadModel,
    resetModel,
    loading,
    progress,
    modelStatus,
    error,
  };
}
