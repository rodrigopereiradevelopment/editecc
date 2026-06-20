"use client";

interface ResumoPageProps {
  value: string;
  palavrasChave: string[];
}

export function ResumoPage({ value, palavrasChave }: ResumoPageProps) {
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
        textAlign: "center", marginBottom: "1.5em",
      }}>
        RESUMO
      </h1>

      {value && (
        <p style={{
          textAlign: "justify",
          lineHeight: "1.5",
          marginBottom: "1em",
        }}>
          {value}
        </p>
      )}

      {palavrasChave.length > 0 && (
        <p style={{
          lineHeight: "1.5",
          marginTop: "1em",
        }}>
          <strong>Palavras-chave:</strong> {palavrasChave.join(". ")}.
        </p>
      )}
    </div>
  );
}
