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

export function useTranslation() {
  const pipeRef = useRef<TranslateFn | null>(null);
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
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.useFS = false;
      env.useBrowserCache = false;
      env.useFSCache = false;
      try { (env.backends as any).onnx.wasm.proxy = true; } catch {}
      const p = await pipeline("translation", "Xenova/nllb-200-distilled-600M", {
        quantized: true,
        progress_callback: (pr: any) => {
          if (pr?.status === "progress" && typeof pr?.progress === "number") {
            const p = pr.progress > 1 ? pr.progress : Math.round(pr.progress * 100);
            setProgress(Math.min(p, 100));
          }
        },
      });
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
    } catch (err: any) {
      await clearModelCache();
      setModelStatus("error");
      const msg = err?.message || err?.toString() || "Falha ao carregar modelo";
      console.error("[useTranslation] Erro ao carregar modelo:", err);
      setError(msg.includes("Object.keys") ? `Cache corrompido. Limpo e pronto para tentar novamente. Detalhes: ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const translate = useCallback(
    async (text: string, targetLang?: TargetLang): Promise<string> => {
      if (!pipeRef.current) {
        await loadModel();
      }
      if (!pipeRef.current) throw new Error("Modelo não carregado");
      return pipeRef.current(text, targetLang);
    },
    [loadModel]
  );

  return {
    translate,
    loadModel,
    loading,
    progress,
    modelStatus,
    error,
  };
}
