"use client";

import type { CoverData } from "@/lib/coverReducer";
import type { Examinador } from "@/lib/document";
import type { PosTextualItem } from "@/components/PosTextuaisManager";
import type { GlossarioEntry } from "@/components/GlossarioManager";
import type { NotaRodape } from "@/components/NotasRodapeManager";
import { extractFigures, extractTables, formatReference, type Reference } from "@/lib/abnt/styles";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function formatarData(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [ano, mes, dia] = iso.split("-");
  return `${parseInt(dia)} de ${MESES[parseInt(mes) - 1]} de ${ano}`;
}

/** Escapa texto para RTF: acentos → \\uXXXX, \\{ → \\\\{ etc. */
export function escapeRtf(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/[\u0080-\uffff]/g, (c) => `\\u${c.charCodeAt(0)}'3f`);
}

/** Converte string para RTF seguro: \\{ \\} \\\\ + acentos via \\uXXXX? */
export function escapeRtfAnsi(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 0x5c) out += "\\\\";
    else if (code === 0x7b) out += "\\{";
    else if (code === 0x7d) out += "\\}";
    else if (code < 0x80) out += text[i];
    else out += `\\u${code}?`;
  }
  return out;
}

// ─── Constantes ABNT em twips ──────────────────────────────────────────────────

/** 1cm em twips (567) */
const CM = 567;

/** Margens ABNT: 3cm sup/esq, 2cm inf/dir */
const MARG_SUP = 3 * CM;
const MARG_INF = 2 * CM;
const MARG_ESQ = 3 * CM;
const MARG_DIR = 2 * CM;

/** Recuo de primeira linha de parágrafo: 2.5cm */
const RECUO_PRIMEIRA_LINHA = Math.round(2.5 * CM);
const PARA_RECUO = RECUO_PRIMEIRA_LINHA;

/** Espaçamento 1,5 entre linhas: 240 twips × 1,5 = 360 */
const LINHA_15 = 360;

// ─── Cabeçalho RTF ────────────────────────────────────────────────────────────

/**
 * Cabeçalho padrão RTF com ABNT:
 * - Arial 12pt (\\fs24 = 24 half-points)
 * - Margens ABNT
 * - Espaçamento 1,5 e recuo de primeira linha para body
 */
function rtfHeader(): string {
  return [
    "{\\rtf1\\ansi\\deff0",
    "{\\fonttbl{\\f0\\fswiss Arial;}{\\f1\\froman Times New Roman;}}",
    `\\margt${MARG_SUP}\\margb${MARG_INF}\\margl${MARG_ESQ}\\margr${MARG_DIR}`,
    "\\f0\\fs24",
  ].join("\n") + "\n";
}

// ─── Geradores de páginas ─────────────────────────────────────────────────────

/** Gera RTF para a Capa */
export function capaToRtf(cover: CoverData): string {
  const {
    etec, curso, autor, autores, titulo, subtitulo, local, ano,
  } = cover;
  const nomes = autores.some(Boolean) ? autores : [autor];
  const etecNome = etec || "Centro Estadual de Educação Tecnológica Paula Souza";
  const cidade = local || "Cidade";
  const anoFinal = ano || new Date().getFullYear().toString();

  const p = (s: string, extra = "") =>
    `{\\qc\\f0\\fs24 ${extra}${escapeRtfAnsi(s)}\\par}`;

  const spacer = (h: string) =>
    `{\\pard\\sl-${Math.round(parseFloat(h) * CM)}\\sa0\\sb0\\par}`;

  let rtf = "";

  // Instituição — Arial 14pt bold
  rtf += `{\\qc\\f0\\fs28\\b ${escapeRtfAnsi(etecNome.toUpperCase())}\\par}\\par\n`;

  // Curso
  if (curso) rtf += `${p(curso)}\\par\n`;

  // Spacer ~4cm
  rtf += `${spacer("4")}\\par\n`;

  // Autor(es) — centralizado bold
  for (const n of nomes) {
    if (n) rtf += `{\\qc\\f0\\fs24\\b ${escapeRtfAnsi(n.toUpperCase())}\\par}`;
  }
  rtf += "\\par\\par\n";

  // Spacer elástico (simula flex:1 com \sl)
  rtf += `${spacer("5")}\\par\n`;

  // Título — Arial 14pt bold
  rtf += `{\\qc\\f0\\fs28\\b ${escapeRtfAnsi(titulo.toUpperCase())}\\par}`;
  if (subtitulo) rtf += `{\\qc\\f0\\fs24 ${escapeRtfAnsi(subtitulo)}\\par}`;
  rtf += "\\par\\par\n";

  // Spacer final
  rtf += `${spacer("5")}\\par\n`;

  // Cidade/Ano
  rtf += `{\\qc\\f0\\fs24 ${escapeRtfAnsi(cidade)}\\par}`;
  rtf += `{\\qc\\f0\\fs24 ${escapeRtfAnsi(anoFinal)}\\par}`;

  return rtf;
}

/**
 * Gera RTF para a Folha de Rosto
 */
export function folhaRostoToRtf(
  cover: CoverData,
  curso: string,
): string {
  const { autor, autores, titulo, subtitulo, orientador, etec, local, ano } = cover;
  const nomes = autores?.some(Boolean) ? autores : [autor];
  const etecNome = etec || "Escola Técnica Estadual";
  const cidadeState = local || "Cidade";

  let rtf = "";

  // Autor(es) — topo, centralizado
  for (const n of nomes) {
    if (n) rtf += `{\\qc\\f0\\fs24\\b ${escapeRtfAnsi(n.toUpperCase())}\\par}`;
  }
  rtf += "\\par\\par\\par\\par\n";

  // Spacer 5cm
  rtf += `{\\pard\\sl-${5 * CM}\\par}`;

  // Título Arial 14pt
  rtf += `{\\qc\\f0\\fs28\\b ${escapeRtfAnsi(titulo.toUpperCase())}\\par}`;
  if (subtitulo) rtf += `{\\qc\\f0\\fs24 ${escapeRtfAnsi(subtitulo)}\\par}`;
  rtf += "\\par\n";

  // Nota explicativa (alinhada justificada, margem esquerda 50% = ~7,8cm)
  // Usamos \li (left indent) em vez de CSS margin-left
  const li50 = Math.round(8.5 * CM); // 50% de 17cm de largura útil
  rtf += `{\\pard\\li${li50}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\sa120 ${escapeRtfAnsi(
    `Trabalho de Conclusão de Curso apresentado como exigência parcial para obtenção do título de Técnico em ${curso || "[curso]"}, pelo ${etecNome} – ${cidadeState}-SP.`,
  )}\\par}`;
  rtf += "\\par\n";
  rtf += `{\\pard\\li${li50}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(`Orientador: ${orientador || "___________________________"}`)}\\par}`;
  rtf += "\\par\\par\\par\\par\\par\n";

  // Cidade/Ano no fundo
  rtf += `{\\pard\\qc\\f0\\fs24 ${escapeRtfAnsi(cidadeState)}\\par}`;
  rtf += `{\\qc\\f0\\fs24 ${escapeRtfAnsi(ano)}\n}`;

  return rtf;
}

/**
 * Gera RTF para a Folha de Aprovação
 */
export function folhaAprovacaoToRtf(
  cover: CoverData,
  curso: string,
  aprovacaoData: string,
  aprovacaoCidade: string,
  examinadores: Examinador[],
): string {
  const { autor, autores, titulo, subtitulo, orientador, etec } = cover;
  const nomes = autores?.some(Boolean) ? autores : [autor];
  const etecNome = etec || "Escola Técnica Estadual";
  const cidadeState = aprovacaoCidade || "Cidade";
  const dataTexto = formatarData(aprovacaoData);
  const cidadeFinal = aprovacaoCidade || "________________";
  const dataFinal = dataTexto || "__ de _________ de ____";

  let rtf = "";

  // Nome autor(es)
  for (const n of nomes) {
    if (n) rtf += `{\\qc\\f1\\fs24\\b ${escapeRtfAnsi(n.toUpperCase())}\\par}`;
  }
  rtf += "\\par\\par\n";

  // Título
  rtf += `{\\qc\\f1\\fs28\\b ${escapeRtfAnsi(titulo.toUpperCase())}\\par}`;
  if (subtitulo) rtf += `{\\qc\\f1\\fs24 ${escapeRtfAnsi(subtitulo)}\\par}`;
  rtf += "\\par\\par\\par\n";

  // Texto descritivo
  rtf += `{\\j\\f1\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(
    `Trabalho de Conclusão de Curso apresentado como exigência parcial para obtenção do título de Técnico em ${curso} pelo ${etecNome} – ${cidadeState}-SP.`,
  )}\\par}`;
  rtf += "\\par\n";

  // Orientador
  rtf += `{\\j\\f1\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(`Orientador: ${orientador || "___________________________"}`)}\\par}`;
  rtf += "\\par\n";

  // Banca
  rtf += `{\\j\\f1\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(
    `A Banca Examinadora deste Trabalho de Conclusão de Curso, em sessão realizada na cidade de ${cidadeFinal}, Estado de São Paulo em ${dataFinal}, considerou os candidatos:`,
  )}\\par}`;
  rtf += "\\par\n";
  rtf += `{\\j\\f1\\fs24\\sl${LINHA_15}\\slmult1 ( ) Aprovado(s)      ( ) Reprovado(s)\\par}`;
  rtf += "\\par\n";

  // Data/local
  rtf += `{\\j\\f1\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(`${cidadeFinal}, ${dataFinal}.`)}\\par}`;
  rtf += "\\par\\par\\par\n";

  // Assinatura — Orientador
  rtf += "{\\qc\\f1\\fs22\\i Professor Orientador\\par}";
  rtf += `{\\qc\\f1\\fs22 ${escapeRtfAnsi(orientador || "___________________________")}\\par}`;
  rtf += "{\\qc\\f1\\fs20 Professor Especialista\\par}";
  rtf += `{\\qc\\f1\\fs20 ${escapeRtfAnsi(etecNome)}\\par}`;
  rtf += "\\par\n";

  // Assinatura — Examinadores
  for (const ex of examinadores) {
    rtf += `{\\qc\\f1\\fs22\\i Examinador(a)\\par}`;
    rtf += `{\\qc\\f1\\fs22 ${escapeRtfAnsi(ex.nome || "___________________________")}\\par}`;
    rtf += `{\\qc\\f1\\fs20 ${escapeRtfAnsi(ex.titulo || "Professor")}${ex.instituicao ? " - " + escapeRtfAnsi(ex.instituicao) : ""}\\par}`;
    rtf += "\\par\n";
  }

  return rtf;
}

// ─── Tiptap HTML → RTF (simplificado) ────────────────────────────────────────

/** Converte HTML do Tiptap para RTF básico */
export function tiptapToRtf(html: string): string {
  let rtf = html;

  // <h1>, <h2>, <h3> — INSERE \page ANTES DE CADA H1
  rtf = rtf.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_m, content: string) => {
    const text = stripTags(content);
    return `\\page\n\\par\\par{\\qc\\f0\\fs24\\b ${escapeRtfAnsi(text.toUpperCase())}\\par}\\par\\par`;
  });
  rtf = rtf.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m, content: string) => {
    const text = stripTags(content);
    return `\\par\\par{\\f0\\fs24\\b ${escapeRtfAnsi(text)}\\par}\\par`;
  });
  rtf = rtf.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_m, content: string) => {
    const text = stripTags(content);
    return `\\par\\par{\\f0\\fs24\\b\\i ${escapeRtfAnsi(text)}\\par}\\par`;
  });

  // <p> (com ou sem styles)
  rtf = rtf.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, content: string) => {
    const formatted = formatInline(content);
    return `{\\pard\\fi${PARA_RECUO}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${formatted}\\par}`;
  });

  // <blockquote>
  rtf = rtf.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, content: string) => {
    const inner = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_pm, pc: string) => {
      return `{\\pard\\li${Math.round(4 * CM)}\\fi0\\f0\\fs20\\sl240\\slmult1\\j ${formatInline(pc)}\\par}`;
    });
    return inner;
  });

  // <ul>, <li>
  rtf = rtf.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, content: string) => {
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_lm, lc: string) => {
      return `{\\pard\\li${PARA_RECUO}\\fi-${PARA_RECUO}\\f0\\fs24 ${escapeRtfAnsi("- " + stripTags(lc))}\\par}`;
    });
  });

  // <ol>
  // Podemos tratar como list numerada simples, mas ignoramos numeração por enquanto
  rtf = rtf.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, content: string) => {
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_lm, lc: string) => {
      return `{\\pard\\li${PARA_RECUO}\\fi-${PARA_RECUO}\\f0\\fs24 ${escapeRtfAnsi("- " + stripTags(lc))}\\par}`;
    });
  });

  // <br>
  rtf = rtf.replace(/<br\s*\/?>/gi, "\\line ");

  // Remover tags HTML restantes
  rtf = stripTags(rtf);

  return rtf;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

function formatInline(s: string): string {
  return s
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, (_m, c: string) => `\\b ${escapeRtfAnsi(c)}\\b0 `)
    .replace(/<em>([\s\S]*?)<\/em>/gi, (_m, c: string) => `\\i ${escapeRtfAnsi(c)}\\i0 `)
    .replace(/<u>([\s\S]*?)<\/u>/gi, (_m, c: string) => `\\ul ${escapeRtfAnsi(c)}\\ul0 `)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Dedicatória, Agradecimentos, Epígrafe ───────────────────────────────────

/** Gera RTF para a Dedicatória */
export function dedicatoriaToRtf(texto: string): string {
  if (!texto?.trim()) return "";
  const li = Math.round(8.5 * CM); // ~60% width, 40% margin-left
  return `{\\pard\\li${li}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(texto)}\\par}`;
}

/** Gera RTF para Agradecimentos */
export function agradecimentosToRtf(texto: string): string {
  if (!texto?.trim()) return "";
  return `{\\qc\\f0\\fs24\\b AGRADECIMENTOS\\par}\\par\\par\n{\\pard\\fi${PARA_RECUO}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(texto)}\\par}`;
}

/** Gera RTF para Epígrafe */
export function epigrafeToRtf(texto: string, autor: string): string {
  if (!texto?.trim()) return "";
  const textolimpo = texto.replace(/[—–\-]\s*$/, "").trim();
  const li = Math.round(8.5 * CM);
  return `{\\pard\\li${li}\\f0\\fs24\\i\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(textolimpo)}\\par}\\par\n{\\pard\\qr\\f0\\fs22 ${escapeRtfAnsi(autor ? `— ${autor}` : "—")}\\par}`;
}

// ─── Resumo, Abstract, Listas, Anexos, Apêndices, Glossário, Notas ──────────

/** Gera RTF para a página de Resumo */
export function resumoToRtf(texto: string, palavrasChave: string[]): string {
  if (!texto?.trim() && !palavrasChave.length) return "";
  let r = `{\\qc\\f0\\fs24\\b RESUMO\\par}\\par\\par\n`;
  if (texto?.trim()) {
    r += `{\\pard\\fi0\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(texto)}\\par}`;
  }
  if (palavrasChave.length) {
    r += `\\par\n{\\pard\\fi0\\f0\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi("Palavras-chave: " + palavrasChave.join(". ") + ".")}\\par}`;
  }
  return r;
}

/** Gera RTF para a página de Abstract */
export function abstractToRtf(texto: string, keywords: string[], language: string): string {
  if (!texto?.trim() && !keywords.length) return "";
  const titulos: Record<string, string> = { en: "ABSTRACT", es: "RESUMEN", fr: "RÉSUMÉ", de: "ABSTRACT", it: "ABSTRACT" };
  const labels: Record<string, string> = { en: "Keywords:", es: "Palabras clave:", fr: "Mots-clés :", de: "Schlüsselwörter:", it: "Parole chiave:" };
  const titulo = titulos[language] || "ABSTRACT";
  const label = labels[language] || "Keywords:";
  let r = `{\\qc\\f0\\fs24\\b ${escapeRtfAnsi(titulo)}\\par}\\par\\par\n`;
  if (texto?.trim()) {
    r += `{\\pard\\fi0\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(texto)}\\par}`;
  }
  if (keywords.length) {
    r += `\\par\n{\\pard\\fi0\\f0\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(label)} ${escapeRtfAnsi(keywords.join(". ") + ".")}\\par}`;
  }
  return r;
}

/** Gera RTF para a Lista de Figuras e Tabelas */
export function listaFigTabToRtf(editorHtml: string): string {
  const figures = extractFigures(editorHtml);
  const tables = extractTables(editorHtml);
  if (!figures.length && !tables.length) return "";
  let r = `{\\qc\\f0\\fs24\\b LISTA DE FIGURAS E TABELAS\\par}\\par\\par\n`;
  for (const fig of figures) {
    r += `{\\pard\\fi0\\f0\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(`Figura ${fig.index}: ${fig.caption}`)}\\par}`;
  }
  r += `\\par\n`;
  for (const tbl of tables) {
    r += `{\\pard\\fi0\\f0\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(`Tabela ${tbl.index}: ${tbl.caption}`)}\\par}`;
  }
  return r;
}

/** Gera RTF para o Sumário (TOC) a partir do HTML do Tiptap */
export function sumarioToRtf(html: string): string {
  const headings = html.match(/<h([1-3])[^>]*>([\s\S]*?)<\/h[1-3]>/gi);
  if (!headings?.length) return "";
  let r = `{\\qc\\f0\\fs24\\b SUMÁRIO\\par}\\par\\par\n`;
  for (const h of headings) {
    const m = h.match(/<h([1-3])[^>]*>([\s\S]*?)<\/h[1-3]>/i);
    if (!m) continue;
    const level = parseInt(m[1]);
    const text = stripTags(m[2]).trim();
    if (!text) continue;
    const indent = (level - 1) * Math.round(1.5 * CM);
    r += `{\\pard\\li${indent}\\f0\\fs24\\sl${LINHA_15}\\slmult1 ${escapeRtfAnsi(text)}\\par}`;
  }
  return r;
}

// ─── Referências e Elementos Pós-Textuais ────────────────────────────────────

/** Gera RTF para Referências */
export function referenciasToRtf(refs: Reference[]): string {
  if (!refs.length) return "";
  let r = `{\\qc\\f0\\fs24\\b REFERÊNCIAS\\par}\\par\\par\n`;
  for (const ref of refs) {
    r += `{\\pard\\fi0\\f0\\fs20\\sl240\\slmult1 ${escapeRtfAnsi(formatReference(ref))}\\par}`;
  }
  return r;
}

/** Gera RTF para Anexos */
export function anexosToRtf(items: PosTextualItem[]): string {
  if (!items.length) return "";
  let r = `{\\qc\\f0\\fs24\\b ANEXOS\\par}\\par\\par\n`;
  for (const item of items) {
    r += `{\\pard\\fi0\\f0\\fs24\\b ${escapeRtfAnsi(`ANEXO ${item.letra} — ${item.titulo}`)}\\par}`;
    if (item.conteudo) {
      r += `{\\pard\\fi${PARA_RECUO}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(item.conteudo)}\\par}\\par\n`;
    }
  }
  return r;
}

/** Gera RTF para Apêndices */
export function apendicesToRtf(items: PosTextualItem[]): string {
  if (!items.length) return "";
  let r = `{\\qc\\f0\\fs24\\b APÊNDICES\\par}\\par\\par\n`;
  for (const item of items) {
    r += `{\\pard\\fi0\\f0\\fs24\\b ${escapeRtfAnsi(`APÊNDICE ${item.letra} — ${item.titulo}`)}\\par}`;
    if (item.conteudo) {
      r += `{\\pard\\fi${PARA_RECUO}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(item.conteudo)}\\par}\\par\n`;
    }
  }
  return r;
}

/** Gera RTF para Glossário */
export function glossarioToRtf(entries: GlossarioEntry[]): string {
  if (!entries.length) return "";
  const sorted = [...entries].sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));
  let r = `{\\qc\\f0\\fs24\\b GLOSSÁRIO\\par}\\par\\par\n`;
  for (const entry of sorted) {
    r += `{\\pard\\fi${PARA_RECUO}\\f0\\fs24\\sl${LINHA_15}\\slmult1\\j ${escapeRtfAnsi(`${entry.termo}: ${entry.definicao}`)}\\par}`;
  }
  return r;
}

/** Gera RTF para Notas de Rodapé */
export function notasRodapeToRtf(notas: NotaRodape[]): string {
  if (!notas.length) return "";
  let r = `{\\qc\\f0\\fs20\\b NOTAS DE RODAPÉ\\par}\\par\\par\n`;
  for (const nota of notas) {
    r += `{\\pard\\fi0\\f0\\fs20\\sl240\\slmult1\\j ${escapeRtfAnsi(`${nota.numero} ${nota.texto}`)}\\par}`;
  }
  return r;
}

// ─── Documento completo ──────────────────────────────────────────────────────────────────────────────

/**
 * Gera string RTF completa.
 */
export function generateFullRtf(
  cover: CoverData,
  curso: string,
  aprovacaoData: string,
  aprovacaoCidade: string,
  examinadores: Examinador[],
  tiptapHtml: string,
  showDedicatoria?: boolean,
  dedicatoriaTexto?: string,
  showAgradecimentos?: boolean,
  agradecimentosTexto?: string,
  showEpigrafe?: boolean,
  epigrafeTexto?: string,
  epigrafeAutor?: string,
  showResumoPage?: boolean,
  resumo?: string,
  palavrasChave?: string[],
  showAbstractPage?: boolean,
  abstract?: string,
  keywords?: string[],
  abstractLang?: string,
  showFigList?: boolean,
  refs?: Reference[],
  showAnexos?: boolean,
  anexos?: PosTextualItem[],
  showApendices?: boolean,
  apendices?: PosTextualItem[],
  showGlossario?: boolean,
  glossario?: GlossarioEntry[],
  showNotasRodape?: boolean,
  notasRodape?: NotaRodape[],
): string {
  let rtf = rtfHeader();

  rtf += capaToRtf(cover);
  rtf += "\\page\n";
  rtf += folhaRostoToRtf(cover, curso);
  rtf += "\\page\n";
  rtf += folhaAprovacaoToRtf(cover, curso, aprovacaoData, aprovacaoCidade, examinadores);
  rtf += "\\page\n";

  if (showDedicatoria && dedicatoriaTexto?.trim()) {
    rtf += dedicatoriaToRtf(dedicatoriaTexto);
    rtf += "\\page\n";
  }

  if (showAgradecimentos && agradecimentosTexto?.trim()) {
    rtf += agradecimentosToRtf(agradecimentosTexto);
    rtf += "\\page\n";
  }

  if (showEpigrafe && epigrafeTexto?.trim()) {
    rtf += epigrafeToRtf(epigrafeTexto, epigrafeAutor || "");
    rtf += "\\page\n";
  }

  if (showResumoPage && resumo?.trim()) {
    rtf += resumoToRtf(resumo, (palavrasChave as string[]) || []);
    rtf += "\\page\n";
  }

  if (showAbstractPage && abstract?.trim()) {
    rtf += abstractToRtf(abstract, (keywords as string[]) || [], abstractLang || "en");
    rtf += "\\page\n";
  }

  if (showFigList) {
    const lst = listaFigTabToRtf(tiptapHtml);
    if (lst) { rtf += lst; rtf += "\\page\n"; }
  }

  // Sumário automático
  {
    const sumario = sumarioToRtf(tiptapHtml);
    if (sumario) { rtf += sumario; rtf += "\\page\n"; }
  }

  rtf += tiptapToRtf(tiptapHtml);
  rtf += "\\page\n";

  if ((refs as Reference[])?.length) {
    rtf += referenciasToRtf(refs as Reference[]);
    rtf += "\\page\n";
  }

  if (showApendices && (apendices as PosTextualItem[])?.length) {
    rtf += apendicesToRtf(apendices as PosTextualItem[]);
    rtf += "\\page\n";
  }

  if (showAnexos && (anexos as PosTextualItem[])?.length) {
    rtf += anexosToRtf(anexos as PosTextualItem[]);
    rtf += "\\page\n";
  }

  if (showGlossario && (glossario as GlossarioEntry[])?.length) {
    rtf += glossarioToRtf(glossario as GlossarioEntry[]);
    rtf += "\\page\n";
  }

  if (showNotasRodape && (notasRodape as NotaRodape[])?.length) {
    rtf += notasRodapeToRtf(notasRodape as NotaRodape[]);
    rtf += "\\page\n";
  }

  rtf += "}";
  return rtf;
}

/**
 * Cria Blob .rtf e dispara download
 */
export function downloadRtf(filename: string, rtf: string): void {
  const blob = new Blob([rtf], { type: "application/rtf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9]/g, "_")}.rtf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}