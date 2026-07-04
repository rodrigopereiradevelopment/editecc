"use client";

import type { Examinador } from "@/lib/document";

interface FolhaAprovacaoProps {
  autor: string;
  titulo: string;
  subtitulo?: string;
  curso: string;
  orientador: string;
  data?: string;
  cidade?: string;
  examinadores: Examinador[];
}

const font: React.CSSProperties = {
  fontFamily: "Times New Roman, serif",
  color: "#111",
};

export function FolhaAprovacao({
  autor, titulo, subtitulo, curso, orientador, data, cidade, examinadores,
}: FolhaAprovacaoProps) {
  const cidadeFinal = cidade || "________________";
  const dataFinal = data || "__ de _________ de ____";
  const numExaminadores = examinadores.length;

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
      ...font,
      fontSize: "12pt",
      lineHeight: "1.5",
    }}>
      {/* Nome do(s) Autor(es) */}
      <p style={{
        ...font, fontSize: "12pt", fontWeight: "bold",
        textAlign: "center", textTransform: "uppercase",
        marginBottom: "4cm",
      }}>
        {autor || "NOME DO(S) AUTOR(ES)"}
      </p>

      {/* Título */}
      <div style={{ textAlign: "center", marginBottom: "2cm" }}>
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

      {/* Texto descritivo */}
      <div style={{ textAlign: "justify", marginBottom: "1.5cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          Trabalho de Conclusão de Curso apresentado como exigência parcial
          para obtenção do título de Técnico em{" "}
          <strong>{curso || "[curso]"}</strong> pelo{" "}
          Centro Paula Souza – Escola Técnica Estadual Pedro Ferreira Alves
          – Mogi Mirim-SP.
        </p>
      </div>

      {/* Orientador */}
      <div style={{ textAlign: "justify", marginBottom: "1.5cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          Orientador: Prof. {orientador || "___________________________"}
        </p>
      </div>

      {/* Banca Examinadora */}
      <div style={{ textAlign: "justify", marginBottom: "1.5cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          A Banca Examinadora deste Trabalho de Conclusão de Curso, em sessão
          realizada na cidade de {cidadeFinal}, Estado de São Paulo em{" "}
          {dataFinal}, considerou os candidatos:
        </p>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5", marginTop: "0.8cm" }}>
          ( &nbsp; ) Aprovado(s) &nbsp;&nbsp;&nbsp;&nbsp; ( &nbsp; ) Reprovado(s)
        </p>
      </div>

      {/* Data e local */}
      <div style={{ textAlign: "justify", marginBottom: "2cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          {cidadeFinal}, {dataFinal}.
        </p>
      </div>

      {/* Blocos de assinatura */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "1.5cm" }}>
        {/* Orientador primeiro */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            borderTop: "1px solid #111",
            width: "100%",
            marginBottom: "4pt",
          }} />
          <p style={{ ...font, fontSize: "11pt", fontStyle: "italic" }}>
            Professor Orientador
          </p>
          <p style={{ ...font, fontSize: "11pt" }}>
            {orientador || "___________________________"}
          </p>
          <p style={{ ...font, fontSize: "10pt", marginTop: "2pt" }}>
            Professor Especialista
          </p>
          <p style={{ ...font, fontSize: "10pt" }}>
            {curso || "[curso]"}
          </p>
        </div>

        {/* Demais examinadores */}
        {examinadores.map((ex, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{
              borderTop: "1px solid #111",
              width: "100%",
              marginBottom: "4pt",
            }} />
            <p style={{ ...font, fontSize: "11pt", fontStyle: "italic" }}>
              Examinador(a) {i + 1}
            </p>
            <p style={{ ...font, fontSize: "11pt" }}>
              {ex.nome || "___________________________"}
            </p>
            <p style={{ ...font, fontSize: "10pt", marginTop: "2pt" }}>
              {ex.titulo || "Professor"} {ex.instituicao ? `- ${ex.instituicao}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
