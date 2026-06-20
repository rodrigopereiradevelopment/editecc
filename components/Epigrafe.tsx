"use client";

interface EpigrafeProps {
  texto?: string;
  autor?: string;
}

export function Epigrafe({ texto, autor }: EpigrafeProps) {
  return (
    <div style={{
      background: "white",
      width: "21cm",
      minHeight: "29.7cm",
      padding: "3cm 2cm 2cm 3cm",
      boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, Helvetica, sans-serif",
      color: "#111",
      fontSize: "12pt",
      lineHeight: "1.5",
    }}>
      <div style={{ flex: 1 }} />
      <div style={{
        width: "60%",
        marginLeft: "40%",
        textAlign: "justify",
      }}>
        <p style={{
          fontStyle: "italic",
          lineHeight: "1.5",
          marginBottom: "8pt",
        }}>
          {texto || "\"A imaginação é mais importante que o conhecimento.\""}
        </p>
        <p style={{
          textAlign: "right",
          fontSize: "11pt",
        }}>
          {autor ? `— ${autor}` : "— Albert Einstein"}
        </p>
      </div>
    </div>
  );
}
