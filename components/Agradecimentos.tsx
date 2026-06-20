"use client";

interface AgradecimentosProps {
  value?: string;
}

export function Agradecimentos({ value }: AgradecimentosProps) {
  return (
    <div style={{
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
        textAlign: "center", marginBottom: "2em",
      }}>
        AGRADECIMENTOS
      </h1>

      <div style={{ textAlign: "justify" }}>
        <p style={{ lineHeight: "1.5", textIndent: "2.5cm" }}>
          {value || "Agradeço a..."}
        </p>
      </div>
    </div>
  );
}
