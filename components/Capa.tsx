"use client";

// Capa conforme modelo oficial ETEC DCMS (2022)
// Fonte Arial, título 14pt maiúsculas, instituição 14pt maiúsculas
// Autor centralizado, cidade/ano no rodapé

interface CapaProps {
  etec:      string;
  curso:     string;
  autor:     string;
  autores:   string[];
  titulo:    string;
  subtitulo?: string;
  local:     string;
  ano:       string;
}

const font: React.CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#111",
  lineHeight: "1.5",
};

export function Capa({ etec, curso, autor, autores, titulo, subtitulo, local, ano }: CapaProps) {
  // Só renderiza se tiver pelo menos título ou autor
  if (!titulo && !autor && !autores.some(Boolean) && !etec) return null;

  const nomes = autores.some(Boolean) ? autores : [autor];

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
      alignItems: "center",
      ...font,
      fontSize: "12pt",
    }}>

      {/* ── Instituição (topo, Arial 14, maiúsculas, centralizado) ── */}
      <p style={{
        ...font,
        fontSize: "14pt",
        fontWeight: "bold",
        textTransform: "uppercase",
        textAlign: "center",
        marginBottom: "4pt",
      }}>
        {etec || "CENTRO ESTADUAL DE EDUCAÇÃO TECNOLÓGICA PAULA SOUZA"}
      </p>

      {/* Curso abaixo da instituição, Arial 12 */}
      {curso && (
        <p style={{
          ...font,
          fontSize: "12pt",
          textAlign: "center",
          marginBottom: "0",
        }}>
          {curso}
        </p>
      )}

      {/* ── Autor(es) (centralizado, após ~8 enters Arial 12 da instituição) ── */}
      <div style={{ flex: "0 0 4cm" }} />
      <div style={{ textAlign: "center" }}>
        {nomes.map((n, i) => (
          <p key={i} style={{
            ...font, fontSize: "12pt", fontWeight: "bold",
            textTransform: "uppercase", textAlign: "center",
          }}>
            {n || "NOME DO(S) AUTOR(ES)"}
          </p>
        ))}
      </div>

      {/* ── Título (centralizado verticalmente, Arial 14, maiúsculas) ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <p style={{
          ...font,
          fontSize: "14pt",
          fontWeight: "bold",
          textTransform: "uppercase",
          textAlign: "center",
        }}>
          {titulo || "TÍTULO DO TRABALHO"}
        </p>
        {subtitulo && (
          <p style={{
            ...font,
            fontSize: "12pt",
            textAlign: "center",
            marginTop: "6pt",
          }}>
            {subtitulo}
          </p>
        )}
      </div>

      {/* ── Cidade e Ano (centralizados, fundo da página) ── */}
      <div style={{ textAlign: "center" }}>
        <p style={{ ...font, fontSize: "12pt" }}>{local || "Cidade"}</p>
        <p style={{ ...font, fontSize: "12pt" }}>{ano || new Date().getFullYear()}</p>
      </div>
    </div>
  );
}