"use client";

import type { GlossarioEntry } from "@/components/GlossarioManager";

interface GlossarioPageProps {
  entries: GlossarioEntry[];
}

export function GlossarioPage({ entries }: GlossarioPageProps) {
  const sorted = [...entries].sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));

  return (
    <div style={{
      background: "white", width: "21cm", minHeight: "29.7cm",
      padding: "3cm 2cm 2cm 3cm",
      boxShadow: "0 8px 48px rgba(0,0,0,0.5)", flexShrink: 0,
      fontFamily: "Arial, Helvetica, sans-serif", color: "#111",
      fontSize: "12pt", lineHeight: "1.5",
    }}>
      <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginBottom: "1.5em" }}>
        GLOSSÁRIO
      </h1>
      {sorted.map(entry => (
        <div key={entry.id} style={{ marginBottom: "0.6em" }}>
          <p style={{
            lineHeight: "1.5", textAlign: "justify",
            textIndent: "2.5cm",
          }}>
            <strong>{entry.termo}:</strong> {entry.definicao}
          </p>
        </div>
      ))}
    </div>
  );
}
