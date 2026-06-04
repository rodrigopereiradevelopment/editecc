"use client";

interface AbstractSectionProps {
  value: string;
  onChange: (value: string) => void;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  language?: "en" | "es";
}

const LABELS = {
  en: { title: "Abstract (en)", kw: "Keywords" },
  es: { title: "Resumen (es)", kw: "Palabras clave" },
};

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
}: AbstractSectionProps) {
  const labels = LABELS[language];
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

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <p style={{ color: "#334155", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
          {labels.title}
        </p>
        {wordCount > 0 && (
          <span style={{ fontSize: "10px", color: warnColor }}>
            {wordCount} words{" "}
            {wordCount < 150 ? "↓ min 150" : wordCount > 500 ? "↑ max 500" : "✓"}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder="Translation of the resumo. Single paragraph, no indentation, single spacing."
        style={{
          ...inputStyle,
          resize: "vertical",
          lineHeight: "1.5",
          marginBottom: "8px",
        }}
        onFocus={e => (e.target.style.borderColor = "#3b82f6")}
        onBlur={e => (e.target.style.borderColor = "#1e2330")}
      />

      {/* Keywords */}
      <label style={labelStyle}>
        {labels.kw} (separated by period)
      </label>
      <input
        type="text"
        value={keywordsText}
        onChange={handleKeywordsChange}
        placeholder="Example: Technology. Education. Systems."
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = "#3b82f6")}
        onBlur={e => (e.target.style.borderColor = "#1e2330")}
      />
      <p style={{ color: "#334155", fontSize: "9px", marginTop: "3px" }}>
        Min. 3, max. 5 keywords. Separate by period.
      </p>
    </div>
  );
}