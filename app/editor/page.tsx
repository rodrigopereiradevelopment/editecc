"use client";
// app/editor/page.tsx v0.1.1 FINAL
import { useState, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

// Importar componentes do DeepSeek
import { FolhaRosto } from "@/components/FolhaRosto";
import { ResumoSection } from "@/components/ResumoSection";
import { AbstractSection } from "@/components/AbstractSection";
import { Capa } from "@/components/Capa";
import { GeradorReferencias } from "@/components/GeradorReferencias";
import { ListaFigurasTabelas } from "@/components/ListaFigurasTabelas";
import { extractFigures, extractTables } from "@/lib/abnt/styles";

// Importar hooks e libs
import { useAutosave } from "@/hooks/useAutosave";
import { validateDocument, generateTOC, countWords, formatReference, Reference } from "@/lib/abnt/styles";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface CoverData {
  autor: string;
  titulo: string;
  subtitulo: string;
  orientador: string;
  curso: string;
  etec: string;
  local: string;
  ano: string;
}

interface ValidationIssue {
  type: "error" | "warning" | "info";
  message: string;
}

// ─── ICONS ────────────────────────────────────────────────────────────────────

const BoldIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const ItalicIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const UnderlineIcon= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>;
const JustifyIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const SaveIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const PrintIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const CheckIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  // Estado geral
  const [activeTab, setActiveTab] = useState<"capa" | "editor" | "toc" | "validate">("capa");
  const [coverData, setCoverData] = useState<CoverData>({
    autor: "",
    titulo: "",
    subtitulo: "",
    orientador: "",
    curso: "",
    etec: "Centro Paula Souza – ETEC",
    local: "São Paulo",
    ano: new Date().getFullYear().toString(),
  });

  const [resumo, setResumo] = useState("");
  const [palavrasChave, setPalavrasChave] = useState<string[]>([]);
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [toc, setToc] = useState<{ id: string; level: number; text: string }[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showFolhaRosto, setShowFolhaRosto] = useState(false);
  const [refs, setRefs] = useState<Reference[]>([]);
  const [showFigList, setShowFigList] = useState(false);

  // Editor (Tiptap)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "justify",
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Comece a digitar seu TCC aqui. Use os estilos acima para aplicar formatação ABNT.",
      }),
      CharacterCount,
    ],
    content: `<h1>1 INTRODUÇÃO</h1><p></p>`,
    editorProps: {
      attributes: {
        class: "a4-page editor-area prose prose-sm max-w-none",
        style: "font-family: Arial, Calibri, sans-serif; font-size: 12pt; line-height: 1.5;",
      },
    },
    immediatelyRender: false,
  });

  // Refs
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Atualizar contagens e validação
  const updateCounts = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const text = editor.getText();
    setWordCount(countWords(text));
    setCharCount(text.length);
    setToc(generateTOC(html));
    setValidationIssues(validateDocument(html) as ValidationIssue[]);
  }, [editor]);

  // Listener para mudanças no editor
  useEffect(() => {
    if (!editor) return;
    editor.on("update", updateCounts);
    return () => {
      editor.off("update", updateCounts);
    };
  }, [editor, updateCounts]);

  // Autosave
  useAutosave({
    key: "editecc-v0.2",
    data: {
      cover: coverData,
      resumo,
      palavrasChave,
      abstract,
      keywords,
      content: editor?.getHTML() || "",
      refs,
    },
    enabled: true,
    interval: 20000,
    onSave: () => {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    },
  });

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem("editecc-v0.2") || localStorage.getItem("editecc-v0.1.1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cover) setCoverData(parsed.cover);
        if (parsed.resumo) setResumo(parsed.resumo);
        if (parsed.palavrasChave) setPalavrasChave(parsed.palavrasChave);
        if (parsed.abstract) setAbstract(parsed.abstract);
        if (parsed.keywords) setKeywords(parsed.keywords);
        if (parsed.content && editor) {
          editor.commands.setContent(parsed.content);
        }
      } catch (e) {
        console.error("Erro ao carregar dados salvos", e);
      }
    }
    // Carregar referências
    const savedRefs = localStorage.getItem("editecc-refs");
    if (savedRefs) {
      try { setRefs(JSON.parse(savedRefs)); } catch {}
    }
  }, [editor]);

  // Navegação no sumário
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Inserir referência no editor
  const handleInsertRef = (abnt: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(`<p class="abnt-referencia">${abnt}</p><p></p>`).run();
  };

  // Exportar PDF
  const handleExportPdf = () => {
    window.print();
  };

  // Comandos de formatação
  const applyFormat = (command: string) => {
    if (!editor) return;
    editor.chain().focus()[command]?.().run();
  };

  if (!editor) {
    return <div className="flex items-center justify-center h-screen">Carregando editor...</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0c11;
          color: #e2e8f0;
        }
        
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 3px; }
        
        .a4-page {
          width: 21cm;
          min-height: 29.7cm;
          padding: 3cm 2cm 2cm 3cm;
          background: white;
          box-shadow: 0 8px 48px rgba(0,0,0,0.55);
          font-family: 'Arial', 'Calibri', sans-serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #111;
          flex-shrink: 0;
        }
        
        .editor-area { outline: none; }
        .editor-area h1 { font-size: 12pt; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.5; margin: 2em 0 1em; }
        .editor-area h2 { font-size: 12pt; font-weight: 700; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; }
        .editor-area h3 { font-size: 12pt; font-weight: 700; font-style: italic; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; }
        .editor-area p { font-size: 12pt; line-height: 1.5; text-align: justify; text-indent: 1.25cm; margin-bottom: 0; }
        .editor-area blockquote { font-size: 10pt; line-height: 1.0; margin-left: 4cm; text-align: justify; margin-bottom: 1em; border: none; padding: 0; }
        .abnt-referencia { font-size: 12pt; line-height: 1.0; text-align: justify; margin-bottom: 6pt; }
        .editor-area ul, .editor-area ol { padding-left: 1.5cm; line-height: 1.5; }
        
        .no-print { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        @media print { .no-print { display: none !important; } .a4-page { box-shadow: none !important; } }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <div className="no-print" style={{
          width: "280px", background: "#0d0f15", borderRight: "1px solid #1e2330",
          display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{ padding: "14px", borderBottom: "1px solid #1e2330" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.3px" }}>
              Edite<span style={{ color: "#3b82f6" }}>CC</span>
            </h2>
            <p style={{ fontSize: "9px", color: "#1e2d3d", marginTop: "2px" }}>ABNT NBR 14724 · v0.2</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1e2330", gap: "1px" }}>
              {[
                ["capa", "📄 Capa"],
                ["editor", "✍️ Editor"],
                ["refs", "📚 Ref."],
                ["figuras", "🖼️ Fig."],
                ["toc", "📑 Sumário"],
                ["validate", "✓ Validar"],
              ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  background: activeTab === id ? "#161820" : "transparent",
                  border: "none",
                  borderBottom: activeTab === id ? "2px solid #3b82f6" : "1px solid #1e2330",
                  color: activeTab === id ? "#3b82f6" : "#334155",
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: "500",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div style={{ flex: 1, overflow: "auto", padding: "14px" }}>
            {activeTab === "capa" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Instituição
                  <input
                    value={coverData.etec}
                    onChange={e => setCoverData({ ...coverData, etec: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Curso
                  <input
                    value={coverData.curso}
                    onChange={e => setCoverData({ ...coverData, curso: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Autor
                  <input
                    value={coverData.autor}
                    onChange={e => setCoverData({ ...coverData, autor: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Título
                  <input
                    value={coverData.titulo}
                    onChange={e => setCoverData({ ...coverData, titulo: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Subtítulo
                  <input
                    value={coverData.subtitulo}
                    onChange={e => setCoverData({ ...coverData, subtitulo: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Orientador
                  <input
                    value={coverData.orientador}
                    onChange={e => setCoverData({ ...coverData, orientador: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Cidade
                  <input
                    value={coverData.local}
                    onChange={e => setCoverData({ ...coverData, local: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase" }}>
                  Ano
                  <input
                    value={coverData.ano}
                    onChange={e => setCoverData({ ...coverData, ano: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "#0f1117", border: "1px solid #1e2330", color: "#cbd5e1",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <button
                  onClick={() => setShowFolhaRosto(!showFolhaRosto)}
                  style={{
                    marginTop: "10px", padding: "8px 12px",
                    background: "#2563eb", color: "white", border: "none",
                    borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500",
                  }}
                >
                  {showFolhaRosto ? "Esconder Folha de Rosto" : "Mostrar Folha de Rosto"}
                </button>
                <button
                  onClick={() => setShowFigList(!showFigList)}
                  style={{
                    marginTop: "6px", padding: "8px 12px",
                    background: "#2563eb", color: "white", border: "none",
                    borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500",
                  }}
                >
                  {showFigList ? "Esconder Lista de Fig./Tab." : "Mostrar Lista de Fig./Tab."}
                </button>
              </div>
            )}

            {activeTab === "editor" && (
              <>
                <ResumoSection
                  value={resumo}
                  onChange={setResumo}
                  palavrasChave={palavrasChave}
                  onPalavrasChaveChange={setPalavrasChave}
                />
                <AbstractSection
                  value={abstract}
                  onChange={setAbstract}
                  keywords={keywords}
                  onKeywordsChange={setKeywords}
                  resumo={resumo}
                />
              </>
            )}

            {activeTab === "toc" && (
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "#334155", fontWeight: "600", marginBottom: "12px" }}>
                  Sumário Automático
                </p>
                {toc.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#64748b" }}>Nenhum título detectado.</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {toc.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          paddingLeft: `${(item.level - 1) * 12 + 4}px`,
                          paddingTop: "4px",
                          paddingBottom: "4px",
                          color: item.level === 1 ? "#e2e8f0" : item.level === 2 ? "#94a3b8" : "#64748b",
                          fontSize: "12px",
                          borderLeft: `2px solid ${item.level === 1 ? "#3b82f6" : "transparent"}`,
                          cursor: "pointer",
                        }}
                        onClick={() => scrollToHeading(item.id)}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "refs" && (
              <GeradorReferencias refs={refs} setRefs={setRefs} onInsertRef={handleInsertRef} />
            )}

            {activeTab === "figuras" && (
              <ListaFigurasTabelas editorHtml={editor?.getHTML() || ""} />
            )}

            {activeTab === "validate" && (
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "#334155", fontWeight: "600", marginBottom: "12px" }}>
                  Validação ABNT
                </p>
                {validationIssues.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#10b981" }}>✓ Documento válido!</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, gap: "8px", display: "flex", flexDirection: "column" }}>
                    {validationIssues.map((issue, i) => (
                      <li
                        key={i}
                        style={{
                          padding: "8px 10px",
                          background: "#0a0c11",
                          borderLeft: `2px solid ${issue.type === "error" ? "#ef4444" : issue.type === "warning" ? "#f59e0b" : "#3b82f6"}`,
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        {issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️"} {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: "9px 14px", borderTop: "1px solid #1e2330", fontSize: "9px", color: "#1e2d3d" }}>
            Open Source · MIT · rodrigopereiradevelopment
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Toolbar */}
          <div className="no-print" style={{
            background: "#0d0f15", borderBottom: "1px solid #1e2330",
            padding: "6px 10px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap",
          }}>
            <button onMouseDown={e => { e.preventDefault(); applyFormat("toggleBold"); }} title="Negrito (Ctrl+B)"
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2330"; (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}>
              <BoldIcon />
            </button>
            <button onMouseDown={e => { e.preventDefault(); applyFormat("toggleItalic"); }} title="Itálico (Ctrl+I)"
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2330"; (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}>
              <ItalicIcon />
            </button>
            <button onMouseDown={e => { e.preventDefault(); applyFormat("toggleUnderline"); }} title="Sublinhado (Ctrl+U)"
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2330"; (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}>
              <UnderlineIcon />
            </button>
            <button onMouseDown={e => { e.preventDefault(); applyFormat("setTextAlign", { align: "justify" }); }} title="Justificar"
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2330"; (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}>
              <JustifyIcon />
            </button>

            <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
              {savedMsg && <span style={{ color: "#10b981", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px" }}><CheckIcon /> Salvo</span>}
              <button onClick={handleExportPdf} style={{
                background: "#2563eb", border: "none", color: "white",
                padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
                fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px",
              }}>
                <PrintIcon /> Exportar PDF
              </button>
            </div>
          </div>

          {/* Editor Canvas */}
          <div ref={editorContainerRef} style={{
            flex: 1, overflow: "auto", background: "#0f1117",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "28px 20px", gap: "20px",
          }}>
            <Capa {...coverData} />
            {showFolhaRosto && <FolhaRosto {...coverData} />}
  <EditorContent editor={editor} />
            {/* Lista de Figuras e Tabelas automática (v0.2) */}
            {showFigList && (() => {
              const html = editor?.getHTML() || "";
              const figs = extractFigures(html);
              const tbls = extractTables(html);
              if (!figs.length && !tbls.length) return null;
              return (
                <div className="a4-page" style={{ padding: "3cm 2cm 2cm 3cm", marginTop: "20px" }}>
                  {figs.length > 0 && (
                    <>
                      <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginBottom: "1.5em" }}>
                        LISTA DE FIGURAS
                      </h1>
                      {figs.map((f, i) => (
                        <p key={f.id} style={{ fontSize: "12pt", lineHeight: "1.5", marginBottom: "4pt" }}>
                          FIGURA {f.index} – {f.caption}
                        </p>
                      ))}
                    </>
                  )}
                  {tbls.length > 0 && (
                    <>
                      <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", margin: "2em 0 1em" }}>
                        LISTA DE TABELAS
                      </h1>
                      {tbls.map((t, i) => (
                        <p key={t.id} style={{ fontSize: "12pt", lineHeight: "1.5", marginBottom: "4pt" }}>
                          TABELA {t.index} – {t.caption}
                        </p>
                      ))}
                    </>
                  )}
                </div>
              );
            })()}
            {/* Referências (v0.2) */}
            {refs.length > 0 && (
              <div className="a4-page" style={{ padding: "3cm 2cm 2cm 3cm", marginTop: "20px" }}>
                <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginBottom: "1.5em" }}>
                  REFERÊNCIAS
                </h1>
                {refs.map((r, i) => (
                  <p key={i} style={{ fontSize: "12pt", lineHeight: "1.0", marginBottom: "6pt", textAlign: "justify" }}>
                    {formatReference(r)}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="no-print" style={{
            background: "#0d0f15", borderTop: "1px solid #1e2330",
            padding: "4px 14px", display: "flex", gap: "16px", alignItems: "center", fontSize: "10px",
          }}>
            <span style={{ color: "#1e2d3d" }}>Palavras: <span style={{ color: "#334155" }}>{wordCount}</span></span>
            <span style={{ color: "#1e2d3d" }}>Caracteres: <span style={{ color: "#334155" }}>{charCount}</span></span>
            <span style={{ color: "#1e2d3d", marginLeft: "auto" }}>🖥️ ABNT NBR 14724:2011 · v0.2</span>
          </div>
        </div>
      </div>
    </>
  );
}
