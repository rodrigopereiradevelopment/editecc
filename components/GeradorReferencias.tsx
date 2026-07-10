"use client";

import { useState, useCallback, useRef } from "react";
import { formatReference, Reference } from "@/lib/abnt/styles";

interface GeradorReferenciasProps {
  refs: Reference[];
  setRefs: React.Dispatch<React.SetStateAction<Reference[]>>;
  onInsertRef: (abnt: string) => void;
}

const emptyRef = (): Reference => ({
  type: "book",
  authors: [""],
  title: "",
  year: new Date().getFullYear(),
  publisher: "",
  city: "",
});

export function GeradorReferencias({ refs, setRefs, onInsertRef }: GeradorReferenciasProps) {
  const [form, setForm] = useState<Reference>(emptyRef());
  const [doiInput, setDoiInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);

  const addAuthorField = () => setForm(f => ({ ...f, authors: [...f.authors, ""] }));

  const updateAuthor = (i: number, v: string) => {
    const authors = [...form.authors];
    authors[i] = v;
    setForm(f => ({ ...f, authors }));
  };

  const removeAuthor = (i: number) => {
    if (form.authors.length <= 1) return;
    setForm(f => ({ ...f, authors: f.authors.filter((_, idx) => idx !== i) }));
  };

  const addRef = () => {
    const valid = form.authors.filter(a => a.trim());
    if (!valid.length || !form.title.trim()) return;
    const ref: Reference = {
      ...form,
      authors: valid,
    };
    setRefs(prev => [...prev, ref]);
    setForm(emptyRef());
    setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const removeRef = (i: number) => {
    setRefs(prev => prev.filter((_, idx) => idx !== i));
  };

  const clearRefs = () => {
    if (refs.length > 0 && confirm("Limpar todas as referências?")) setRefs([]);
  };

  const insertRef = (i: number) => {
    onInsertRef(formatReference(refs[i]));
  };

  const handleParseDoi = useCallback(async () => {
    const raw = doiInput.trim();
    if (!raw) return;
    setParsing(true);
    setParseError("");
    try {
      const Cite = (await import("citation-js")).default;
      const cite = new Cite(raw);
      if (!cite.data || !cite.data.length) {
        setParseError("Nenhum dado encontrado para esta entrada.");
        return;
      }
      const d = cite.data[0] as any;
      const ref: Reference = {
        type: mapCslType(d.type || "book"),
        authors: (d.author || []).map((a: any) =>
          [a.family, a.given].filter(Boolean).join(", ")
        ),
        title: d.title || "Sem título",
        year: d.issued?.["date-parts"]?.[0]?.[0] || new Date().getFullYear(),
        publisher: d.publisher || d["publisher-place"] || "",
        city: d["publisher-place"] || d.publisher || "",
        volume: d.volume || "",
        number: d.issue || "",
        pages: d.page || "",
        journal: d["container-title"] || d["collection-title"] || "",
        doi: d.DOI || "",
        url: d.URL || "",
      };
      setForm(ref);
      setDoiInput("");
    } catch {
      setParseError("Não foi possível interpretar. Tente DOI, ISBN ou BibTeX.");
    } finally {
      setParsing(false);
    }
  }, [doiInput]);

  const refCount = refs.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ fontSize: "10px", textTransform: "uppercase", color: "#334155", fontWeight: "600" }}>
        Referências ({refCount})
      </p>

      {/* Importar via DOI / ISBN / BibTeX */}
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          value={doiInput}
          onChange={e => setDoiInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleParseDoi()}
          placeholder="DOI, ISBN ou BibTeX..."
          style={{
            flex: 1, padding: "6px 10px", background: "#0f1117",
            border: "1px solid #1e2330", color: "#cbd5e1",
            borderRadius: "5px", fontSize: "11px", outline: "none",
          }}
        />
        <button onClick={handleParseDoi} disabled={parsing} style={{
          padding: "6px 10px", background: parsing ? "#334155" : "#2563eb",
          color: "white", border: "none", borderRadius: "5px",
          cursor: parsing ? "wait" : "pointer", fontSize: "11px", fontWeight: "500",
          whiteSpace: "nowrap",
        }}>
          {parsing ? "..." : "Importar"}
        </button>
      </div>
      {parseError && <p style={{ fontSize: "10px", color: "#ef4444" }}>{parseError}</p>}

      {/* Formulário manual */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#0a0c11", padding: "10px", borderRadius: "6px" }}>
        <select
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value as Reference["type"] }))}
          style={{
            padding: "5px 8px", background: "#0f1117", border: "1px solid #1e2330",
            color: "#cbd5e1", borderRadius: "4px", fontSize: "11px",
          }}
        >
          <option value="book">Livro</option>
          <option value="article">Artigo</option>
          <option value="chapter">Capítulo</option>
          <option value="thesis">Tese/Dissertação</option>
          <option value="website">Site</option>
          <option value="ebook">E-book</option>
          <option value="law">Legislação</option>
          <option value="event">Evento</option>
        </select>

        {form.authors.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: "4px" }}>
            <input
              value={a}
              onChange={e => updateAuthor(i, e.target.value)}
              placeholder={`Autor ${i + 1} (SOBRENOME, Nome)`}
              style={{
                flex: 1, padding: "5px 8px", background: "#0f1117",
                border: "1px solid #1e2330", color: "#cbd5e1",
                borderRadius: "4px", fontSize: "11px", outline: "none",
              }}
            />
            <button onClick={() => removeAuthor(i)} disabled={form.authors.length <= 1} style={{
              background: "none", border: "none", color: form.authors.length <= 1 ? "#1e2330" : "#ef4444",
              cursor: form.authors.length <= 1 ? "default" : "pointer", fontSize: "14px",
            }}>
              ×
            </button>
          </div>
        ))}
        <button onClick={addAuthorField} style={{
          background: "none", border: "1px dashed #1e2330", color: "#475569",
          padding: "3px", borderRadius: "4px", cursor: "pointer", fontSize: "10px",
        }}>
          + Autor
        </button>

        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Título"
          style={{
            padding: "5px 8px", background: "#0f1117", border: "1px solid #1e2330",
            color: "#cbd5e1", borderRadius: "4px", fontSize: "11px", outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: "4px" }}>
          <input
            value={form.city || ""}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="Cidade"
            style={{
              flex: 1, padding: "5px 8px", background: "#0f1117",
              border: "1px solid #1e2330", color: "#cbd5e1",
              borderRadius: "4px", fontSize: "11px", outline: "none",
            }}
          />
          <input
            value={form.publisher || ""}
            onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))}
            placeholder="Editora"
            style={{
              flex: 1, padding: "5px 8px", background: "#0f1117",
              border: "1px solid #1e2330", color: "#cbd5e1",
              borderRadius: "4px", fontSize: "11px", outline: "none",
            }}
          />
          <input
            type="number"
            value={form.year}
            onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || 0 }))}
            placeholder="Ano"
            style={{
              width: "60px", padding: "5px 8px", background: "#0f1117",
              border: "1px solid #1e2330", color: "#cbd5e1",
              borderRadius: "4px", fontSize: "11px", outline: "none",
            }}
          />
        </div>

        <button onClick={addRef} style={{
          padding: "6px 10px", background: "#10b981", color: "white",
          border: "none", borderRadius: "5px", cursor: "pointer",
          fontSize: "11px", fontWeight: "500",
        }}>
          + Adicionar
        </button>
      </div>

      {/* Lista de referências */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflow: "auto" }}>
        {refs.length === 0 ? (
          <p style={{ fontSize: "11px", color: "#64748b" }}>Nenhuma referência adicionada.</p>
        ) : (
          refs.map((ref, i) => (
            <div key={i} style={{
              padding: "8px", background: "#0a0c11", borderRadius: "5px",
              borderLeft: "2px solid #3b82f6", fontSize: "10px", color: "#94a3b8",
              lineHeight: "1.4",
            }}>
              <p style={{ marginBottom: "4px" }}>{formatReference(ref)}</p>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => insertRef(i)} style={{
                  background: "#2563eb", border: "none", color: "white",
                  padding: "2px 8px", borderRadius: "3px", cursor: "pointer",
                  fontSize: "9px",
                }}>
                  Inserir no texto
                </button>
                <button onClick={() => navigator.clipboard.writeText(formatReference(ref))} style={{
                  background: "#334155", border: "none", color: "#94a3b8",
                  padding: "2px 8px", borderRadius: "3px", cursor: "pointer",
                  fontSize: "9px",
                }}>
                  Copiar
                </button>
                <button onClick={() => removeRef(i)} style={{
                  background: "none", border: "none", color: "#ef4444",
                  cursor: "pointer", fontSize: "11px", marginLeft: "auto",
                }}>
                  ×
                </button>
              </div>
            </div>
          ))
        )}
        <div ref={listEndRef} />
      </div>

      {refs.length > 0 && (
        <button onClick={clearRefs} style={{
          background: "none", border: "1px solid #1e2330", color: "#475569",
          padding: "4px", borderRadius: "4px", cursor: "pointer", fontSize: "10px",
        }}>
          Limpar todas
        </button>
      )}
    </div>
  );
}

function mapCslType(cslType: string): Reference["type"] {
  const map: Record<string, Reference["type"]> = {
    book: "book",
    "book-section": "chapter",
    "book-chapter": "chapter",
    "article-journal": "article",
    "article-magazine": "article",
    "article-newspaper": "article",
    thesis: "thesis",
    dissertation: "thesis",
    "personal_communication": "website",
    webpage: "website",
    software: "ebook",
    report: "book",
    bill: "law",
    legislation: "law",
    "paper-conference": "event",
  };
  return map[cslType] || "book";
}
