"use client";

import type { PosTextualItem } from "@/components/PosTextuaisManager";

interface ApendicePageProps {
  items: PosTextualItem[];
}

export function ApendicePage({ items }: ApendicePageProps) {
  return (
    <div style={{
      background: "white", width: "21cm", minHeight: "29.7cm",
      padding: "3cm 2cm 2cm 3cm",
      boxShadow: "0 8px 48px rgba(0,0,0,0.5)", flexShrink: 0,
      fontFamily: "Arial, Helvetica, sans-serif", color: "#111",
      fontSize: "12pt", lineHeight: "1.5",
    }}>
      <h1 style={{ fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginBottom: "1.5em" }}>
        APÊNDICES
      </h1>
      {items.map(item => (
        <div key={item.id} style={{ marginBottom: "2em" }}>
          <h2 style={{
            fontSize: "12pt", fontWeight: 700, textAlign: "left",
            marginBottom: "0.5em",
          }}>
            APÊNDICE {item.letra} — {item.titulo}
          </h2>
          {item.conteudo && (
            <p style={{ textAlign: "justify", lineHeight: "1.5", textIndent: "2.5cm" }}>
              {item.conteudo}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
