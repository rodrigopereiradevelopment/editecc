"use client";
// app/editor/page.tsx v0.1.1 FINAL
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import { FolhaAprovacao } from "@/components/FolhaAprovacao";
import { Dedicatoria } from "@/components/Dedicatoria";
import { Agradecimentos } from "@/components/Agradecimentos";
import { Epigrafe } from "@/components/Epigrafe";
import { ResumoPage } from "@/components/ResumoPage";
import { AbstractPage } from "@/components/AbstractPage";
import { AnexoPage } from "@/components/AnexoPage";
import { ApendicePage } from "@/components/ApendicePage";
import { GlossarioPage } from "@/components/GlossarioPage";
import { NotasRodapePage } from "@/components/NotasRodapePage";
import { GeradorReferencias } from "@/components/GeradorReferencias";
import { ListaFigurasTabelas } from "@/components/ListaFigurasTabelas";
import { DocumentManager } from "@/components/DocumentManager";
import { PosTextuaisManager } from "@/components/PosTextuaisManager";
import { GlossarioManager } from "@/components/GlossarioManager";
import { NotasRodapeManager } from "@/components/NotasRodapeManager";
import type { PosTextualItem } from "@/components/PosTextuaisManager";
import type { GlossarioEntry } from "@/components/GlossarioManager";
import type { NotaRodape } from "@/components/NotasRodapeManager";
import { extractFigures, extractTables } from "@/lib/abnt/styles";

// Importar hooks e libs
import { useDocuments } from "@/hooks/useDocuments";
import type { TargetLang } from "@/hooks/useTranslation";
import { validateDocument, generateTOC, countWords, formatReference, Reference } from "@/lib/abnt/styles";
import { parseSectionsFull, gerarPPTX, formatBullets } from "@/lib/slideGenerator";
import { useSummarization } from "@/hooks/useSummarization";
import type { EditeccDocument } from "@/lib/document";

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
const SlidesIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const CheckIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  // Estado geral
  const [activeTab, setActiveTab] = useState<"capa" | "editor" | "toc" | "validate" | "refs" | "figuras" | "docs">("capa");
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
  const [abstractLang, setAbstractLang] = useState<TargetLang>("en");
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [toc, setToc] = useState<{ id: string; level: number; text: string }[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showFolhaRosto, setShowFolhaRosto] = useState(false);
  const [showAprovacao, setShowAprovacao] = useState(false);
  const [showDedicatoria, setShowDedicatoria] = useState(false);
  const [showAgradecimentos, setShowAgradecimentos] = useState(false);
  const [showEpigrafe, setShowEpigrafe] = useState(false);
  const [showResumoPage, setShowResumoPage] = useState(false);
  const [showAbstractPage, setShowAbstractPage] = useState(false);
  const [refs, setRefs] = useState<Reference[]>([]);
  const [showFigList, setShowFigList] = useState(false);
  const [dedicatoriaTexto, setDedicatoriaTexto] = useState("");
  const [agradecimentosTexto, setAgradecimentosTexto] = useState("");
  const [epigrafeTexto, setEpigrafeTexto] = useState("");
  const [epigrafeAutor, setEpigrafeAutor] = useState("");
  const [aprovacaoData, setAprovacaoData] = useState("");
  const [anexos, setAnexos] = useState<PosTextualItem[]>([]);
  const [apendices, setApendices] = useState<PosTextualItem[]>([]);
  const [glossario, setGlossario] = useState<GlossarioEntry[]>([]);
  const [notasRodape, setNotasRodape] = useState<NotaRodape[]>([]);
  const [showAnexos, setShowAnexos] = useState(false);
  const [showApendices, setShowApendices] = useState(false);
  const [showGlossario, setShowGlossario] = useState(false);
  const [showNotasRodape, setShowNotasRodape] = useState(false);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [slidesProgress, setSlidesProgress] = useState(0);
  const [slidesStatus, setSlidesStatus] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // ─── SUMARIZAÇÃO (v0.8) ──────────────────────────────────────────────────
  const {
    summarize, loadModel: loadSumModel,
    loading: sumLoading, progress: sumProgress, modelStatus: sumModelStatus, error: sumError,
  } = useSummarization();

  const importFileRef = useRef<HTMLInputElement>(null);

  // ─── MULTI-DOCUMENT (v0.4) ─────────────────────────────────────────────
  const {
    docs, currentDoc, currentId, updateCurrentDoc,
    switchDoc, addDoc, deleteDoc, renameDoc,
    handleExport, handleImport,
  } = useDocuments();

  const handleImportClick = useCallback(() => {
    importFileRef.current?.click();
  }, []);

  const handleImportFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await handleImport(file);
    } catch {}
    e.target.value = "";
  }, [handleImport]);

  const isNewDoc = useMemo(() => {
    if (!currentDoc) return true;
    return (
      !currentDoc.cover.autor &&
      !currentDoc.cover.titulo &&
      !currentDoc.resumo &&
      !currentDoc.abstract &&
      currentDoc.refs.length === 0 &&
      currentDoc.content === "<h1>1 INTRODUÇÃO</h1><p></p>"
    );
  }, [currentDoc]);

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

  // Carregar dados do doc atual no state (executa quando troca de doc)
  const loadDocIntoState = useCallback((doc: EditeccDocument) => {
    if (!doc) return;
    setCoverData(doc.cover);
    setResumo(doc.resumo);
    setPalavrasChave(doc.palavrasChave);
    setAbstract(doc.abstract);
    setKeywords(doc.keywords);
    setAbstractLang(doc.abstractLang as TargetLang);
    setRefs(doc.refs);
    setDedicatoriaTexto(doc.dedicatoriaTexto);
    setAgradecimentosTexto(doc.agradecimentosTexto);
    setEpigrafeTexto(doc.epigrafeTexto);
    setEpigrafeAutor(doc.epigrafeAutor);
    setAprovacaoData(doc.aprovacaoData);
    setShowFolhaRosto(doc.showFolhaRosto);
    setShowAprovacao(doc.showAprovacao);
    setShowDedicatoria(doc.showDedicatoria);
    setShowAgradecimentos(doc.showAgradecimentos);
    setShowEpigrafe(doc.showEpigrafe);
    setShowResumoPage(doc.showResumoPage);
    setShowAbstractPage(doc.showAbstractPage);
    setShowFigList(doc.showFigList);
    setAnexos(doc.anexos || []);
    setApendices(doc.apendices || []);
    setGlossario(doc.glossario || []);
    setNotasRodape(doc.notasRodape || []);
    setShowAnexos(doc.showAnexos || false);
    setShowApendices(doc.showApendices || false);
    setShowGlossario(doc.showGlossario || false);
    setShowNotasRodape(doc.showNotasRodape || false);
    if (editor) {
      editor.commands.setContent(doc.content || `<h1>1 INTRODUÇÃO</h1><p></p>`);
    }
  }, [editor]);

  useEffect(() => {
    if (currentDoc) loadDocIntoState(currentDoc);
  }, [currentDoc, loadDocIntoState]);

  // Autosave (v0.4 — salva no documento atual)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncToDoc = useCallback(() => {
    if (!currentId) return;
    updateCurrentDoc({
      cover: coverData,
      resumo,
      palavrasChave,
      abstract,
      keywords,
      abstractLang,
      content: editor?.getHTML() || "",
      refs,
      dedicatoriaTexto,
      agradecimentosTexto,
      epigrafeTexto,
      epigrafeAutor,
      aprovacaoData,
      showFolhaRosto,
      showAprovacao,
      showDedicatoria,
      showAgradecimentos,
      showEpigrafe,
      showResumoPage,
      showAbstractPage,
      showFigList,
      anexos,
      apendices,
      glossario,
      notasRodape,
      showAnexos,
      showApendices,
      showGlossario,
      showNotasRodape,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }, [currentId, updateCurrentDoc, coverData, resumo, palavrasChave, abstract, keywords, abstractLang, editor, refs,
    dedicatoriaTexto, agradecimentosTexto, epigrafeTexto, epigrafeAutor, aprovacaoData,
    showFolhaRosto, showAprovacao, showDedicatoria, showAgradecimentos, showEpigrafe,
    showResumoPage, showAbstractPage, showFigList,
    anexos, apendices, glossario, notasRodape, showAnexos, showApendices, showGlossario, showNotasRodape]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(syncToDoc, 20000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [syncToDoc]);

  // Tema claro/escuro
  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    return () => document.body.classList.remove("theme-light");
  }, [theme]);

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

  // Gerar apresentação de slides (v0.8 — sumarização)
  const handleGerarSlides = async () => {
    if (!editor) return;
    setSlidesLoading(true);
    setSlidesStatus("Extraindo seções…");
    setSlidesProgress(0);
    try {
      const html = editor.getHTML();
      const sections = parseSectionsFull(html);

      if (sections.length === 0) {
        setSlidesStatus("Nenhuma seção encontrada no documento.");
        setTimeout(() => setSlidesLoading(false), 2000);
        return;
      }

      if (sumModelStatus !== "ready") {
        setSlidesStatus("Carregando modelo de sumarização… (~300MB, único download)");
        await loadSumModel();
      }
      if (sumError) {
        setSlidesStatus(`Erro: ${sumError}`);
        setTimeout(() => setSlidesLoading(false), 3000);
        return;
      }

      const summarized = [];
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        setSlidesStatus(`Resumindo ${sec.titulo}… (${i + 1}/${sections.length})`);
        setSlidesProgress(Math.round(((i + 1) / sections.length) * 100));
        const resumo = await summarize(sec.textoCompleto);
        summarized.push({
          titulo: sec.titulo,
          conteudo: formatBullets(resumo),
        });
      }

      setSlidesStatus("Gerando arquivo PPTX…");
      setSlidesProgress(100);
      gerarPPTX(summarized, {
        titulo: coverData.titulo,
        autor: coverData.autor,
        curso: coverData.curso,
        orientador: coverData.orientador,
      });
      setSlidesLoading(false);
    } catch (err: any) {
      setSlidesStatus(`Erro ao gerar slides: ${err?.message || "desconhecido"}`);
      setTimeout(() => setSlidesLoading(false), 4000);
    }
  };

  // Comandos de formatação
  const applyFormat = (command: string, attrs?: Record<string, unknown>) => {
    if (!editor) return;
    const chain = editor.chain().focus() as any;
    if (attrs) {
      chain[command](attrs)?.run();
    } else {
      chain[command]()?.run();
    }
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
          background: var(--bg-app);
          color: var(--text-secondary);
        }
        
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
        
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
          position: relative;
        }
        .a4-page::after {
          content: counter(page);
          counter-increment: page;
          position: absolute;
          bottom: 1.5cm;
          right: 2cm;
          font-family: 'Arial', 'Calibri', sans-serif;
          font-size: 12pt;
          color: #111;
        }
        
        .editor-area { outline: none; }
        .editor-area h1 { font-size: 12pt; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.5; margin: 2em 0 1em; }
        .editor-area h2 { font-size: 12pt; font-weight: 700; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; }
        .editor-area h3 { font-size: 12pt; font-weight: 700; font-style: italic; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; }
        .editor-area p { font-size: 12pt; line-height: 1.5; text-align: justify; text-indent: 2.5cm; margin-bottom: 0; }
        .editor-area blockquote { font-size: 10pt; line-height: 1.0; margin-left: 4cm; text-align: justify; margin-bottom: 1em; border: none; padding: 0; }
        .abnt-referencia { font-size: 12pt; line-height: 1.0; text-align: justify; margin-bottom: 6pt; }
        .editor-area ul, .editor-area ol { padding-left: 1.5cm; line-height: 1.5; }
        
        .no-print { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        @media print {
          .no-print { display: none !important; }
          .a4-page { box-shadow: none !important; page-break-after: always; }
          .a4-page::after { content: "" !important; }
          @page { margin: 0; }
          @page :first { margin: 0; }
        }
      `}</style>

      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>

      <input ref={importFileRef} type="file" accept=".editecc" style={{ display: "none" }} onChange={handleImportFile} />

      {isNewDoc ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "100vh", background: "var(--bg-app)", gap: "24px", padding: "40px",
        }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "36px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-1px" }}>
              Edite<span style={{ color: "#3b82f6" }}>CC</span>
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-dim)", marginTop: "8px" }}>
              Editor de TCC com formatação ABNT automática
            </p>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={() => addDoc()} style={{
              padding: "14px 32px", background: "#2563eb", color: "white",
              border: "none", borderRadius: "8px", cursor: "pointer",
              fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo TCC
            </button>
            <button onClick={handleImportClick} style={{
              padding: "14px 32px", background: "var(--border-color)", color: "var(--text-secondary)",
              border: "1px solid #334155", borderRadius: "8px", cursor: "pointer",
              fontSize: "15px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Importar .editecc
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-very-dim)", marginTop: "8px" }}>
            v0.9.3 · 100% local · sem cadastro · sem API externa
          </p>
        </div>
      ) : (
      <div style={{ display: "flex", height: "100vh", minWidth: "1024px", overflow: "auto" }}>

        {/* ── SIDEBAR ── */}
        <aside className="no-print" aria-label="Painel lateral" style={{
          width: "280px", background: "var(--bg-surface)", borderRight: "1px solid var(--border-color)",
          display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{ padding: "14px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                Edite<span style={{ color: "#3b82f6" }}>CC</span>
              </h2>
              <p style={{ fontSize: "9px", color: "var(--text-faint)", marginTop: "2px" }}>ABNT NBR 14724 · v0.2</p>
            </div>
            <button
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                background: "none", border: "1px solid var(--border-color)", color: "var(--text-dim)",
                cursor: "pointer", padding: "5px 7px", borderRadius: "6px",
                fontSize: "11px", display: "flex", alignItems: "center", gap: "4px",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}
            >
              {theme === "dark" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "1px" }}>
              {[
                ["capa", "📄 Capa"],
                ["editor", "✍️ Editor"],
                ["refs", "📚 Ref."],
                ["figuras", "🖼️ Fig."],
                ["toc", "📑 Sumário"],
                ["validate", "✓ Validar"],
                ["docs", "📁 Docs"],
              ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  background: activeTab === id ? "var(--bg-hover)" : "transparent",
                  border: "none",
                  borderBottom: activeTab === id ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                  color: activeTab === id ? "#3b82f6" : "var(--text-very-dim)",
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
            {activeTab === "docs" && (
              <DocumentManager
                docs={docs}
                currentId={currentId}
                onSwitch={switchDoc}
                onAdd={addDoc}
                onDelete={deleteDoc}
                onRename={renameDoc}
                onExport={handleExport}
                onImport={handleImport}
              />
            )}
            {activeTab === "capa" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Instituição
                  <input
                    value={coverData.etec}
                    onChange={e => setCoverData({ ...coverData, etec: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Curso
                  <input
                    value={coverData.curso}
                    onChange={e => setCoverData({ ...coverData, curso: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Autor
                  <input
                    value={coverData.autor}
                    onChange={e => setCoverData({ ...coverData, autor: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Título
                  <input
                    value={coverData.titulo}
                    onChange={e => setCoverData({ ...coverData, titulo: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Subtítulo
                  <input
                    value={coverData.subtitulo}
                    onChange={e => setCoverData({ ...coverData, subtitulo: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Orientador
                  <input
                    value={coverData.orientador}
                    onChange={e => setCoverData({ ...coverData, orientador: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Cidade
                  <input
                    value={coverData.local}
                    onChange={e => setCoverData({ ...coverData, local: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Ano
                  <input
                    value={coverData.ano}
                    onChange={e => setCoverData({ ...coverData, ano: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <button aria-label={showFolhaRosto ? "Ocultar Folha de Rosto" : "Mostrar Folha de Rosto"} onClick={() => setShowFolhaRosto(!showFolhaRosto)} style={{ padding: "8px 12px", background: showFolhaRosto ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showFolhaRosto ? "✓ Folha de Rosto" : "Folha de Rosto"}
                  </button>
                  <button aria-label={showAprovacao ? "Ocultar Folha de Aprovação" : "Mostrar Folha de Aprovação"} onClick={() => setShowAprovacao(!showAprovacao)} style={{ padding: "8px 12px", background: showAprovacao ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAprovacao ? "✓ Folha de Aprovação" : "Folha de Aprovação"}
                  </button>
                  <button aria-label={showDedicatoria ? "Ocultar Dedicatória" : "Mostrar Dedicatória"} onClick={() => setShowDedicatoria(!showDedicatoria)} style={{ padding: "8px 12px", background: showDedicatoria ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showDedicatoria ? "✓ Dedicatória" : "Dedicatória"}
                  </button>
                  <button aria-label={showAgradecimentos ? "Ocultar Agradecimentos" : "Mostrar Agradecimentos"} onClick={() => setShowAgradecimentos(!showAgradecimentos)} style={{ padding: "8px 12px", background: showAgradecimentos ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAgradecimentos ? "✓ Agradecimentos" : "Agradecimentos"}
                  </button>
                  <button aria-label={showEpigrafe ? "Ocultar Epígrafe" : "Mostrar Epígrafe"} onClick={() => setShowEpigrafe(!showEpigrafe)} style={{ padding: "8px 12px", background: showEpigrafe ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showEpigrafe ? "✓ Epígrafe" : "Epígrafe"}
                  </button>
                  <button aria-label={showResumoPage ? "Ocultar Página Resumo" : "Mostrar Página Resumo"} onClick={() => setShowResumoPage(!showResumoPage)} style={{ padding: "8px 12px", background: showResumoPage ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showResumoPage ? "✓ Página Resumo" : "Página Resumo"}
                  </button>
                  <button aria-label={showAbstractPage ? "Ocultar Página Abstract" : "Mostrar Página Abstract"} onClick={() => setShowAbstractPage(!showAbstractPage)} style={{ padding: "8px 12px", background: showAbstractPage ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAbstractPage ? "✓ Página Abstract" : "Página Abstract"}
                  </button>
                  <button aria-label={showFigList ? "Ocultar Lista de Figuras e Tabelas" : "Mostrar Lista de Figuras e Tabelas"} onClick={() => setShowFigList(!showFigList)} style={{ padding: "8px 12px", background: showFigList ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showFigList ? "✓ Lista Fig./Tab." : "Lista Fig./Tab."}
                  </button>
                  <button aria-label={showAnexos ? "Ocultar Anexos" : "Mostrar Anexos"} onClick={() => setShowAnexos(!showAnexos)} style={{ padding: "8px 12px", background: showAnexos ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAnexos ? "✓ Anexos" : "Anexos"}
                  </button>
                  <button aria-label={showApendices ? "Ocultar Apêndices" : "Mostrar Apêndices"} onClick={() => setShowApendices(!showApendices)} style={{ padding: "8px 12px", background: showApendices ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showApendices ? "✓ Apêndices" : "Apêndices"}
                  </button>
                  <button aria-label={showGlossario ? "Ocultar Glossário" : "Mostrar Glossário"} onClick={() => setShowGlossario(!showGlossario)} style={{ padding: "8px 12px", background: showGlossario ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showGlossario ? "✓ Glossário" : "Glossário"}
                  </button>
                  <button aria-label={showNotasRodape ? "Ocultar Notas de Rodapé" : "Mostrar Notas de Rodapé"} onClick={() => setShowNotasRodape(!showNotasRodape)} style={{ padding: "8px 12px", background: showNotasRodape ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showNotasRodape ? "✓ Notas Rodapé" : "Notas Rodapé"}
                  </button>
                </div>
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
                  language={abstractLang}
                  onLanguageChange={setAbstractLang}
                  resumo={resumo}
                />
                <div style={{ borderTop: "1px solid var(--border-color)", margin: "20px 0", paddingTop: "16px" }}>
                  <p style={{ color: "var(--text-very-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: "600", marginBottom: "12px" }}>
                    Elementos Opcionais
                  </p>

                  <label style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                    Dedicatória
                    <textarea
                      value={dedicatoriaTexto}
                      onChange={e => setDedicatoriaTexto(e.target.value)}
                      rows={3}
                      placeholder="Dedico este trabalho a..."
                      style={{
                        width: "100%", marginTop: "3px", padding: "6px 10px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                        borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                        resize: "vertical", fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                  </label>

                  <label style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "4px", marginTop: "10px" }}>
                    Agradecimentos
                    <textarea
                      value={agradecimentosTexto}
                      onChange={e => setAgradecimentosTexto(e.target.value)}
                      rows={4}
                      placeholder="Agradeço a..."
                      style={{
                        width: "100%", marginTop: "3px", padding: "6px 10px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                        borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                        resize: "vertical", fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                  </label>

                  <label style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "4px", marginTop: "10px" }}>
                    Epígrafe — Texto
                    <textarea
                      value={epigrafeTexto}
                      onChange={e => setEpigrafeTexto(e.target.value)}
                      rows={2}
                      placeholder='"A imaginação é mais importante que o conhecimento."'
                      style={{
                        width: "100%", marginTop: "3px", padding: "6px 10px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                        borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                        resize: "vertical", fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                  </label>

                  <label style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "4px", marginTop: "10px" }}>
                    Epígrafe — Autor
                    <input
                      value={epigrafeAutor}
                      onChange={e => setEpigrafeAutor(e.target.value)}
                      placeholder="Albert Einstein"
                      style={{
                        width: "100%", marginTop: "3px", padding: "6px 10px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                        borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <label style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "4px", marginTop: "10px" }}>
                    Data da Aprovação
                    <input
                      type="date"
                      value={aprovacaoData}
                      onChange={e => setAprovacaoData(e.target.value)}
                      style={{
                        width: "100%", marginTop: "3px", padding: "6px 10px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                        borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </label>
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", margin: "20px 0", paddingTop: "16px" }}>
                  <PosTextuaisManager
                    label="Apêndices"
                    prefix="APÊNDICE"
                    items={apendices}
                    onChange={setApendices}
                  />
                  <PosTextuaisManager
                    label="Anexos"
                    prefix="ANEXO"
                    items={anexos}
                    onChange={setAnexos}
                  />
                  <GlossarioManager
                    entries={glossario}
                    onChange={setGlossario}
                  />
                  <NotasRodapeManager
                    notas={notasRodape}
                    onChange={setNotasRodape}
                    onInsertMarker={(num) => {
                      if (!editor) return;
                      editor.chain().focus().insertContent(`<sup>${num}</sup>`).run();
                    }}
                  />
                </div>
              </>
            )}

            {activeTab === "toc" && (
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-very-dim)", fontWeight: "600", marginBottom: "12px" }}>
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
                          color: item.level === 1 ? "var(--text-secondary)" : item.level === 2 ? "var(--text-muted-2)" : "#64748b",
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
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-very-dim)", fontWeight: "600", marginBottom: "12px" }}>
                  Validação ABNT
                </p>
                {validationIssues.length === 0 ? (
                  <p aria-live="polite" style={{ fontSize: "12px", color: "var(--text-success)" }}>✓ Documento válido!</p>
                ) : (
                  <ul aria-live="polite" style={{ listStyle: "none", padding: 0, gap: "8px", display: "flex", flexDirection: "column" }}>
                    {validationIssues.map((issue, i) => (
                      <li
                        key={i}
                        style={{
                          padding: "8px 10px",
                          background: "var(--bg-app)",
                          borderLeft: `2px solid ${issue.type === "error" ? "#ef4444" : issue.type === "warning" ? "#f59e0b" : "#3b82f6"}`,
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: "var(--text-muted-2)",
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

          <div style={{ padding: "9px 14px", borderTop: "1px solid var(--border-color)", fontSize: "9px", color: "var(--text-faint)" }}>
            Open Source · MIT · rodrigopereiradevelopment
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main id="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Toolbar */}
          <nav className="no-print" aria-label="Ferramentas de formatação" style={{
            background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)",
            padding: "6px 10px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap",
          }}>
            <button aria-label="Negrito" onMouseDown={e => { e.preventDefault(); applyFormat("toggleBold"); }} title="Negrito (Ctrl+B)"
              style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border-color)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
              <BoldIcon />
            </button>
            <button aria-label="Itálico" onMouseDown={e => { e.preventDefault(); applyFormat("toggleItalic"); }} title="Itálico (Ctrl+I)"
              style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border-color)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
              <ItalicIcon />
            </button>
            <button aria-label="Sublinhado" onMouseDown={e => { e.preventDefault(); applyFormat("toggleUnderline"); }} title="Sublinhado (Ctrl+U)"
              style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border-color)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
              <UnderlineIcon />
            </button>
            <button aria-label="Justificar" onMouseDown={e => { e.preventDefault(); applyFormat("setTextAlign", { align: "justify" }); }} title="Justificar"
              style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border-color)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
              <JustifyIcon />
            </button>

            <button aria-label="Atalhos de teclado" onClick={() => setShowShortcuts(true)} title="Atalhos (Ctrl+?)"
              style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border-color)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/></svg>
            </button>
            <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
              {savedMsg && <span aria-live="polite" style={{ color: "var(--text-success)", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px" }}><CheckIcon /> Salvo</span>}
              <button onClick={handleGerarSlides} disabled={slidesLoading} style={{
                background: slidesLoading ? "#6b7280" : "var(--text-success)", border: "none", color: "white",
                padding: "5px 12px", borderRadius: "6px", cursor: slidesLoading ? "wait" : "pointer",
                fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px", position: "relative",
              }}>
                <SlidesIcon /> {slidesLoading ? slidesProgress + "%" : "Slides"}
              </button>
              {slidesLoading && slidesStatus && (
                <span aria-live="polite" style={{ color: "var(--text-muted-2)", fontSize: "10px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {slidesStatus}
                </span>
              )}
              <button onClick={handleExportPdf} style={{
                background: "#2563eb", border: "none", color: "white",
                padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
                fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px",
              }}>
                <PrintIcon /> Exportar PDF
              </button>
            </div>
          </nav>

          {/* Editor Canvas */}
          <div ref={editorContainerRef} style={{
            flex: 1, overflow: "auto", background: "var(--bg-elevated)",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "28px 20px", gap: "20px",
            counterReset: "page",
          }}>
            <Capa {...coverData} />
            {showFolhaRosto && <FolhaRosto {...coverData} />}
            {showAprovacao && (
              <FolhaAprovacao
                autor={coverData.autor}
                titulo={coverData.titulo}
                subtitulo={coverData.subtitulo}
                curso={coverData.curso}
                orientador={coverData.orientador}
                data={aprovacaoData}
              />
            )}
            {showDedicatoria && <Dedicatoria value={dedicatoriaTexto} />}
            {showAgradecimentos && <Agradecimentos value={agradecimentosTexto} />}
            {showEpigrafe && <Epigrafe texto={epigrafeTexto} autor={epigrafeAutor} />}
            {showResumoPage && <ResumoPage value={resumo} palavrasChave={palavrasChave} />}
            {showAbstractPage && <AbstractPage value={abstract} keywords={keywords} language={abstractLang} />}
            <EditorContent editor={editor} />
            {/* Lista de Figuras e Tabelas automática (v0.2) — após o texto */}
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
            {/* Pós-textuais (ABNT: após referências) */}
            {showGlossario && <GlossarioPage entries={glossario} />}
            {showApendices && apendices.length > 0 && <ApendicePage items={apendices} />}
            {showAnexos && anexos.length > 0 && <AnexoPage items={anexos} />}
            {showNotasRodape && notasRodape.length > 0 && <NotasRodapePage notas={notasRodape} />}
          </div>

          {/* Status bar */}
          <div className="no-print" style={{
            background: "var(--bg-surface)", borderTop: "1px solid var(--border-color)",
            padding: "4px 14px", display: "flex", gap: "16px", alignItems: "center", fontSize: "10px",
          }}>
            <span style={{ color: "var(--text-faint)" }}>Palavras: <span style={{ color: "var(--text-very-dim)" }}>{wordCount}</span></span>
            <span style={{ color: "var(--text-faint)" }}>Caracteres: <span style={{ color: "var(--text-very-dim)" }}>{charCount}</span></span>
            <span style={{ color: "var(--text-faint)", marginLeft: "auto" }}>🖥️ ABNT NBR 14724:2011 · v0.2</span>
          </div>
        </main>
      </div>
      )}
      
      {/* ── SHORTCUTS MODAL ── */}
      {showShortcuts && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Atalhos de teclado"
          onClick={() => setShowShortcuts(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-color)",
            borderRadius: "12px", padding: "28px 32px", maxWidth: "420px", width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>⌨ Atalhos de Teclado</h2>
              <button onClick={() => setShowShortcuts(false)} aria-label="Fechar"
                style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "18px", padding: "4px" }}>
                ✕
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "var(--text-very-dim)", letterSpacing: "0.05em" }}>Formatação</p>
              {[
                ["Ctrl+B", "Negrito"],
                ["Ctrl+I", "Itálico"],
                ["Ctrl+U", "Sublinhado"],
                ["Ctrl+Z", "Desfazer"],
                ["Ctrl+Y / Ctrl+Shift+Z", "Refazer"],
              ].map(([key, desc]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{desc}</span>
                  <kbd style={{
                    background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
                    borderRadius: "4px", padding: "2px 8px", fontSize: "11px",
                    color: "var(--text-muted)", fontFamily: "DM Mono, monospace",
                  }}>{key}</kbd>
                </div>
              ))}
              <p style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "var(--text-very-dim)", letterSpacing: "0.05em", marginTop: "4px" }}>Geral</p>
              {[
                ["Ctrl+P", "Exportar PDF"],
                ["Esc", "Fechar modais / popups"],
              ].map(([key, desc]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{desc}</span>
                  <kbd style={{
                    background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
                    borderRadius: "4px", padding: "2px 8px", fontSize: "11px",
                    color: "var(--text-muted)", fontFamily: "DM Mono, monospace",
                  }}>{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
