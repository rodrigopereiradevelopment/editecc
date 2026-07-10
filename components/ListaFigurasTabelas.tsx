"use client";

import { extractFigures, extractTables } from "@/lib/abnt/styles";

interface ListaFigurasTabelasProps {
  editorHtml: string;
}

export function ListaFigurasTabelas({ editorHtml }: ListaFigurasTabelasProps) {
  const figures = extractFigures(editorHtml);
  const tables = extractTables(editorHtml);
  const hasContent = figures.length > 0 || tables.length > 0;

  if (!hasContent) {
    return (
      <div>
        <p style={{ fontSize: "10px", textTransform: "uppercase", color: "#334155", fontWeight: "600", marginBottom: "12px" }}>
          Lista de Figuras e Tabelas
        </p>
        <p style={{ fontSize: "12px", color: "#64748b" }}>
          Nenhuma figura ou tabela detectada no documento.
        </p>
        <p style={{ fontSize: "11px", color: "#475569", marginTop: "8px" }}>
          Para adicionar figuras, insira tags <code style={{ background: "#0a0c11", padding: "1px 4px", borderRadius: "3px" }}>&lt;figure&gt;</code> ou <code style={{ background: "#0a0c11", padding: "1px 4px", borderRadius: "3px" }}>&lt;img&gt;</code> no HTML do editor.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: "10px", textTransform: "uppercase", color: "#334155", fontWeight: "600", marginBottom: "12px" }}>
        Lista de Figuras e Tabelas
      </p>

      {figures.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "6px" }}>
            FIGURAS
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {figures.map((fig) => (
              <li key={fig.id} style={{
                padding: "6px 8px", borderLeft: "2px solid #3b82f6",
                background: "#0a0c11", borderRadius: "4px", marginBottom: "4px",
                fontSize: "11px", color: "#94a3b8",
              }}>
                <span style={{ color: "#e2e8f0", fontWeight: "500" }}>Figura {fig.index}:</span> {fig.caption}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tables.length > 0 && (
        <div>
          <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "6px" }}>
            TABELAS
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tables.map((tbl) => (
              <li key={tbl.id} style={{
                padding: "6px 8px",                 borderLeft: "2px solid #10b981",
                background: "#0a0c11", borderRadius: "4px", marginBottom: "4px",
                fontSize: "11px", color: "#94a3b8",
              }}>
                <span style={{ color: "#e2e8f0", fontWeight: "500" }}>Tabela {tbl.index}:</span> {tbl.caption}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
