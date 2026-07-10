"use client";

import type { Examinador } from "@/lib/document";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function formatarData(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [ano, mes, dia] = iso.split("-");
  return `${parseInt(dia)} de ${MESES[parseInt(mes) - 1]} de ${ano}`;
}

interface FolhaAprovacaoProps {
  autor: string;
  autores: string[];
  titulo: string;
  subtitulo?: string;
  curso: string;
  etec: string;
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
  autor, autores, titulo, subtitulo, curso, etec, orientador, data, cidade, examinadores,
}: FolhaAprovacaoProps) {
  const nomes = autores.some(Boolean) ? autores : [autor];
  const cidadeFinal = cidade || "________________";
  const dataFinal = data || "__ de _________ de ____";
  const dataFormatada = formatarData(dataFinal);
  const etecNome = etec || "Escola Técnica Estadual";
  const cidadeState = cidade || "Cidade";

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
      <div style={{ textAlign: "center", marginBottom: "2cm" }}>
        {nomes.map((n, i) => (
          <p key={i} style={{
            ...font, fontSize: "12pt", fontWeight: "bold",
            textTransform: "uppercase",
          }}>
            {n || "NOME DO(S) AUTOR(ES)"}
          </p>
        ))}
      </div>

      {/* Título */}
      <div style={{ textAlign: "center", marginBottom: "1cm" }}>
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
      <div style={{ textAlign: "justify", marginBottom: "0.8cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          Trabalho de Conclusão de Curso apresentado como exigência parcial
          para obtenção do título de Técnico em{" "}
          <strong>{curso || "[curso]"}</strong> pelo{" "}
          {etecNome} – {cidadeState}-SP.
        </p>
      </div>

      {/* Orientador */}
      <div style={{ textAlign: "justify", marginBottom: "0.8cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          Orientador: {orientador || "___________________________"}
        </p>
      </div>

      {/* Banca Examinadora */}
      <div style={{ textAlign: "justify", marginBottom: "0.8cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          A Banca Examinadora deste Trabalho de Conclusão de Curso, em sessão
          realizada na cidade de {cidadeFinal}, Estado de São Paulo em{" "}
          {dataFormatada}, considerou os candidatos:
        </p>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5", marginTop: "0.8cm" }}>
          ( &nbsp; ) Aprovado(s) &nbsp;&nbsp;&nbsp;&nbsp; ( &nbsp; ) Reprovado(s)
        </p>
      </div>

      {/* Data e local */}
      <div style={{ textAlign: "justify", marginBottom: "1cm" }}>
        <p style={{ ...font, fontSize: "12pt", lineHeight: "1.5" }}>
          {cidadeFinal}, {dataFormatada}.
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
            {etec || "[instituição]"}
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
