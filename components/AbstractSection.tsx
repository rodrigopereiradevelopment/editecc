"use client";

import { useState } from "react";
import { useTranslation, NLLB_LANGUAGES, TargetLang } from "@/hooks/useTranslation";

interface AbstractSectionProps {
  value: string;
  onChange: (value: string) => void;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  language?: TargetLang;
  onLanguageChange?: (lang: TargetLang) => void;
  resumo?: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f1117",
  border: "1px solid #1e2330",
  color: "#cbd5e1",
  padding: "6px 10px",
  borderRadius: "5px",
  fontSize: "12px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

const labelStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "4px",
};

export function AbstractSection({
  value,
  onChange,
  keywords,
  onKeywordsChange,
  language = "en",
  onLanguageChange,
  resumo,
}: AbstractSectionProps) {
  const LABELS = {
    en: { title: "Abstract (en)", kw: "Keywords" },
    es: { title: "Resumen (es)", kw: "Palabras clave" },
    fr: { title: "Résumé (fr)", kw: "Mots-clés" },
    de: { title: "Abstract (de)", kw: "Schlüsselwörter" },
    it: { title: "Abstract (it)", kw: "Parole chiave" },
  };
  const labels = LABELS[language];

  const WC_LABEL: Record<string, string> = {
    en: "words", es: "palabras", fr: "mots", de: "Wörter", it: "parole",
  };
  const PLACEHOLDERS: Record<string, { text: string; kw: string }> = {
    en: { text: "Translation of the resumo. Single paragraph, no indentation, single spacing.", kw: "Example: Technology. Education. Systems." },
    es: { text: "Traducción del resumen. Párrafo único, sin sangría, espacio simple.", kw: "Ejemplo: Tecnología. Educación. Sistemas." },
    fr: { text: "Traduction du résumé. Paragraphe unique, sans retrait, interligne simple.", kw: "Exemple : Technologie. Éducation. Systèmes." },
    de: { text: "Übersetzung der Zusammenfassung. Einzelner Absatz, ohne Einzug, einfacher Zeilenabstand.", kw: "Beispiel: Technologie. Bildung. Systeme." },
    it: { text: "Traduzione del riassunto. Paragrafo unico, senza rientro, interlinea singola.", kw: "Esempio: Tecnologia. Educazione. Sistemi." },
  };
  const ph = PLACEHOLDERS[language] || PLACEHOLDERS.en;

  const HINTS: Record<string, string> = {
    en: "Min. 3, max. 5 keywords. Separate by period.",
    es: "Mín. 3, máx. 5 palabras clave. Separar por punto.",
    fr: "Min. 3, max. 5 mots-clés. Séparer par un point.",
    de: "Mind. 3, max. 5 Schlüsselwörter. Durch Punkt trennen.",
    it: "Min. 3, max. 5 parole chiave. Separare con un punto.",
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const warnColor = wordCount > 0 && (wordCount < 150 || wordCount > 500)
    ? "#ef4444" : "#10b981";

  const keywordsText =
    keywords.join(". ") + (keywords.length > 0 ? "." : "");

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value
      .split(".")
      .map(p => p.trim())
      .filter(p => p !== "");
    onKeywordsChange(cleaned);
  };

  const { translate, modelStatus, loading, progress, error, loadModel } = useTranslation();
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");

  const handleTranslate = async () => {
    if (!resumo?.trim()) return;
    setTranslating(true);
    setTranslateError("");
    try {
      const result = await translate(resumo, language);
      onChange(result);
    } catch (err: any) {
      setTranslateError(err?.message || "Erro na tradução");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{ color: "#334155", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
            {labels.title}
          </p>
          <select
            value={language}
            onChange={e => onLanguageChange?.(e.target.value as TargetLang)}
            style={{
              background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
              borderRadius: "4px", padding: "2px 6px", fontSize: "10px",
              outline: "none", cursor: "pointer",
            }}
          >
            {Object.entries(NLLB_LANGUAGES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {wordCount > 0 && (
            <span style={{ fontSize: "10px", color: warnColor }}>
              {wordCount} {WC_LABEL[language]}{" "}
              {wordCount < 150 ? "↓ min 150" : wordCount > 500 ? "↑ max 500" : "✓"}
            </span>
          )}
          {resumo && (
            <button
              onClick={modelStatus === "ready" ? handleTranslate : loadModel}
              disabled={loading || translating}
              title={modelStatus === "idle" ? "Baixar modelo de tradução (~600MB)" : "Traduzir do resumo"}
              style={{
                background: modelStatus === "ready" ? "#10b981" : modelStatus === "downloading" ? "#f59e0b" : "#2563eb",
                color: "white", border: "none", borderRadius: "4px",
                padding: "3px 8px", cursor: loading || translating ? "wait" : "pointer",
                fontSize: "9px", fontWeight: "500", whiteSpace: "nowrap",
              }}
            >
              {translating ? "Traduzindo..." :
               loading ? `${progress}%` :
               modelStatus === "ready" ? "Auto" :
               modelStatus === "error" ? "Retentar" :
               "Baixar modelo"}
            </button>
          )}
        </div>
      </div>

      {loading && modelStatus === "downloading" && (
        <div style={{
          width: "100%", height: "4px", background: "#1e2330",
          borderRadius: "2px", marginBottom: "8px", overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`, height: "100%", background: "#3b82f6",
            transition: "width 0.3s",
          }} />
        </div>
      )}
      {loading && (
        <p style={{ fontSize: "9px", color: "#f59e0b", marginBottom: "6px" }}>
          Baixando modelo de tradução... {progress}% (apenas uma vez)
        </p>
      )}
      {error && <p style={{ fontSize: "9px", color: "#ef4444", marginBottom: "6px" }}>{error}</p>}
      {translateError && <p style={{ fontSize: "9px", color: "#ef4444", marginBottom: "6px" }}>{translateError}</p>}

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder={ph.text}
        style={{
          ...inputStyle,
          resize: "vertical",
          lineHeight: "1.5",
          marginBottom: "8px",
        }}
        onFocus={e => (e.target.style.borderColor = "#3b82f6")}
        onBlur={e => (e.target.style.borderColor = "#1e2330")}
      />

      <label style={labelStyle}>
        {labels.kw} {language === "en" ? "(separated by period)" : "(separadas por punto)"}
      </label>
      <input
        type="text"
        value={keywordsText}
        onChange={handleKeywordsChange}
        placeholder={ph.kw}
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = "#3b82f6")}
        onBlur={e => (e.target.style.borderColor = "#1e2330")}
      />
      <p style={{ color: "#334155", fontSize: "9px", marginTop: "3px" }}>
        {HINTS[language] || HINTS.en}
      </p>
    </div>
  );
}
