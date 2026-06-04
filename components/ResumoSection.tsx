"use client";

interface ResumoSectionProps {
  value: string;
  onChange: (value: string) => void;
  palavrasChave: string[];
  onPalavrasChaveChange: (palavras: string[]) => void;
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

export function ResumoSection({
  value,
  onChange,
  palavrasChave,
  onPalavrasChaveChange,
}: ResumoSectionProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const warnColor = wordCount > 0 && (wordCount < 150 || wordCount > 500)
    ? "#ef4444" : "#10b981";

  const palavrasChaveText =
    palavrasChave.join(". ") + (palavrasChave.length > 0 ? "." : "");

  const handlePalavrasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value
      .split(".")
      .map(p => p.trim())
      .filter(p => p !== "");
    onPalavrasChaveChange(cleaned);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <p style={{ color: "#334155", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
          Resumo (pt-BR)
        </p>
        {wordCount > 0 && (
          <span style={{ fontSize: "10px", color: warnColor }}>
            {wordCount} pal.{" "}
            {wordCount < 150 ? "↓ mín. 150" : wordCount > 500 ? "↑ máx. 500" : "✓"}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder="Parágrafo único, sem recuo, espaço simples. Objetivo, metodologia, resultados e conclusões. Entre 150 e 500 palavras."
        style={{
          ...inputStyle,
          resize: "vertical",
          lineHeight: "1.5",
          marginBottom: "8px",
        }}
        onFocus={e => (e.target.style.borderColor = "#3b82f6")}
        onBlur={e => (e.target.style.borderColor = "#1e2330")}
      />

      {/* Palavras-chave */}
      <label style={labelStyle}>
        Palavras-chave (separar por ponto)
      </label>
      <input
        type="text"
        value={palavrasChaveText}
        onChange={handlePalavrasChange}
        placeholder="Exemplo: Tecnologia. Educação. Sistemas."
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = "#3b82f6")}
        onBlur={e => (e.target.style.borderColor = "#1e2330")}
      />
      <p style={{ color: "#334155", fontSize: "9px", marginTop: "3px" }}>
        Mín. 3, máx. 5 palavras-chave. Separar por ponto. Ex: "Palavra 1. Palavra 2. Palavra 3."
      </p>
    </div>
  );
}