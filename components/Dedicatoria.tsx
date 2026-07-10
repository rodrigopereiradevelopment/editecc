"use client";

interface DedicatoriaProps {
  value?: string;
}

export function Dedicatoria({ value }: DedicatoriaProps) {
  return (
    <div className="a4-page" style={{
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
        <p style={{ lineHeight: "1.5" }}>
          {value || "Dedico este trabalho a..."}
        </p>
      </div>
    </div>
  );
}
