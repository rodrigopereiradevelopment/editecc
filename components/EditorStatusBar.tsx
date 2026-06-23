"use client";

interface EditorStatusBarProps {
  wordCount: number;
  charCount: number;
}

export function EditorStatusBar({ wordCount, charCount }: EditorStatusBarProps) {
  return (
    <div className="no-print" style={{
      background: "var(--bg-surface)", borderTop: "1px solid var(--border-color)",
      padding: "4px 14px", display: "flex", gap: "16px", alignItems: "center", fontSize: "10px",
    }}>
      <span style={{ color: "var(--text-faint)" }}>
        Palavras: <span style={{ color: "var(--text-very-dim)" }}>{wordCount}</span>
      </span>
      <span style={{ color: "var(--text-faint)" }}>
        Caracteres: <span style={{ color: "var(--text-very-dim)" }}>{charCount}</span>
      </span>
      <span style={{ color: "var(--text-faint)", marginLeft: "auto" }}>
        🖥️ ABNT NBR 14724:2011
      </span>
    </div>
  );
}
