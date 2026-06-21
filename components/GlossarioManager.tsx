"use client";

export interface GlossarioEntry {
  id: string;
  termo: string;
  definicao: string;
}

interface GlossarioManagerProps {
  entries: GlossarioEntry[];
  onChange: (entries: GlossarioEntry[]) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f1117", border: "1px solid #1e2330",
  color: "#cbd5e1", padding: "5px 8px", borderRadius: "4px",
  fontSize: "11px", outline: "none", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

function genId() { return Math.random().toString(36).slice(2, 8); }

export function GlossarioManager({ entries, onChange }: GlossarioManagerProps) {
  const sorted = [...entries].sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));

  const addEntry = () => {
    onChange([...entries, { id: genId(), termo: "", definicao: "" }]);
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

      {entries.length === 0 && (
        <p style={{ fontSize: "10px", color: "#475569", fontStyle: "italic" }}>
          Nenhum termo adicionado.
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
