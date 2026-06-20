"use client";

interface FolhaAprovacaoProps {
  autor: string;
  titulo: string;
  subtitulo?: string;
  curso: string;
  orientador: string;
  data?: string;
}

interface Examinador {
  nome: string;
  instituicao: string;
}

const font: React.CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#111",
};

export function FolhaAprovacao({
  autor, titulo, subtitulo, curso, orientador, data,
}: FolhaAprovacaoProps) {
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
      ...font,
      fontSize: "12pt",
      lineHeight: "1.5",
    }}>
      <p style={{
        ...font, fontSize: "12pt", fontWeight: "bold",
        textAlign: "center", textTransform: "uppercase",
      }}>
        {autor || "NOME DO(S) AUTOR(ES)"}
      </p>

      <div style={{ flex: "0 0 4cm" }} />

      <div style={{ textAlign: "center" }}>
        <p style={{
          ...font, fontSize: "14pt", fontWeight: "bold",
          textTransform: "uppercase", lineHeight: "1.5",
        }}>
          {titulo || "TÍTULO DO TRABALHO"}
        </p>
        {subtitulo && (
          <p style={{ ...font, fontSize: "12pt", marginTop: "4pt" }}>
            {subtitulo}
          </p>
        )}
      </div>

      <div style={{ flex: "0 0 2cm" }} />

      <div style={{
        marginLeft: "50%",
        textAlign: "justify",
      }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          Trabalho de Conclusão de Curso apresentado em{" "}
          {data || "__/__/____"} perante a Banca Examinadora
          do Curso de <strong>{curso || "[curso]"}</strong>,
          como exigência parcial para obtenção da Habilitação
          Profissional Técnica de Nível Médio.
        </p>
      </div>

      <div style={{ flex: "0 0 1.5cm" }} />

      <p style={{
        ...font, fontSize: "12pt", fontWeight: "bold",
        textAlign: "center", marginBottom: "1.5cm",
      }}>
        BANCA EXAMINADORA
      </p>

      {[
        { label: "Presidente / Orientador(a)", nome: orientador },
        { label: "Examinador(a) 1", nome: "" },
        { label: "Examinador(a) 2", nome: "" },
      ].map((ex, i) => (
        <div key={i} style={{ marginBottom: "1.2cm" }}>
          <div style={{
            borderTop: "1px solid #111",
            width: "100%",
            marginBottom: "4pt",
          }} />
          <p style={{
            ...font, fontSize: "11pt", textAlign: "center",
            fontStyle: "italic",
          }}>
            {ex.label}
          </p>
          <p style={{
            ...font, fontSize: "11pt", textAlign: "center",
          }}>
            {ex.nome || "___________________________"}
          </p>
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ textAlign: "center" }}>
        <p style={{ ...font, fontSize: "12pt", fontWeight: "bold", marginBottom: "4pt" }}>
          NOTA
        </p>
        <div style={{
          border: "1px solid #111",
          width: "6cm",
          margin: "0 auto",
          padding: "4pt 0",
          textAlign: "center",
        }}>
          <span style={{ ...font, fontSize: "14pt" }}>_________</span>
          <span style={{ ...font, fontSize: "11pt", marginLeft: "4pt" }}>/ 10</span>
        </div>
      </div>
    </div>
  );
}
