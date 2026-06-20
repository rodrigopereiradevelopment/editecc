"use client";

import { useState, useCallback, useRef } from "react";

type TranslateFn = (text: string) => Promise<string>;

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
      pipeRef.current = async (text: string) => {
        const result = await p(text, {
          src_lang: "por_Latn",
          tgt_lang: "eng_Latn",
        });
        return result[0]?.translation_text || "";
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
    async (text: string): Promise<string> => {
      if (!pipeRef.current) {
        await loadModel();
      }
      if (!pipeRef.current) throw new Error("Modelo não carregado");
      return pipeRef.current(text);
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
