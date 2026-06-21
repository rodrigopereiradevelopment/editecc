"use client";

export interface NotaRodape {
  id: string;
  numero: number;
  texto: string;
}

interface NotasRodapeManagerProps {
  notas: NotaRodape[];
  onChange: (notas: NotaRodape[]) => void;
  onInsertMarker: (numero: number) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f1117", border: "1px solid #1e2330",
  color: "#cbd5e1", padding: "5px 8px", borderRadius: "4px",
  fontSize: "11px", outline: "none", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

function genId() { return Math.random().toString(36).slice(2, 8); }

export function NotasRodapeManager({ notas, onChange, onInsertMarker }: NotasRodapeManagerProps) {
  const addNota = () => {
    const nextNum = notas.length + 1;
    onChange([...notas, { id: genId(), numero: nextNum, texto: "" }]);
  };

  const removeNota = (id: string) => {
    const next = notas.filter(n => n.id !== id).map((n, i) => ({ ...n, numero: i + 1 }));
    onChange(next);
  };

  const updateNota = (id: string, texto: string) => {
    onChange(notas.map(n => n.id === id ? { ...n, texto } : n));
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <p style={{ color: "#334155", fontSize: "10px", textTransform: "uppercase", fontWeight: "600" }}>
          Notas de Rodapé
        </p>
        <button onClick={addNota} style={{
          padding: "4px 8px", background: "#2563eb", color: "white",
          border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px", fontWeight: "500",
        }}>+ Nota</button>
      </div>

      {notas.length === 0 && (
        <p style={{ fontSize: "10px", color: "#475569", fontStyle: "italic" }}>
          Nenhuma nota de rodapé adicionada.
        </p>
      )}

      {notas.map(nota => (
        <div key={nota.id} style={{
          background: "#0a0c11", border: "1px solid #1e2330",
          borderRadius: "5px", padding: "8px", marginBottom: "6px",
        }}>
          <div style={{ display: "flex", gap: "4px", marginBottom: "4px", alignItems: "center" }}>
            <span style={{
              fontSize: "10px", fontWeight: "700", color: "#f59e0b",
              padding: "2px 6px", background: "#161820", borderRadius: "3px",
            }}>
              {nota.numero}
            </span>
            <button
              onClick={() => onInsertMarker(nota.numero)}
              style={{
                padding: "2px 6px", background: "#1e293b", color: "#94a3b8",
                border: "1px solid #334155", borderRadius: "3px", cursor: "pointer",
                fontSize: "9px",
              }}
              title="Inserir marcador no texto"
            >
              Inserir ˄{nota.numero}
            </button>
            <button onClick={() => removeNota(nota.id)} style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#ef4444", cursor: "pointer", fontSize: "14px",
            }}>×</button>
          </div>
          <textarea
            value={nota.texto}
            onChange={e => updateNota(nota.id, e.target.value)}
            rows={3}
            placeholder="Texto da nota de rodapé (Arial 10, espaçamento simples)..."
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.3" }}
          />
        </div>
      ))}
    </div>
  );
}
