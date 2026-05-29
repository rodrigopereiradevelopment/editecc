"use client";
// app/editor/page.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { ABNT_STYLES, generateTOC, validateDocument, type TocEntry, type ValidationResult } from "@/lib/abnt/styles";
import { useAutosave } from "@/hooks/useAutosave";
import { useTauri } from "@/hooks/useTauri";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const BoldIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const ItalicIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const UnderlineIcon= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>;
const SaveIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const OpenIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const PrintIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const ExportIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CheckIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const JustifyIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const ListIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/></svg>;

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface CoverData {
  instituicao: string;
  autor: string;
  titulo: string;
  subtitulo: string;
  cidade: string;
  ano: string;
}

const EMPTY_COVER: CoverData = {
  instituicao: "", autor: "", titulo: "",
  subtitulo: "", cidade: "", ano: String(new Date().getFullYear()),
};

// ─── CAPA ABNT ────────────────────────────────────────────────────────────────
function CoverPage({ d }: { d: CoverData }) {
  const cs: React.CSSProperties = {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: "12pt", lineHeight: "1.5", color: "#111",
    width: "100%", textAlign: "center",
  };
  return (
    <div style={{
      width: "21cm", minHeight: "29.7cm",
      padding: "3cm 2cm 2cm 3cm", background: "white",
      boxShadow: "0 8px 48px rgba(0,0,0,0.5)", flexShrink: 0,
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <p style={{ ...cs, fontWeight: "bold", textTransform: "uppercase" }}>
        {d.instituicao || "NOME DA INSTITUIÇÃO"}
      </p>
      <p style={{ ...cs, fontWeight: "bold", textTransform: "uppercase", marginTop: "2cm" }}>
        {d.autor || "NOME DO AUTOR"}
      </p>
      <div style={{ marginTop: "auto", marginBottom: "auto", width: "100%", textAlign: "center" }}>
        <p style={{ ...cs, fontWeight: "bold", textTransform: "uppercase" }}>
          {d.titulo || "TÍTULO DO TRABALHO"}
        </p>
        {d.subtitulo && <p style={{ ...cs, marginTop: "8px" }}>{d.subtitulo}</p>}
      </div>
      <p style={cs}>
        {d.cidade || "Cidade"}<br />{d.ano || new Date().getFullYear()}
      </p>
    </div>
  );
}

// ─── PAINEL CAPA ──────────────────────────────────────────────────────────────
function CoverForm({ d, setD }: { d: CoverData; setD: (v: CoverData) => void }) {
  const fields: [keyof CoverData, string, string][] = [
    ["instituicao", "Instituição", "Ex: ETEC Pedro Ferreira Alves"],
    ["autor", "Autor(es)", "Nome completo"],
    ["titulo", "Título", "Título do trabalho"],
    ["subtitulo", "Subtítulo", "Opcional"],
    ["cidade", "Cidade", "Ex: Mogi Mirim"],
    ["ano", "Ano", String(new Date().getFullYear())],
  ];
  return (
    <div>
      <SideLabel>Dados da Capa</SideLabel>
      {fields.map(([key, label, ph]) => (
        <div key={key} style={{ marginBottom: "10px" }}>
          <p style={{ color: "#475569", fontSize: "10px", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
          </p>
          <input
            value={d[key]}
            onChange={e => setD({ ...d, [key]: e.target.value })}
            placeholder={ph}
            style={{
              width: "100%", background: "#0f1117", border: "1px solid #1e2330",
              color: "#cbd5e1", padding: "6px 10px", borderRadius: "5px",
              fontSize: "12px", outline: "none", boxSizing: "border-box",
            }}
            onFocus={e => (e.target.style.borderColor = "#3b82f6")}
            onBlur={e => (e.target.style.borderColor = "#1e2330")}
          />
        </div>
      ))}
    </div>
  );
}

// ─── PAINEL SUMÁRIO ───────────────────────────────────────────────────────────
function TOCPanel({ entries }: { entries: TocEntry[] }) {
  return (
    <div>
      <SideLabel>Sumário Automático</SideLabel>
      {entries.length === 0 ? (
        <p style={{ padding: "10px", background: "#0a0c11", borderRadius: "6px", color: "#334155", fontSize: "11px", lineHeight: "1.6" }}>
          Aplique Título 1/2/3 no texto para o sumário aparecer aqui.
        </p>
      ) : entries.map((e, i) => (
        <div key={i} style={{
          paddingLeft: `${(e.level - 1) * 14 + 6}px`, paddingTop: "4px", paddingBottom: "4px",
          color: e.level === 1 ? "#e2e8f0" : e.level === 2 ? "#94a3b8" : "#64748b",
          fontSize: "12px",
          borderLeft: `2px solid ${e.level === 1 ? "#3b82f6" : "transparent"}`,
          marginBottom: "1px", cursor: "pointer",
        }}
          onClick={() => document.getElementById(e.id)?.scrollIntoView({ behavior: "smooth" })}
        >
          {e.text}
        </div>
      ))}
    </div>
  );
}

// ─── PAINEL ESTRUTURA ─────────────────────────────────────────────────────────
function StructurePanel() {
  const items: [string, "auto" | "pendente" | "opcional"][] = [
    ["Capa", "auto"], ["Folha de Rosto", "pendente"], ["Errata", "opcional"],
    ["Resumo", "pendente"], ["Abstract", "pendente"], ["Lista de Figuras", "pendente"],
    ["Sumário", "auto"], ["Introdução", "pendente"], ["Desenvolvimento", "pendente"],
    ["Conclusão", "pendente"], ["Referências", "pendente"], ["Apêndices", "opcional"],
  ];
  const clr = { auto: "#10b981", pendente: "#f59e0b", opcional: "#334155" };
  return (
    <div>
      <SideLabel>Estrutura ABNT NBR 14724</SideLabel>
      {items.map(([label, status], i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 10px", marginBottom: "3px",
          background: "#0a0c11", borderRadius: "5px",
        }}>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>{label}</span>
          <span style={{ color: clr[status], fontSize: "10px" }}>{status}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PAINEL VALIDADOR ─────────────────────────────────────────────────────────
function ValidatorPanel({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const run = () => {
    if (editorRef.current) setResults(validateDocument(editorRef.current));
  };
  const clr = { error: "#ef4444", warning: "#f59e0b", info: "#64748b" };
  return (
    <div>
      <SideLabel>Validador ABNT</SideLabel>
      <button onClick={run} style={{
        width: "100%", background: "#1e2330", border: "1px solid #2a3040",
        color: "#94a3b8", padding: "7px", borderRadius: "6px", cursor: "pointer",
        fontSize: "12px", marginBottom: "10px",
      }}>
        ▶ Validar Documento
      </button>
      {results.map((r, i) => (
        <div key={i} style={{
          display: "flex", gap: "8px", padding: "7px 10px", marginBottom: "5px",
          background: "#0a0c11", borderRadius: "5px",
          borderLeft: `2px solid ${clr[r.severity]}`,
        }}>
          <span style={{ fontSize: "11px", flexShrink: 0 }}>{r.ok ? "✓" : "⚠"}</span>
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>{r.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HELPER LABEL ─────────────────────────────────────────────────────────────
function SideLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      color: "#334155", fontSize: "10px", textTransform: "uppercase",
      letterSpacing: "0.08em", fontWeight: "600", marginBottom: "12px",
    }}>
      {children}
    </p>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function EditorPage() {
  const [tab, setTab]           = useState<"structure" | "cover" | "toc" | "validate">("structure");
  const [cover, setCover]       = useState<CoverData>(EMPTY_COVER);
  const [words, setWords]       = useState(0);
  const [chars, setChars]       = useState(0);
  const [style, setStyle]       = useState("texto-corrente");
  const [styleOpen, setStyleOpen] = useState(false);
  const [toc, setToc]           = useState<TocEntry[]>([]);
  const [savedMsg, setSavedMsg] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const tauri = useTauri();

  // ─── Atualiza contagens e sumário ──────────────────────────────────────────
  const update = useCallback(() => {
    if (!editorRef.current) return;
    const t = editorRef.current.innerText || "";
    setWords(t.trim() ? t.trim().split(/\s+/).length : 0);
    setChars(t.length);
    setToc(generateTOC(editorRef.current));
  }, []);

  // ─── Getters para hooks ────────────────────────────────────────────────────
  const getHtml   = useCallback(() => editorRef.current?.innerHTML ?? "", []);
  const getCover  = useCallback(() => cover as unknown as Record<string, string>, [cover]);

  const showSaved = useCallback(() => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }, []);

  // ─── Autosave (IndexedDB) ──────────────────────────────────────────────────
  const { save: autoSave } = useAutosave({
    documentId: "main",
    getHtml,
    getCover,
    onSave: showSaved,
  });

  // ─── Salvar (Tauri ou download) ────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (currentPath) {
      await tauri.saveSilent(currentPath, {
        id: "main", html: getHtml(),
        cover: getCover(), title: cover.titulo,
        updatedAt: new Date().toISOString(),
      });
      showSaved();
    } else {
      const result = await tauri.saveAs({
        id: "main", html: getHtml(),
        cover: getCover(), title: cover.titulo,
        updatedAt: new Date().toISOString(),
      });
      if (result.success && result.path) setCurrentPath(result.path);
      showSaved();
    }
  }, [currentPath, cover, getHtml, getCover, tauri, showSaved]);

  // ─── Abrir documento ───────────────────────────────────────────────────────
  const handleOpen = useCallback(async () => {
    const doc = await tauri.openDocument();
    if (!doc) return;
    if (editorRef.current) editorRef.current.innerHTML = doc.html;
    setCover(doc.cover as unknown as CoverData);
    setCurrentPath(doc.id !== "main" ? doc.id : null);
    update();
  }, [tauri, update]);

  // ─── Carregar autosave ao montar ───────────────────────────────────────────
  useEffect(() => {
    import("@/hooks/useAutosave").then(({ loadDocument }) => {
      loadDocument("main").then(doc => {
        if (!doc) return;
        if (editorRef.current) editorRef.current.innerHTML = doc.html;
        if (doc.cover) setCover(doc.cover as unknown as CoverData);
        update();
      });
    });
  }, [update]);

  // ─── Aplicar estilo ABNT ───────────────────────────────────────────────────
  const applyStyle = (sid: string) => {
    setStyle(sid);
    setStyleOpen(false);
    const s = ABNT_STYLES.find(x => x.id === sid);
    if (s) document.execCommand("formatBlock", false, s.tag);
    editorRef.current?.focus();
  };

  const fmt = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    editorRef.current?.focus();
  };

  const showCover   = cover.titulo || cover.autor || cover.instituicao;
  const curLabel    = ABNT_STYLES.find(s => s.id === style)?.label ?? "Texto Corrente";
  const DIV         = <div style={{ width: "1px", height: "22px", background: "#1e2330", margin: "0 2px" }} />;

  const TBtn = ({ cmd, Icon, title: t }: { cmd: string; Icon: () => JSX.Element; title: string }) => (
    <button
      onMouseDown={e => { e.preventDefault(); fmt(cmd); }}
      title={t}
      style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2330"; (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}
    >
      <Icon />
    </button>
  );

  const TABS: [typeof tab, string][] = [
    ["structure", "Estrutura"], ["cover", "Capa"],
    ["toc", "Sumário"], ["validate", "Validar"],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 3px; }
        .editor-area[contenteditable]:empty:before {
          content: attr(data-ph); color: #9ca3af; pointer-events: none;
          font-style: italic; font-size: 12pt;
          font-family: 'Times New Roman', serif;
        }
        .editor-area h1 { font-size:12pt; font-weight:700; text-transform:uppercase; text-align:center; line-height:1.5; margin:2em 0 1em; }
        .editor-area h2 { font-size:12pt; font-weight:700; text-align:left; line-height:1.5; margin:1.5em 0 0.8em; }
        .editor-area h3 { font-size:12pt; font-weight:700; font-style:italic; text-align:left; line-height:1.5; margin:1.5em 0 0.8em; }
        .editor-area p  { font-size:12pt; line-height:1.5; text-align:justify; text-indent:1.25cm; margin-bottom:0; }
        .editor-area blockquote { font-size:10pt; line-height:1.0; margin-left:4cm; text-align:justify; margin-bottom:1em; border:none; padding:0; }
        .editor-area ul, .editor-area ol { padding-left:1.5em; line-height:1.5; font-size:12pt; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .a4-page { box-shadow: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#0a0c11", overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <div className="no-print" style={{ width: "230px", background: "#0d0f15", borderRight: "1px solid #1e2330", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "14px", borderBottom: "1px solid #1e2330", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "7px", flexShrink: 0, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: "800", fontSize: "13px" }}>E</span>
            </div>
            <div>
              <div style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "15px", letterSpacing: "-0.4px" }}>
                Edite<span style={{ color: "#3b82f6" }}>CC</span>
              </div>
              <div style={{ color: "#1e2d3d", fontSize: "9px", letterSpacing: "0.04em" }}>EDITOR ABNT · v0.1</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1e2330", flexWrap: "wrap" }}>
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: "1 1 50%", padding: "7px 4px", background: "none", border: "none",
                borderBottom: `2px solid ${tab === id ? "#3b82f6" : "transparent"}`,
                color: tab === id ? "#3b82f6" : "#334155", cursor: "pointer",
                fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Conteúdo do painel */}
          <div style={{ flex: 1, overflow: "auto", padding: "14px" }}>
            {tab === "structure" && <StructurePanel />}
            {tab === "cover"     && <CoverForm d={cover} setD={setCover} />}
            {tab === "toc"       && <TOCPanel entries={toc} />}
            {tab === "validate"  && <ValidatorPanel editorRef={editorRef} />}
          </div>

          <div style={{ padding: "9px 14px", borderTop: "1px solid #1e2330", color: "#1e2d3d", fontSize: "9px" }}>
            Open Source · MIT · rodrigopereiradevelopment
          </div>
        </div>

        {/* ── ÁREA PRINCIPAL ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Toolbar */}
          <div className="no-print" style={{ background: "#0d0f15", borderBottom: "1px solid #1e2330", padding: "5px 10px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>

            {/* Abrir */}
            <button onClick={handleOpen} title="Abrir documento" style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "5px 7px", borderRadius: "5px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2330"; (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}>
              <OpenIcon />
            </button>

            {DIV}

            {/* Seletor de estilo */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setStyleOpen(o => !o)} style={{ background: "#161820", border: "1px solid #1e2330", color: "#94a3b8", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "8px", minWidth: "175px", justifyContent: "space-between" }}>
                <span>{curLabel}</span>
                <span style={{ opacity: 0.5, fontSize: "9px" }}>▾</span>
              </button>
              {styleOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200, background: "#0d0f15", border: "1px solid #1e2330", borderRadius: "8px", padding: "4px", minWidth: "215px", boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}>
                  {ABNT_STYLES.map(s => (
                    <button key={s.id} onClick={() => applyStyle(s.id)} style={{ width: "100%", background: s.id === style ? "#161820" : "none", border: "none", color: s.id === style ? "#e2e8f0" : "#64748b", padding: "7px 10px", borderRadius: "5px", textAlign: "left", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {s.label} {s.id === style && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {DIV}
            <TBtn cmd="bold"               Icon={BoldIcon}      title="Negrito (Ctrl+B)" />
            <TBtn cmd="italic"             Icon={ItalicIcon}    title="Itálico (Ctrl+I)" />
            <TBtn cmd="underline"          Icon={UnderlineIcon} title="Sublinhado (Ctrl+U)" />
            <TBtn cmd="justifyFull"        Icon={JustifyIcon}   title="Justificar" />
            {DIV}
            <TBtn cmd="insertUnorderedList" Icon={ListIcon}     title="Lista" />

            {/* Ações à direita */}
            <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
              {savedMsg && (
                <span style={{ color: "#10b981", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px" }}>
                  <CheckIcon /> Salvo
                </span>
              )}
              <button onClick={handleSave} style={{ background: "#161820", border: "1px solid #1e2330", color: "#64748b", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px" }}>
                <SaveIcon /> {currentPath ? "Salvar" : "Salvar como"}
              </button>
              <button onClick={() => tauri.exportHtml(getHtml(), cover.titulo)} style={{ background: "#161820", border: "1px solid #1e2330", color: "#64748b", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px" }}>
                <ExportIcon /> Exportar HTML
              </button>
              <button onClick={() => tauri.exportPdf()} style={{ background: "#2563eb", border: "none", color: "white", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px" }}>
                <PrintIcon /> Exportar PDF
              </button>
            </div>
          </div>

          {/* Canvas do editor */}
          <div style={{ flex: 1, overflow: "auto", background: "#0f1117", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px", gap: "20px" }}>

            {showCover && <CoverPage d={cover} />}

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="a4-page editor-area"
              onInput={update}
              data-ph="Comece a digitar seu TCC aqui…  Use o seletor de estilos para aplicar formatação ABNT."
              style={{
                width: "21cm", minHeight: "29.7cm",
                padding: "3cm 2cm 2cm 3cm",
                background: "white", boxShadow: "0 8px 48px rgba(0,0,0,0.55)", flexShrink: 0,
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: "12pt", lineHeight: "1.5", color: "#111",
                outline: "none", caretColor: "#3b82f6",
              }}
            />
          </div>

          {/* Status bar */}
          <div className="no-print" style={{ background: "#0d0f15", borderTop: "1px solid #1e2330", padding: "4px 14px", display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ color: "#1e2d3d", fontSize: "10px" }}>
              Palavras: <span style={{ color: "#334155" }}>{words}</span>
            </span>
            <span style={{ color: "#1e2d3d", fontSize: "10px" }}>
              Caracteres: <span style={{ color: "#334155" }}>{chars}</span>
            </span>
            {currentPath && (
              <span style={{ color: "#1e2d3d", fontSize: "10px" }} title={currentPath}>
                📄 {currentPath.split(/[\\/]/).pop()}
              </span>
            )}
            <span style={{ color: "#1e2d3d", fontSize: "10px", marginLeft: "auto" }}>
              {tauri.isTauri ? "🖥️ Desktop" : "🌐 Web"} · ABNT NBR 14724:2011
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
