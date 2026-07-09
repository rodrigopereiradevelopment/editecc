"use client";
// app/editor/page.tsx v0.1.1 FINAL
import { useState, useRef, useEffect, useCallback, useMemo, useReducer } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

// Importar componentes do DeepSeek
import { FolhaRosto } from "@/components/FolhaRosto";
import { ResumoSection } from "@/components/ResumoSection";
import { AbstractSection } from "@/components/AbstractSection";
import { GeradorReferencias } from "@/components/GeradorReferencias";
import { ListaFigurasTabelas } from "@/components/ListaFigurasTabelas";
import { DocumentManager } from "@/components/DocumentManager";
import { PosTextuaisManager } from "@/components/PosTextuaisManager";
import { GlossarioManager } from "@/components/GlossarioManager";
import { NotasRodapeManager } from "@/components/NotasRodapeManager";
import type { PosTextualItem } from "@/components/PosTextuaisManager";
import type { GlossarioEntry } from "@/components/GlossarioManager";
import type { NotaRodape } from "@/components/NotasRodapeManager";

// Importar hooks e libs
import { useDocuments } from "@/hooks/useDocuments";
import type { TargetLang } from "@/hooks/useTranslation";
import { validateDocument, generateTOC, countWords, Reference, type ValidationIssue } from "@/lib/abnt/styles";
import { parseSectionsFull, gerarPPTX, formatBullets } from "@/lib/slideGenerator";
import { useSummarization } from "@/hooks/useSummarization";
import { useTranslation } from "@/hooks/useTranslation";
import { printFullDocument, downloadDoc } from "@/lib/exportDocument";
import { generateFullRtf, downloadRtf } from "@/lib/exportRtf";
import type { EditeccDocument, Examinador } from "@/lib/document";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EditorToolbar } from "@/components/EditorToolbar";
import { EditorCanvas } from "@/components/EditorCanvas";
import { EditorStatusBar } from "@/components/EditorStatusBar";
import { EditorSkeleton } from "@/components/EditorSkeleton";
import { coverReducer, coverInitial, type CoverData, type CoverHistory } from "@/lib/coverReducer";

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  // Estado geral
  const [activeTab, setActiveTab] = useState<"capa" | "editor" | "toc" | "validate" | "refs" | "figuras" | "docs">("capa");
  const [coverHistory, dispatchCover] = useReducer(coverReducer, {
    past: [], present: coverInitial, future: [],
  });
  const coverData = coverHistory.present;

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
  const [showSumario, setShowSumario] = useState(true);
  const [refs, setRefs] = useState<Reference[]>([]);
  const [showFigList, setShowFigList] = useState(false);
  const [dedicatoriaTexto, setDedicatoriaTexto] = useState("");
  const [agradecimentosTexto, setAgradecimentosTexto] = useState("");
  const [epigrafeTexto, setEpigrafeTexto] = useState("");
  const [epigrafeAutor, setEpigrafeAutor] = useState("");
  const [aprovacaoData, setAprovacaoData] = useState("");
  const [aprovacaoCidade, setAprovacaoCidade] = useState("");
  const [examinadores, setExaminadores] = useState<Examinador[]>([]);
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
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => (typeof window !== "undefined" ? (localStorage.getItem("editecc-theme") as "dark" | "light") : "dark") || "dark");
  const FONT_KEY = "editecc-editor-font";
  const [editorFontSize, setEditorFontSize] = useState<string>(() => {
    if (typeof window === "undefined") return "12pt";
    try { return localStorage.getItem(FONT_KEY) || "12pt"; } catch { return "12pt"; }
  });

  // ─── SUMARIZAÇÃO (v0.8) ──────────────────────────────────────────────────
  const {
    summarize, loadModel: loadSumModel,
    loading: sumLoading, progress: sumProgress, modelStatus: sumModelStatus, error: sumError,
  } = useSummarization();

  const {
    translate, loadModel: loadTransModel,
    modelStatus: transModelStatus, error: transError,
  } = useTranslation();

  // Sincroniza sumProgress → slidesProgress durante download do modelo
  useEffect(() => {
    if (slidesLoading && sumModelStatus === "downloading" && sumProgress > 0) {
      setSlidesProgress(sumProgress);
      setSlidesStatus(`Baixando modelo de sumarização… (${sumProgress}%, ~300MB, único download)`);
    }
  }, [sumProgress, sumModelStatus, slidesLoading]);

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
    const { cover, resumo, abstract, refs, content } = currentDoc;
    if (cover.autor || cover.titulo || resumo || abstract || refs.length > 0) return false;
    const DEFAULT_CONTENT = "<h1>1 INTRODUÇÃO</h1><p></p>";
    return content.trim() === DEFAULT_CONTENT || content.length <= DEFAULT_CONTENT.length + 5;
  }, [currentDoc]);

  // Debounce coverData para o canvas (evita re-render a cada caractere)
  const [debouncedCover, setDebouncedCover] = useState(coverData);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCover(coverData), 400);
    return () => clearTimeout(t);
  }, [coverData]);

  // Editor (Tiptap)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        underline: false,
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
        spellcheck: "true",
        lang: "pt-BR",
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
    const cover = {
      ...doc.cover,
      autores: doc.cover.autores?.length ? doc.cover.autores : [doc.cover.autor || ""],
    };
    dispatchCover({ type: "RESET", cover });
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
    setAprovacaoCidade(doc.aprovacaoCidade || "");
    setExaminadores(doc.examinadores || []);
    setShowFolhaRosto(doc.showFolhaRosto);
    setShowAprovacao(doc.showAprovacao);
    setShowDedicatoria(doc.showDedicatoria);
    setShowAgradecimentos(doc.showAgradecimentos);
    setShowEpigrafe(doc.showEpigrafe);
    setShowResumoPage(doc.showResumoPage);
    setShowAbstractPage(doc.showAbstractPage);
    setShowSumario(doc.showSumario ?? true);
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
  const [storageError, setStorageError] = useState("");
  const syncToDoc = useCallback(() => {
    if (!currentId) return;
    try {
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
        aprovacaoCidade,
        examinadores,
        showFolhaRosto,
        showAprovacao,
        showDedicatoria,
        showAgradecimentos,
        showEpigrafe,
        showResumoPage,
        showAbstractPage,
        showSumario,
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
      setStorageError("");
      setTimeout(() => setSavedMsg(false), 2000);
    } catch (err: unknown) {
      setStorageError(err instanceof Error ? err.message : "Erro ao salvar documento");
    }
  }, [currentId, updateCurrentDoc, coverData, resumo, palavrasChave, abstract, keywords, abstractLang, editor, refs,
    dedicatoriaTexto, agradecimentosTexto, epigrafeTexto, epigrafeAutor, aprovacaoData, aprovacaoCidade, examinadores,
    showFolhaRosto, showAprovacao, showDedicatoria, showAgradecimentos, showEpigrafe,
    showResumoPage, showAbstractPage, showSumario, showFigList,
    anexos, apendices, glossario, notasRodape, showAnexos, showApendices, showGlossario, showNotasRodape]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(syncToDoc, 20000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [syncToDoc]);

  // Tema claro/escuro
  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("editecc-theme", theme);
    return () => document.body.classList.remove("theme-light");
  }, [theme]);

  // Tamanho da interface (sidebar + labels + inputs)
  useEffect(() => {
    const classMap: Record<string, string> = {
      "12pt": "ui-size-p",
      "14pt": "ui-size-m",
      "16pt": "ui-size-g",
      "18pt": "ui-size-xg",
    };
    const cls = classMap[editorFontSize] || "ui-size-p";
    document.body.classList.remove("ui-size-p", "ui-size-m", "ui-size-g", "ui-size-xg");
    document.body.classList.add(cls);
    try { localStorage.setItem(FONT_KEY, editorFontSize); } catch { /* quota */ }
  }, [editorFontSize]);

  // Fechar modal de atalhos com Esc
  useEffect(() => {
    if (!showShortcuts && !showSettings) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowShortcuts(false); setShowSettings(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showShortcuts, showSettings]);

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

  // Exportar PDF — usa iframe oculto com HTML completo de todas as páginas ABNT
  const handleExportPdf = () => {
    printFullDocument().catch((err) =>
      console.error("Erro ao exportar PDF:", err)
    );
  };

  // Exportar DOCX (HTML → .doc — Word abre nativamente)
  const handleExportDocx = useCallback(() => {
    const titulo = coverData.titulo || "documento";
    downloadDoc(titulo);
  }, [coverData.titulo]);

  // Exportar RTF (LibreOffice/Word — \page nativo)
  const handleExportRtf = useCallback(() => {
    const titulo = coverData.titulo || "documento";
    const html = editor?.getHTML() || "";
    const curso = coverData.curso;
    const rtf = generateFullRtf(
      coverData, curso, aprovacaoData, aprovacaoCidade, examinadores, html,
      showDedicatoria, dedicatoriaTexto,
      showAgradecimentos, agradecimentosTexto,
      showEpigrafe, epigrafeTexto, epigrafeAutor,
      showResumoPage, resumo, palavrasChave,
      showAbstractPage, abstract, keywords, abstractLang,
      showFigList, refs,
      showAnexos, anexos,
      showApendices, apendices,
      showGlossario, glossario,
      showNotasRodape, notasRodape,
      undefined, undefined, // siglas, simbolos (TODO: adicionar UI)
    );
    downloadRtf(titulo, rtf);
  }, [coverData, editor, aprovacaoData, aprovacaoCidade, examinadores,
    showDedicatoria, dedicatoriaTexto, showAgradecimentos, agradecimentosTexto,
    showEpigrafe, epigrafeTexto, epigrafeAutor,
    showResumoPage, resumo, palavrasChave, showAbstractPage, abstract, keywords, abstractLang,
    showFigList, refs, showAnexos, anexos, showApendices, apendices,
    showGlossario, glossario, showNotasRodape, notasRodape]);

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

      if (transModelStatus !== "ready") {
        setSlidesStatus("Carregando modelo de tradução… (~600MB, único download)");
        await loadTransModel();
      }
      if (transError) {
        setSlidesStatus(`Erro no modelo de tradução: ${transError}`);
        setTimeout(() => setSlidesLoading(false), 3000);
        return;
      }

      if (sumModelStatus !== "ready") {
        setSlidesStatus("Carregando modelo de sumarização… (~300MB, único download)");
        await loadSumModel();
      }
      if (sumError) {
        setSlidesStatus(`Erro no modelo de sumarização: ${sumError}`);
        setTimeout(() => setSlidesLoading(false), 3000);
        return;
      }

      const summarized = [];
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (!sec.textoCompleto) {
          summarized.push({ titulo: sec.titulo, conteudo: "" });
          continue;
        }

        setSlidesStatus(`Traduzindo ${sec.titulo}… (${i + 1}/${sections.length})`);
        setSlidesProgress(Math.round(((i + 1) / sections.length) * 100));

        // PT → EN
        const enText = await translate(sec.textoCompleto, "en");

        setSlidesStatus(`Resumindo ${sec.titulo}… (${i + 1}/${sections.length})`);
        const sumEn = await summarize(enText);

        // EN → PT
        const sumPt = await translate(sumEn, "pt");

        summarized.push({
          titulo: sec.titulo,
          conteudo: formatBullets(sumPt),
        });
      }

      setSlidesStatus("Gerando arquivo PPTX…");
      setSlidesProgress(100);
      const autoresStr = coverData.autores?.filter(Boolean).join("; ") || coverData.autor || "";
      gerarPPTX(summarized, {
        titulo: coverData.titulo,
        autor: autoresStr,
        curso: coverData.curso,
        orientador: coverData.orientador,
      });
      setSlidesLoading(false);
    } catch (err: any) {
      setSlidesStatus(`Erro ao gerar slides: ${err?.message || "desconhecido"}`);
      setTimeout(() => setSlidesLoading(false), 4000);
    }
  };

  // Ctrl+Shift+S → gerar slides
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleGerarSlides();
      } else if (e.ctrlKey && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        syncToDoc();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleGerarSlides, syncToDoc]);

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
    return <EditorSkeleton />;
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
        .editor-area h1 { font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.5; margin: 2em 0 1em; }
        .editor-area h2 { font-weight: 700; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; }
        .editor-area h3 { font-weight: 700; font-style: italic; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; }
        .editor-area p { line-height: 1.5; text-align: justify; text-indent: 2.5cm; margin-bottom: 0; }
        .editor-area blockquote { font-size: 10pt; line-height: 1.0; margin-left: 4cm; text-align: justify; margin-bottom: 1em; border: none; padding: 0; }
        .abnt-referencia { line-height: 1.0; text-align: justify; margin-bottom: 6pt; }
        .editor-area ul, .editor-area ol { padding-left: 1.5cm; line-height: 1.5; }
        
        /* Tamanho da interface — sidebar + labels + inputs (acessibilidade) */
        body.ui-size-m [aria-label="Painel lateral"],
        body.ui-size-m [aria-label="Painel lateral"] * { font-size: 13px !important; }
        body.ui-size-g [aria-label="Painel lateral"],
        body.ui-size-g [aria-label="Painel lateral"] * { font-size: 15px !important; }
        body.ui-size-xg [aria-label="Painel lateral"],
        body.ui-size-xg [aria-label="Painel lateral"] * { font-size: 17px !important; }
        
        .no-print { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        @media print {
          .no-print { display: none !important; }
          .a4-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            page-break-after: always;
            page-break-inside: avoid;
          }
          .a4-page::after { content: "" !important; }
          @page { size: 210mm 297mm; margin: 0mm; }
          @page :first { margin: 0mm; }
          html, body { margin: 0 !important; padding: 0 !important; }
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
        <ErrorBoundary>
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
              <p style={{ fontSize: "9px", color: "var(--text-faint)", marginTop: "2px" }}>ABNT NBR 14724</p>
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
              <div
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                    e.preventDefault();
                    if (e.shiftKey) dispatchCover({ type: "REDO" });
                    else dispatchCover({ type: "UNDO" });
                  }
                }}
              >
                {/* Undo/Redo buttons */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "2px" }}>
                  <button
                    aria-label="Desfazer alterações da capa (Ctrl+Z)"
                    onClick={() => dispatchCover({ type: "UNDO" })}
                    disabled={coverHistory.past.length === 0}
                    style={{
                      background: "none", border: "1px solid var(--border-color)", color: coverHistory.past.length === 0 ? "var(--text-very-dim)" : "var(--text-dim)",
                      cursor: coverHistory.past.length === 0 ? "not-allowed" : "pointer", padding: "3px 6px", borderRadius: "4px",
                      fontSize: "10px", lineHeight: "1",
                    }}
                  >↩ Desfazer</button>
                  <button
                    aria-label="Refazer alterações da capa (Ctrl+Shift+Z)"
                    onClick={() => dispatchCover({ type: "REDO" })}
                    disabled={coverHistory.future.length === 0}
                    style={{
                      background: "none", border: "1px solid var(--border-color)", color: coverHistory.future.length === 0 ? "var(--text-very-dim)" : "var(--text-dim)",
                      cursor: coverHistory.future.length === 0 ? "not-allowed" : "pointer", padding: "3px 6px", borderRadius: "4px",
                      fontSize: "10px", lineHeight: "1",
                    }}
                  >↪ Refazer</button>
                </div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Instituição
                  <input
                    value={coverData.etec}
                    onChange={e => dispatchCover({ type: "SET_FIELD", field: "etec", value: e.target.value })}
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
                    onChange={e => dispatchCover({ type: "SET_FIELD", field: "curso", value: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <div style={{ marginTop: "10px" }}>
                  <p style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", marginBottom: "6px" }}>
                    Autores
                  </p>
                  {coverData.autores.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                      <input
                        value={a}
                        onChange={e => {
                          const next = [...coverData.autores];
                          next[i] = e.target.value;
                          dispatchCover({ type: "SET_AUTORES", value: next });
                        }}
                        placeholder="Nome do autor"
                        style={{
                          flex: 1, padding: "6px 10px",
                          background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                          borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                        }}
                      />
                      {coverData.autores.length > 1 && (
                        <button
                          onClick={() => dispatchCover({ type: "SET_AUTORES", value: coverData.autores.filter((_, j) => j !== i) })}
                          style={{
                            background: "none", border: "1px solid var(--border-color)", color: "#ef4444",
                            cursor: "pointer", padding: "6px 8px", borderRadius: "5px", fontSize: "12px", lineHeight: "1",
                          }}
                        >✕</button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => dispatchCover({ type: "SET_AUTORES", value: [...coverData.autores, ""] })}
                    style={{
                      width: "100%", padding: "6px", marginTop: "4px",
                      background: "none", border: "1px dashed var(--border-color)", color: "var(--text-dim)",
                      borderRadius: "5px", cursor: "pointer", fontSize: "10px",
                    }}
                  >+ Adicionar autor</button>
                </div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Título
                  <input
                    value={coverData.titulo}
                    onChange={e => dispatchCover({ type: "SET_FIELD", field: "titulo", value: e.target.value })}
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
                    onChange={e => dispatchCover({ type: "SET_FIELD", field: "subtitulo", value: e.target.value })}
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
                    onChange={e => dispatchCover({ type: "SET_FIELD", field: "orientador", value: e.target.value })}
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
                    onChange={e => dispatchCover({ type: "SET_FIELD", field: "local", value: e.target.value })}
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
                    onChange={e => dispatchCover({ type: "SET_FIELD", field: "ano", value: e.target.value })}
                    style={{
                      width: "100%", marginTop: "3px", padding: "6px 10px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                      borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <button aria-expanded={showFolhaRosto} aria-label={showFolhaRosto ? "Ocultar Folha de Rosto" : "Mostrar Folha de Rosto"} onClick={() => setShowFolhaRosto(!showFolhaRosto)} style={{ padding: "8px 12px", background: showFolhaRosto ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showFolhaRosto ? "✓ Folha de Rosto" : "Folha de Rosto"}
                  </button>
                  <button aria-expanded={showAprovacao} aria-label={showAprovacao ? "Ocultar Folha de Aprovação" : "Mostrar Folha de Aprovação"} onClick={() => setShowAprovacao(!showAprovacao)} style={{ padding: "8px 12px", background: showAprovacao ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAprovacao ? "✓ Folha de Aprovação" : "Folha de Aprovação"}
                  </button>
                  <button aria-expanded={showDedicatoria} aria-label={showDedicatoria ? "Ocultar Dedicatória" : "Mostrar Dedicatória"} onClick={() => setShowDedicatoria(!showDedicatoria)} style={{ padding: "8px 12px", background: showDedicatoria ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showDedicatoria ? "✓ Dedicatória" : "Dedicatória"}
                  </button>
                  <button aria-expanded={showAgradecimentos} aria-label={showAgradecimentos ? "Ocultar Agradecimentos" : "Mostrar Agradecimentos"} onClick={() => setShowAgradecimentos(!showAgradecimentos)} style={{ padding: "8px 12px", background: showAgradecimentos ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAgradecimentos ? "✓ Agradecimentos" : "Agradecimentos"}
                  </button>
                  <button aria-expanded={showEpigrafe} aria-label={showEpigrafe ? "Ocultar Epígrafe" : "Mostrar Epígrafe"} onClick={() => setShowEpigrafe(!showEpigrafe)} style={{ padding: "8px 12px", background: showEpigrafe ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showEpigrafe ? "✓ Epígrafe" : "Epígrafe"}
                  </button>
                  <button aria-expanded={showResumoPage} aria-label={showResumoPage ? "Ocultar Página Resumo" : "Mostrar Página Resumo"} onClick={() => setShowResumoPage(!showResumoPage)} style={{ padding: "8px 12px", background: showResumoPage ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showResumoPage ? "✓ Página Resumo" : "Página Resumo"}
                  </button>
                  <button aria-expanded={showAbstractPage} aria-label={showAbstractPage ? "Ocultar Página Abstract" : "Mostrar Página Abstract"} onClick={() => setShowAbstractPage(!showAbstractPage)} style={{ padding: "8px 12px", background: showAbstractPage ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAbstractPage ? "✓ Página Abstract" : "Página Abstract"}
                  </button>
                  <button aria-expanded={showSumario} aria-label={showSumario ? "Ocultar Sumário" : "Mostrar Sumário"} onClick={() => setShowSumario(!showSumario)} style={{ padding: "8px 12px", background: showSumario ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showSumario ? "✓ Sumário" : "Sumário"}
                  </button>
                  <button aria-expanded={showFigList} aria-label={showFigList ? "Ocultar Lista de Figuras e Tabelas" : "Mostrar Lista de Figuras e Tabelas"} onClick={() => setShowFigList(!showFigList)} style={{ padding: "8px 12px", background: showFigList ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showFigList ? "✓ Lista Fig./Tab." : "Lista Fig./Tab."}
                  </button>
                  <button aria-expanded={showAnexos} aria-label={showAnexos ? "Ocultar Anexos" : "Mostrar Anexos"} onClick={() => setShowAnexos(!showAnexos)} style={{ padding: "8px 12px", background: showAnexos ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showAnexos ? "✓ Anexos" : "Anexos"}
                  </button>
                  <button aria-expanded={showApendices} aria-label={showApendices ? "Ocultar Apêndices" : "Mostrar Apêndices"} onClick={() => setShowApendices(!showApendices)} style={{ padding: "8px 12px", background: showApendices ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showApendices ? "✓ Apêndices" : "Apêndices"}
                  </button>
                  <button aria-expanded={showGlossario} aria-label={showGlossario ? "Ocultar Glossário" : "Mostrar Glossário"} onClick={() => setShowGlossario(!showGlossario)} style={{ padding: "8px 12px", background: showGlossario ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
                    {showGlossario ? "✓ Glossário" : "Glossário"}
                  </button>
                  <button aria-expanded={showNotasRodape} aria-label={showNotasRodape ? "Ocultar Notas de Rodapé" : "Mostrar Notas de Rodapé"} onClick={() => setShowNotasRodape(!showNotasRodape)} style={{ padding: "8px 12px", background: showNotasRodape ? "var(--bg-active)" : "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500" }}>
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

                  <label style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "4px", marginTop: "10px" }}>
                    Cidade da Aprovação
                    <input
                      value={aprovacaoCidade}
                      onChange={e => setAprovacaoCidade(e.target.value)}
                      placeholder="Ex: Mogi Mirim"
                      style={{
                        width: "100%", marginTop: "3px", padding: "6px 10px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                        borderRadius: "5px", fontSize: "12px", outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </label>

                  {/* Examinadores */}
                  <div style={{ marginTop: "12px" }}>
                    <p style={{ color: "var(--text-dim)", fontSize: "10px", textTransform: "uppercase", marginBottom: "6px" }}>
                      Examinadores da Banca
                    </p>
                    {examinadores.map((ex, i) => (
                      <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "8px", marginBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ color: "var(--text-dim)", fontSize: "9px", textTransform: "uppercase" }}>Examinador(a) {i + 1}</span>
                          <button
                            onClick={() => setExaminadores(examinadores.filter((_, j) => j !== i))}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "10px", padding: "2px 4px" }}
                          >✕</button>
                        </div>
                        <input
                          value={ex.nome}
                          onChange={e => {
                            const next = [...examinadores];
                            next[i] = { ...next[i], nome: e.target.value };
                            setExaminadores(next);
                          }}
                          placeholder="Nome"
                          style={{
                            width: "100%", marginBottom: "4px", padding: "5px 8px",
                            background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                            borderRadius: "4px", fontSize: "11px", outline: "none", boxSizing: "border-box",
                          }}
                        />
                        <div style={{ display: "flex", gap: "4px" }}>
                          <input
                            value={ex.titulo}
                            onChange={e => {
                              const next = [...examinadores];
                              next[i] = { ...next[i], titulo: e.target.value };
                              setExaminadores(next);
                            }}
                            placeholder="Título (ex: Prof. Especialista)"
                            style={{
                              flex: 1, padding: "5px 8px",
                              background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                              borderRadius: "4px", fontSize: "11px", outline: "none", boxSizing: "border-box",
                            }}
                          />
                          <input
                            value={ex.instituicao}
                            onChange={e => {
                              const next = [...examinadores];
                              next[i] = { ...next[i], instituicao: e.target.value };
                              setExaminadores(next);
                            }}
                            placeholder="Instituição"
                            style={{
                              flex: 1, padding: "5px 8px",
                              background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-muted)",
                              borderRadius: "4px", fontSize: "11px", outline: "none", boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setExaminadores([...examinadores, { nome: "", instituicao: "", titulo: "Professor" }])}
                      style={{
                        width: "100%", padding: "6px", background: "none",
                        border: "1px dashed var(--border-color)", color: "var(--text-dim)",
                        borderRadius: "6px", cursor: "pointer", fontSize: "10px",
                      }}
                    >+ Adicionar Examinador</button>
                  </div>
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
        </ErrorBoundary>

        {/* ── MAIN ── */}
        <ErrorBoundary>
        <main id="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Toolbar */}
          <EditorToolbar
            applyFormat={applyFormat}
            handleGerarSlides={handleGerarSlides}
            handleExportPdf={handleExportPdf}
            handleExportDocx={handleExportDocx}
            handleExportRtf={handleExportRtf}
            handleSave={syncToDoc}
            slidesLoading={slidesLoading}
            slidesProgress={slidesProgress}
            slidesStatus={slidesStatus}
            savedMsg={savedMsg}
            storageError={storageError}
            onOpenShortcuts={() => setShowShortcuts(true)}
            onOpenSettings={() => setShowSettings(true)}
          />

          {/* Editor Canvas */}
          <EditorCanvas
            coverData={debouncedCover}
            editor={editor}
            editorContainerRef={editorContainerRef}
            showFolhaRosto={showFolhaRosto}
            showAprovacao={showAprovacao}
            showDedicatoria={showDedicatoria}
            showAgradecimentos={showAgradecimentos}
            showEpigrafe={showEpigrafe}
            showResumoPage={showResumoPage}
            showAbstractPage={showAbstractPage}
            showSumario={showSumario}
            showFigList={showFigList}
            showGlossario={showGlossario}
            showApendices={showApendices}
            showAnexos={showAnexos}
            showNotasRodape={showNotasRodape}
            dedicatoriaTexto={dedicatoriaTexto}
            agradecimentosTexto={agradecimentosTexto}
            epigrafeTexto={epigrafeTexto}
            epigrafeAutor={epigrafeAutor}
            aprovacaoData={aprovacaoData}
            aprovacaoCidade={aprovacaoCidade}
            examinadores={examinadores}
            resumo={resumo}
            palavrasChave={palavrasChave}
            abstract={abstract}
            keywords={keywords}
            abstractLang={abstractLang}
            refs={refs}
            anexos={anexos}
            apendices={apendices}
            glossario={glossario}
            notasRodape={notasRodape}
          />

          {/* Status bar */}
          <EditorStatusBar wordCount={wordCount} charCount={charCount} />
        </main>
        </ErrorBoundary>
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
                ["H1 / H2 / H3", "Títulos ABNT"],
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
                ["Ctrl+D", "Exportar .doc"],
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

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Configurações"
          onClick={() => setShowSettings(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-color)",
            borderRadius: "12px", padding: "28px 32px", maxWidth: "380px", width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                Configurações
              </h2>
              <button onClick={() => setShowSettings(false)} aria-label="Fechar"
                style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "18px", padding: "4px" }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Tema */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Tema</span>
                <button
                  aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
                  aria-pressed={theme === "light"}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  style={{
                    background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
                    color: "var(--text-dim)", cursor: "pointer", padding: "5px 12px",
                    borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {theme === "dark" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  )}
                  {theme === "dark" ? "Claro" : "Escuro"}
                </button>
              </div>

              {/* Tamanho da fonte do editor */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-very-dim)", marginBottom: "6px" }}>Tamanho da interface</p>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[
                    { label: "P", value: "12pt", title: "Padrão" },
                    { label: "M", value: "14pt", title: "Médio" },
                    { label: "G", value: "16pt", title: "Grande" },
                    { label: "XG", value: "18pt", title: "Extra Grande" },
                  ].map(({ label, value, title }) => (
                    <button
                      key={value}
                      aria-label={title}
                      aria-pressed={editorFontSize === value}
                      onClick={() => setEditorFontSize(value)}
                      title={title}
                      style={{
                        flex: 1, padding: "6px 0", borderRadius: "6px", cursor: "pointer",
                        fontSize: "12px", fontWeight: editorFontSize === value ? "700" : "400",
                        border: editorFontSize === value ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                        background: editorFontSize === value ? "var(--accent-dim)" : "var(--bg-elevated)",
                        color: editorFontSize === value ? "var(--accent)" : "var(--text-dim)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modelos de IA */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-very-dim)", marginBottom: "8px" }}>Modelos de IA</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Tradução (NLLB-200)</span>
                  <span style={{ color: "var(--text-success)" }}>✓ Cache</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  <span>Sumarização</span>
                  <span style={{ color: "var(--text-success)" }}>✓ Cache</span>
                </div>
                <button
                  onClick={async () => {
                    localStorage.removeItem("editecc-model-nllb");
                    localStorage.removeItem("editecc-model-sum");
                    try {
                      const keys = await caches.keys();
                      await Promise.all(keys.filter(k => k.includes("transformers") || k.includes("huggingface")).map(k => caches.delete(k)));
                    } catch {}
                    alert("Cache de modelos de IA limpo. Recarregue a página e tente novamente.");
                  }}
                  style={{
                    marginTop: "8px", padding: "4px 10px", background: "none",
                    border: "1px solid var(--border-color)", borderRadius: "5px",
                    cursor: "pointer", fontSize: "10px", color: "var(--text-dim)",
                  }}
                >
                  Limpar cache dos modelos
                </button>
              </div>

              {/* Versão */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Versão</span>
                  <span style={{ fontFamily: "DM Mono, monospace" }}>v0.9.9</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  <span>Licença</span>
                  <span>MIT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
