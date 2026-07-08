"use client";
import { useState, type ReactNode } from "react";

const BoldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const ItalicIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const UnderlineIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>;
const JustifyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CheckIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const SlidesIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const PrintIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const DocxIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const SettingsIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
const KeyboardIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/></svg>;
const SaveIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

const btnBase: React.CSSProperties = {
  background: "none", border: "none", color: "var(--text-dim)",
  cursor: "pointer", padding: "5px 7px", borderRadius: "5px",
  display: "flex", alignItems: "center",
};

interface EditorToolbarProps {
  applyFormat: (command: string, attrs?: Record<string, unknown>) => void;
  handleGerarSlides: () => void;
  handleExportPdf: () => void;
  handleExportDocx: () => void;
  handleSave: () => void;
  slidesLoading: boolean;
  slidesProgress: number;
  slidesStatus: string;
  savedMsg: boolean;
  storageError: string;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
}

function ToolbarBtn({ label, title, onMouseDown, children }: {
  label: string; title: string; onMouseDown: (e: any) => void; children: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      aria-label={label}
      onMouseDown={onMouseDown}
      title={title}
      style={{ ...btnBase, background: hover ? "var(--border-color)" : "none", color: hover ? "var(--text-secondary)" : "var(--text-dim)" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  applyFormat, handleGerarSlides, handleExportPdf, handleExportDocx, handleSave,
  slidesLoading, slidesProgress, slidesStatus, savedMsg, storageError, onOpenShortcuts, onOpenSettings,
}: EditorToolbarProps) {
  return (
    <nav className="no-print" aria-label="Ferramentas de formatação" style={{
      background: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)",
      padding: "6px 10px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap",
    }}>
      <ToolbarBtn label="Negrito" title="Negrito (Ctrl+B)" onMouseDown={e => { e.preventDefault(); applyFormat("toggleBold"); }}>
        <BoldIcon />
      </ToolbarBtn>
      <ToolbarBtn label="Itálico" title="Itálico (Ctrl+I)" onMouseDown={e => { e.preventDefault(); applyFormat("toggleItalic"); }}>
        <ItalicIcon />
      </ToolbarBtn>
      <ToolbarBtn label="Sublinhado" title="Sublinhado (Ctrl+U)" onMouseDown={e => { e.preventDefault(); applyFormat("toggleUnderline"); }}>
        <UnderlineIcon />
      </ToolbarBtn>
      <ToolbarBtn label="Justificar" title="Justificar" onMouseDown={e => { e.preventDefault(); applyFormat("setTextAlign", { align: "justify" }); }}>
        <JustifyIcon />
      </ToolbarBtn>

      <div className="no-print" style={{ width: "1px", height: "20px", background: "var(--border-color)", margin: "0 4px" }} />

      <ToolbarBtn label="Título 1" title="Título 1 (seção principal)" onMouseDown={e => { e.preventDefault(); applyFormat("toggleHeading", { level: 1 }); }}>
        <span style={{ fontWeight: 700, fontSize: "10px", letterSpacing: "0.3px" }}>H1</span>
      </ToolbarBtn>
      <ToolbarBtn label="Título 2" title="Título 2 (subseção)" onMouseDown={e => { e.preventDefault(); applyFormat("toggleHeading", { level: 2 }); }}>
        <span style={{ fontWeight: 600, fontSize: "10px" }}>H2</span>
      </ToolbarBtn>
      <ToolbarBtn label="Título 3" title="Título 3 (sub-subseção)" onMouseDown={e => { e.preventDefault(); applyFormat("toggleHeading", { level: 3 }); }}>
        <span style={{ fontStyle: "italic", fontWeight: 600, fontSize: "10px" }}>H3</span>
      </ToolbarBtn>

      <ToolbarBtn label="Atalhos de teclado" title="Atalhos (Ctrl+?)" onMouseDown={e => { e.preventDefault(); onOpenShortcuts(); }}>
        <KeyboardIcon />
      </ToolbarBtn>
      <ToolbarBtn label="Configurações" title="Configurações" onMouseDown={e => { e.preventDefault(); onOpenSettings(); }}>
        <SettingsIcon />
      </ToolbarBtn>

      <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
        {storageError ? (
          <span aria-live="assertive" style={{ color: "#ef4444", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", maxWidth: "200px" }}>
            ⚠ {storageError}
          </span>
        ) : savedMsg && (
          <span aria-live="polite" style={{ color: "var(--text-success)", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px" }}>
            <CheckIcon /> Salvo
          </span>
        )}
        <button onClick={handleSave} title="Salvar agora" style={{
          background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-dim)",
          padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
          fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px",
        }}>
          <SaveIcon /> Salvar
        </button>
        <button onClick={handleGerarSlides} disabled={slidesLoading} style={{
          background: slidesLoading ? "#6b7280" : "var(--text-success)", border: "none", color: "white",
          padding: "5px 12px", borderRadius: "6px", cursor: slidesLoading ? "wait" : "pointer",
          fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px", position: "relative",
        }}>
          <SlidesIcon /> {slidesLoading ? slidesProgress + "%" : "Slides"}
        </button>
        {slidesLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "200px" }}>
            {slidesStatus && (
              <span aria-live="polite" style={{
                color: slidesStatus.startsWith("Erro") ? "#ef4444" : "var(--text-muted-2)",
                fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {slidesStatus}
              </span>
            )}
            {slidesProgress > 0 && slidesProgress < 100 && (
              <div style={{ width: "100%", height: "4px", background: "var(--border-color)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${slidesProgress}%`, height: "100%", background: "#3b82f6", borderRadius: "2px", transition: "width 0.3s ease" }} />
              </div>
            )}
          </div>
        )}
        <button onClick={handleExportDocx} style={{
          background: "#0d9488", border: "none", color: "white",
          padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
          fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px",
        }}>
          <DocxIcon /> .doc
        </button>
        <button onClick={handleExportPdf} style={{
          background: "#2563eb", border: "none", color: "white",
          padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
          fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px",
        }}>
          <PrintIcon /> PDF
        </button>
      </div>
    </nav>
  );
}
