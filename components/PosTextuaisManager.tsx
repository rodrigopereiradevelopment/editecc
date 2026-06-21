"use client";

import { useState } from "react";

export interface PosTextualItem {
  id: string;
  letra: string;
  titulo: string;
  conteudo: string;
}

interface PosTextuaisManagerProps {
  label: string;
  prefix: string; // "APÊNDICE" ou "ANEXO"
  items: PosTextualItem[];
  onChange: (items: PosTextualItem[]) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f1117", border: "1px solid #1e2330",
  color: "#cbd5e1", padding: "5px 8px", borderRadius: "4px",
  fontSize: "11px", outline: "none", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

const btnStyle: React.CSSProperties = {
  padding: "4px 8px", background: "#2563eb", color: "white",
  border: "none", borderRadius: "4px", cursor: "pointer",
  fontSize: "10px", fontWeight: "500",
};

function genId() { return Math.random().toString(36).slice(2, 8); }

export function PosTextuaisManager({ label, prefix, items, onChange }: PosTextuaisManagerProps) {
  const addItem = () => {
    const nextLetter = String.fromCharCode(65 + items.length); // A, B, C...
    onChange([...items, { id: genId(), letra: nextLetter, titulo: "", conteudo: "" }]);
  };

  const removeItem = (id: string) => {
    const next = items.filter(i => i.id !== id).map((i, idx) => ({ ...i, letra: String.fromCharCode(65 + idx) }));
    onChange(next);
  };

  const updateItem = (id: string, field: keyof PosTextualItem, value: string) => {
    onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <p style={{ color: "#334155", fontSize: "10px", textTransform: "uppercase", fontWeight: "600" }}>
          {label}
        </p>
        <button onClick={addItem} style={btnStyle}>+ {prefix}</button>
      </div>

      {items.length === 0 && (
        <p style={{ fontSize: "10px", color: "#475569", fontStyle: "italic" }}>
          Nenhum {prefix.toLowerCase()} adicionado.
        </p>
      )}

      {items.map(item => (
        <div key={item.id} style={{
          background: "#0a0c11", border: "1px solid #1e2330",
          borderRadius: "5px", padding: "8px", marginBottom: "6px",
        }}>
          <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
            <span style={{
              fontSize: "10px", fontWeight: "700", color: "#3b82f6",
              padding: "2px 6px", background: "#161820", borderRadius: "3px",
            }}>
              {prefix} {item.letra}
            </span>
            <button onClick={() => removeItem(item.id)} style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#ef4444", cursor: "pointer", fontSize: "14px",
            }}>×</button>
          </div>
          <input
            value={item.titulo}
            onChange={e => updateItem(item.id, "titulo", e.target.value)}
            placeholder={`Título do ${prefix.toLowerCase()}`}
            style={{ ...inputStyle, marginBottom: "4px" }}
          />
          <textarea
            value={item.conteudo}
            onChange={e => updateItem(item.id, "conteudo", e.target.value)}
            rows={4}
            placeholder={`Conteúdo do ${prefix.toLowerCase()}...`}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
          />
        </div>
      ))}
    </div>
  );
}
