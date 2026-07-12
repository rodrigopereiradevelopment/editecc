"use client";

import { useMemo, useState } from "react";
import { extractTopTerms } from "@/lib/tfidf";

export interface GlossarioEntry {
  id: string;
  termo: string;
  definicao: string;
}

interface GlossarioManagerProps {
  entries: GlossarioEntry[];
  onChange: (entries: GlossarioEntry[]) => void;
  editorHtml?: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f1117", border: "1px solid #1e2330",
  color: "#cbd5e1", padding: "5px 8px", borderRadius: "4px",
  fontSize: "11px", outline: "none", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

function genId() { return Math.random().toString(36).slice(2, 8); }

export function GlossarioManager({ entries, onChange, editorHtml }: GlossarioManagerProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = useMemo(() => {
    if (!editorHtml) return [];
    const terms = extractTopTerms(editorHtml, 15);
    const existing = new Set(entries.map(e => e.termo.toLowerCase()));
    return terms.filter(t => !existing.has(t.toLowerCase()));
  }, [editorHtml, entries]);

  const sorted = [...entries].sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));

  const addEntry = () => {
    onChange([...entries, { id: genId(), termo: "", definicao: "" }]);
  };

  const addSuggestion = (term: string) => {
    onChange([...entries, { id: genId(), termo: term, definicao: "" }]);
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof GlossarioEntry, value: string) => {
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <p style={{ color: "#334155", fontSize: "10px", textTransform: "uppercase", fontWeight: "600" }}>
          Glossário
        </p>
        <button onClick={addEntry} style={{
          padding: "4px 8px", background: "#2563eb", color: "white",
          border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px", fontWeight: "500",
        }}>+ Termo</button>
      </div>

      {suggestions.length > 0 && showSuggestions && (
        <div style={{
          background: "#0a0c11", border: "1px solid #1e2330",
          borderRadius: "5px", padding: "8px", marginBottom: "8px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "500" }}>
              Termos detectados no texto
            </p>
            <button onClick={() => setShowSuggestions(false)} style={{
              background: "none", border: "none", color: "#475569",
              cursor: "pointer", fontSize: "12px", padding: "0",
            }}>×</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {suggestions.map(term => (
              <button key={term} onClick={() => addSuggestion(term)} style={{
                padding: "3px 8px", background: "#161820", border: "1px solid #1e2330",
                color: "#94a3b8", borderRadius: "4px", cursor: "pointer",
                fontSize: "10px", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#cbd5e1"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2330"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                + {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && !showSuggestions && (
        <button onClick={() => setShowSuggestions(true)} style={{
          width: "100%", padding: "6px", background: "#0a0c11", border: "1px dashed #1e2330",
          color: "#475569", borderRadius: "4px", cursor: "pointer",
          fontSize: "10px", marginBottom: "8px",
        }}>
          Ver {suggestions.length} termo{suggestions.length > 1 ? "s" : ""} detectado{suggestions.length > 1 ? "s" : ""}...
        </button>
      )}

      {entries.length === 0 && suggestions.length === 0 && (
        <p style={{ fontSize: "10px", color: "#475569", fontStyle: "italic" }}>
          Nenhum termo adicionado. Escreva no editor para ver sugestões.
        </p>
      )}

      {sorted.map(entry => (
        <div key={entry.id} style={{
          background: "#0a0c11", border: "1px solid #1e2330",
          borderRadius: "5px", padding: "8px", marginBottom: "6px",
        }}>
          <div style={{ display: "flex", gap: "4px", marginBottom: "4px", alignItems: "center" }}>
            <span style={{
              fontSize: "10px", fontWeight: "700", color: "#10b981",
              padding: "2px 6px", background: "#161820", borderRadius: "3px",
            }}>
              {entry.termo || "(termo)"}
            </span>
            <button onClick={() => removeEntry(entry.id)} style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#ef4444", cursor: "pointer", fontSize: "14px",
            }}>×</button>
          </div>
          <input
            value={entry.termo}
            onChange={e => updateEntry(entry.id, "termo", e.target.value)}
            placeholder="Termo"
            style={{ ...inputStyle, marginBottom: "4px" }}
          />
          <textarea
            value={entry.definicao}
            onChange={e => updateEntry(entry.id, "definicao", e.target.value)}
            rows={3}
            placeholder="Definição..."
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
          />
        </div>
      ))}
    </div>
  );
}
