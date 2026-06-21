"use client";

import { useRef, useState } from "react";
import type { EditeccDocument } from "@/lib/document";

interface DocumentManagerProps {
  docs: EditeccDocument[];
  currentId: string | null;
  onSwitch: (id: string) => void;
  onAdd: (title?: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<unknown>;
}

const btnStyle: React.CSSProperties = {
  padding: "6px 10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: "500",
  whiteSpace: "nowrap",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f1117",
  border: "1px solid #1e2330",
  color: "#cbd5e1",
  padding: "5px 8px",
  borderRadius: "4px",
  fontSize: "11px",
  outline: "none",
  boxSizing: "border-box",
};

export function DocumentManager({
  docs, currentId, onSwitch, onAdd, onDelete, onRename, onExport, onImport,
}: DocumentManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onImport(file);
    } catch (err: any) {
      alert(err?.message || "Erro ao importar");
    }
    e.target.value = "";
  };

  const startRename = (doc: EditeccDocument) => {
    setRenamingId(doc.id);
    setRenameValue(doc.title);
  };

  const finishRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
        <button onClick={() => onAdd()} style={btnStyle}>
          + Novo
        </button>
        <button onClick={onExport} style={btnStyle}>
          Exportar
        </button>
        <button onClick={() => fileRef.current?.click()} style={btnStyle}>
          Importar
        </button>
        <input ref={fileRef} type="file" accept=".editecc" style={{ display: "none" }} onChange={handleFile} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {docs.map(doc => (
          <div
            key={doc.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 8px",
              background: doc.id === currentId ? "#161820" : "transparent",
              border: doc.id === currentId ? "1px solid #2563eb" : "1px solid transparent",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => { if (doc.id !== currentId) onSwitch(doc.id); }}
          >
            {renamingId === doc.id ? (
              <input
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={finishRename}
                onKeyDown={e => { if (e.key === "Enter") finishRename(); if (e.key === "Escape") setRenamingId(null); }}
                autoFocus
                style={inputStyle}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                style={{
                  flex: 1,
                  fontSize: "11px",
                  color: doc.id === currentId ? "#e2e8f0" : "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onDoubleClick={e => { e.stopPropagation(); startRename(doc); }}
              >
                {doc.title}
              </span>
            )}
            {docs.length > 1 && renamingId !== doc.id && (
              <button
                onClick={e => { e.stopPropagation(); if (confirm(`Excluir "${doc.title}"?`)) onDelete(doc.id); }}
                style={{
                  background: "none", border: "none", color: "#ef4444",
                  cursor: "pointer", fontSize: "14px", padding: "0 2px",
                  lineHeight: "1",
                }}
                title="Excluir"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
