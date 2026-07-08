"use client";

import type { NotaRodape } from "@/components/NotasRodapeManager";

interface NotasRodapePageProps {
  notas: NotaRodape[];
}

export function NotasRodapePage({ notas }: NotasRodapePageProps) {
  if (notas.length === 0) return null;

  return (
    <div className="a4-page" style={{
      background: "white", width: "21cm", minHeight: "29.7cm",
      padding: "3cm 2cm 2cm 3cm",
      boxShadow: "0 8px 48px rgba(0,0,0,0.5)", flexShrink: 0,
      fontFamily: "Arial, Helvetica, sans-serif", color: "#111",
      fontSize: "10pt", lineHeight: "1.0",
    }}>
      <hr style={{
        width: "3cm", border: "none", borderTop: "1px solid #111",
        marginBottom: "0.5em", textAlign: "left", marginLeft: 0,
      }} />
      {notas.map(nota => (
        <p key={nota.id} style={{
          lineHeight: "1.0", marginBottom: "4pt",
          textAlign: "justify", fontSize: "10pt",
        }}>
          <sup style={{ fontSize: "10pt" }}>{nota.numero}</sup> {nota.texto}
        </p>
      ))}
    </div>
  );
}
