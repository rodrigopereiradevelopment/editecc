"use client";

// Baseado no modelo oficial ETEC DCMS (2022)
// Fonte Arial, título 14pt, nota explicativa alinhada à direita a partir do centro

interface FolhaRostoProps {
  autor:     string;
  titulo:    string;
  subtitulo?: string;
  orientador: string;
  curso:     string;
  etec:      string;
  local:     string;
  ano:       string;
}

const font: React.CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#111",
};

export function FolhaRosto({
  autor, titulo, subtitulo, orientador, curso, etec, local, ano,
}: FolhaRostoProps) {
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

      {/* ── Autor (topo, centralizado) ── */}
      <p style={{
        ...font,
        fontSize: "12pt",
        fontWeight: "bold",
        textAlign: "center",
        textTransform: "uppercase" as const,
        marginBottom: "0",
      }}>
        {autor || "NOME DO(S) AUTOR(ES)"}
      </p>

      {/* ── Espaço entre autor e título (8~16 enters Arial 12 conforme nº de alunos) ── */}
      <div style={{ flex: "0 0 5cm" }} />

      {/* ── Título + Subtítulo (centralizados verticalmente) ── */}
      <div style={{ textAlign: "center" }}>
        {/* Modelo ETEC: título Arial 14, maiúsculas, centralizado */}
        <p style={{
          ...font,
          fontSize: "14pt",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          lineHeight: "1.5",
        }}>
          {titulo || "TÍTULO DO TRABALHO"}
        </p>
        {subtitulo && (
          <p style={{
            ...font,
            fontSize: "12pt",
            marginTop: "4pt",
            lineHeight: "1.5",
          }}>
            {subtitulo}
          </p>
        )}
      </div>

      {/* ── Espaço entre título e nota ── */}
      <div style={{ flex: "0 0 2cm" }} />

      {/* ── Nota explicativa: alinhada à direita, margem esquerda em 50% ── */}
      <div style={{
        marginLeft: "50%",
        textAlign: "justify" as const,
      }}>
        <p style={{
          ...font,
          fontSize: "12pt",
          lineHeight: "1.0",
        }}>
          Trabalho de Conclusão de Curso apresentado como exigência parcial
          para obtenção da Habilitação Profissional Técnica de Nível Médio de
          Técnico em <strong>{curso || "[curso]"}</strong>,
          à {etec || "Escola Técnica Estadual"},
          sob orientação do Professor <strong>{orientador || "[orientador]"}</strong>.
        </p>
      </div>

      {/* ── Espaço empurrando cidade/ano para o fundo ── */}
      <div style={{ flex: 1 }} />

      {/* ── Cidade e Ano (centralizados, fundo da página) ── */}
      <div style={{ textAlign: "center" }}>
        <p style={{ ...font, fontSize: "12pt" }}>{local || "Cidade"}</p>
        <p style={{ ...font, fontSize: "12pt" }}>{ano || new Date().getFullYear()}</p>
      </div>
    </div>
  );
}