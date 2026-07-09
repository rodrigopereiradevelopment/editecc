"use client";

import { useMemo } from "react";
import { generateTOC } from "@/lib/abnt/styles";

interface SumarioPageProps {
  editorHtml: string;
}

const INDENT = [0, 0.75, 1.5];

export function SumarioPage({ editorHtml }: SumarioPageProps) {
  const entries = useMemo(() => generateTOC(editorHtml), [editorHtml]);

  return (
    <div className="a4-page" style={{
      background: "white",
      width: "21cm",
      minHeight: "29.7cm",
      padding: "3cm 2cm 2cm 3cm",
      boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
      flexShrink: 0,
      fontFamily: "Arial, Helvetica, sans-serif",
      color: "#111",
      fontSize: "12pt",
      lineHeight: "1.5",
    }}>
      <h1 style={{
        fontSize: "12pt", fontWeight: 700, textTransform: "uppercase",
        textAlign: "center", marginBottom: "1.5em",
      }}>
        SUMÁRIO
      </h1>

      {entries.length === 0 && (
        <p style={{ textAlign: "center", fontStyle: "italic" }}>
          Nenhum título detectado no conteúdo.
        </p>
      )}

      {entries.map((entry) => (
        <p key={entry.id} style={{
          fontSize: "12pt",
          lineHeight: "1.5",
          marginBottom: "0.3em",
          paddingLeft: `${INDENT[entry.level - 1]}cm`,
          textAlign: "justify",
        }}>
          {entry.text}
        </p>
      ))}
    </div>
  );
}
