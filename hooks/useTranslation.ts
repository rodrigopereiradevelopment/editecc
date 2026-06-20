"use client";

import { useState, useCallback, useRef } from "react";

export const NLLB_LANGUAGES = {
  en: { label: "English", code: "eng_Latn" },
  es: { label: "Español", code: "spa_Latn" },
  fr: { label: "Français", code: "fra_Latn" },
  de: { label: "Deutsch", code: "deu_Latn" },
  it: { label: "Italiano", code: "ita_Latn" },
} as const;

export type TargetLang = "en" | "es" | "fr" | "de" | "it";

type TranslateFn = (text: string, targetLang?: TargetLang) => Promise<string>;

export function useTranslation() {
  const pipeRef = useRef<TranslateFn | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelStatus, setModelStatus] = useState<
    "idle" | "downloading" | "ready" | "error"
  >("idle");
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
      const { pipeline, env } = await import("@xenova/transformers");
      env.allowRemoteModels = true;
      const p = await pipeline("translation", "Xenova/nllb-200-distilled-600M", {
        quantized: true,
        progress_callback: (p: any) => {
          if (p.status === "progress" && typeof p.progress === "number") {
            setProgress(Math.round(p.progress * 100));
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
    } catch (err: any) {
      setModelStatus("error");
      setError(err?.message || "Falha ao carregar modelo");
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
