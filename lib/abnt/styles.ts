// lib/abnt/styles.ts v0.1.1
// Definições ABNT v0.1.1 — Manual de TCC ETEC 2022

export const ABNT_PAGE = {
  width: "21cm",
  minHeight: "29.7cm",
  paddingTop: "3cm",
  paddingLeft: "3cm",
  paddingRight: "2cm",
  paddingBottom: "2cm",
} as const;

export const ABNT_FONT = {
  family: "'Arial', 'Calibri', sans-serif",
  size: "12pt",
  lineHeight: "1.5",
} as const;

export type StyleId =
  | "texto-corrente"
  | "titulo-1"
  | "titulo-2"
  | "titulo-3"
  | "citacao-longa"
  | "referencia"
  | "resumo"
  | "nota-rodape"
  | "legenda";

export interface AbntStyle {
  id: StyleId;
  label: string;
  tag: string;
  description: string;
  cssClass: string;
}

export const ABNT_STYLES: AbntStyle[] = [
  {
    id: "texto-corrente",
    label: "Texto Corrente",
    tag: "p",
    description: "Fonte 12, justificado, espaço 1.5, recuo 2.5cm",
    cssClass: "abnt-texto",
  },
  {
    id: "titulo-1",
    label: "Título 1",
    tag: "h1",
    description: "Fonte 12, negrito, maiúsculas, centralizado",
    cssClass: "abnt-h1",
  },
  {
    id: "titulo-2",
    label: "Título 2",
    tag: "h2",
    description: "Fonte 12, negrito, alinhado à esquerda",
    cssClass: "abnt-h2",
  },
  {
    id: "titulo-3",
    label: "Título 3",
    tag: "h3",
    description: "Fonte 12, negrito itálico, alinhado à esquerda",
    cssClass: "abnt-h3",
  },
  {
    id: "citacao-longa",
    label: "Citação Longa (>3 linhas)",
    tag: "blockquote",
    description: "Fonte 10, espaço simples, recuo 4cm à esquerda",
    cssClass: "abnt-citacao",
  },
  {
    id: "referencia",
    label: "Referência Bibliográfica",
    tag: "p",
    description: "Fonte 12, espaço simples, sem recuo, com linha branca entre",
    cssClass: "abnt-referencia",
  },
  {
    id: "resumo",
    label: "Resumo / Abstract",
    tag: "p",
    description: "Fonte 12, espaço simples, parágrafo único + palavras-chave",
    cssClass: "abnt-resumo",
  },
];

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface CoverData {
  instituicao: string;
  unidade: string;
  curso: string;
  autor: string;
  titulo: string;
  subtitulo: string;
  cidade: string;
  ano: string;
}

export interface BackCoverData {
  autor: string;
  titulo: string;
  subtitulo: string;
  notaExplicativa: string;
  orientador: string;
  cidade: string;
  ano: string;
}

export interface ResumoData {
  conteudo: string;
  palavrasChave: string[];
  idioma: "português" | "inglês" | "espanhol";
}

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  message: string;
}

export interface TocEntry {
  id: string;
  level: 1 | 2 | 3;
  text: string;
}

// ─── VALIDAÇÕES ────────────────────────────────────────────────────────────────

export function validateDocument(html: string): ValidationIssue[] {
  const results: ValidationIssue[] = [];
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || "";

  // 1. Verificar seções obrigatórias
  const h1Elements = tempDiv.querySelectorAll("h1");
  const h1Texts = Array.from(h1Elements).map(h => h.textContent?.toLowerCase() || "");

  if (!h1Texts.some(t => t.includes("introdu"))) {
    results.push({
      type: "warning",
      message: "Seção '1 INTRODUÇÃO' não encontrada (obrigatória)",
    });
  }

  if (!h1Texts.some(t => t.includes("conclus") || t.includes("consideraç"))) {
    results.push({
      type: "warning",
      message: "Seção 'CONCLUSÃO' ou 'CONSIDERAÇÕES FINAIS' não encontrada (obrigatória)",
    });
  }

  if (!text.toUpperCase().includes("REFERÊNCIAS")) {
    results.push({
      type: "error",
      message: "Seção 'REFERÊNCIAS' não encontrada (obrigatória)",
    });
  }

  // 2. Validar hierarquia de seções (H1 → H2 → H3)
  const headings = tempDiv.querySelectorAll("h1, h2, h3");
  let lastLevel = 0;
  let hierarchyOk = true;
  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (level > lastLevel + 1 && lastLevel > 0) hierarchyOk = false;
    lastLevel = level;
  });
  if (!hierarchyOk) {
    results.push({
      type: "warning",
      message: "Hierarquia de seções quebrada — H2 deve vir após H1, H3 após H2",
    });
  }

  // 3. Validar resumo (se houver)
  const resumoH = Array.from(h1Elements).find(h =>
    h.textContent?.toLowerCase().includes("resumo")
  );
  if (resumoH) {
    const resumoSection = resumoH.nextElementSibling;
    const resumoText = resumoSection?.textContent || "";
    const resumoWords = countWords(resumoText);

    if (resumoWords > 0 && resumoWords < 150) {
      results.push({
        type: "warning",
        message: `Resumo com ${resumoWords} palavras — ABNT recomenda 150 a 500`,
      });
    } else if (resumoWords > 500) {
      results.push({
        type: "warning",
        message: `Resumo com ${resumoWords} palavras — ABNT limita a 500`,
      });
    } else if (resumoWords >= 150 && resumoWords <= 500) {
      results.push({
        type: "info",
        message: `Resumo com ${resumoWords} palavras ✓ (conforme ABNT)`,
      });
    }
  }

  // 4. Verificar citações longas (blockquote)
  const blockquotes = tempDiv.querySelectorAll("blockquote");
  let badQuotes = 0;
  blockquotes.forEach(bq => {
    const lines = bq.querySelectorAll("p, br").length;
    if (lines < 3) badQuotes++;
  });
  if (badQuotes > 0) {
    results.push({
      type: "warning",
      message: `${badQuotes} citação(ões) com menos de 3 linhas — use aspas no texto corrente`,
    });
  }

  // 5. Verificar numeração de seções primárias (ex: "1 ", "2 ")
  if (h1Texts.length > 0) {
    const numbered = h1Texts.filter(t => /^\d/.test(t)).length;
    if (numbered < h1Texts.length) {
      results.push({
        type: "info",
        message: `${h1Texts.length - numbered} título(s) primário(s) sem numeração — ex: "1 INTRODUÇÃO"`,
      });
    }
  }

  // 6. Verificar itálico em título de obra (palavras estrangeiras)
  const italicEls = tempDiv.querySelectorAll("em, i");
  if (italicEls.length === 0 && text.length > 500) {
    results.push({
      type: "info",
      message: "Nenhum termo em itálico detectado — obras estrangeiras devem estar em itálico",
    });
  }

  // 7. Status geral
  if (results.length === 0) {
    results.push({
      type: "info",
      message: "Documento validado com sucesso ✓",
    });
  }

  return results;
}

// ─── GERADOR DE SUMÁRIO ────────────────────────────────────────────────────────

export function generateTOC(html: string): TocEntry[] {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const headings = tempDiv.querySelectorAll("h1, h2, h3");

  return Array.from(headings)
    .map((heading, index) => {
      const tagName = heading.tagName.toLowerCase();
      const level = parseInt(tagName[1]) as 1 | 2 | 3;
      const text = heading.textContent?.trim() || "";
      const id = heading.id || `heading-${index}`;

      return {
        id,
        level,
        text,
      };
    })
    .filter(entry => entry.text.length > 0);
}

// ─── CONTAGEM DE PALAVRAS ──────────────────────────────────────────────────────

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

// ─── EXTRAÇÃO DE FIGURAS E TABELAS (v0.2) ──────────────────────────────────────

export interface FigureEntry {
  id: string;
  caption: string;
  index: number;
}

export interface TableEntry {
  id: string;
  caption: string;
  index: number;
}

export function extractFigures(html: string): FigureEntry[] {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const figures = tempDiv.querySelectorAll("figure, img");
  return Array.from(figures)
    .map((el, i) => {
      const figcaption = el.querySelector("figcaption");
      const alt = (el as HTMLImageElement).alt || "";
      const title = el.getAttribute("title") || "";
      const caption = figcaption?.textContent || alt || title || `Figura ${i + 1}`;
      const id = el.id || `figure-${i}`;
      return { id, caption, index: i + 1 };
    })
    .filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i);
}

export function extractTables(html: string): TableEntry[] {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const tables = tempDiv.querySelectorAll("table");
  return Array.from(tables)
    .map((el, i) => {
      const caption = el.getAttribute("title") || `Tabela ${i + 1}`;
      const id = el.id || `table-${i}`;
      return { id, caption, index: i + 1 };
    })
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
}

// ─── FORMATAÇÃO DE REFERÊNCIAS (ABNT NBR 6023) ──────────────────────────────

export interface Reference {
  type:
    | "book"
    | "article"
    | "chapter"
    | "thesis"
    | "law"
    | "event"
    | "website"
    | "ebook";
  authors: string[];
  title: string;
  subtitle?: string;
  year: number;
  publisher?: string;
  city?: string;
  edition?: string;
  volume?: string;
  number?: string;
  pages?: string;
  journal?: string;
  url?: string;
  doi?: string;
  accessDate?: string;
}

export function formatReference(ref: Reference): string {
  const authorsList = ref.authors.join("; ");

  switch (ref.type) {
    case "book":
      return `${authorsList}. ${ref.title.toUpperCase()}${
        ref.edition ? ". " + ref.edition + " ed." : ""
      }. ${ref.city}: ${ref.publisher}, ${ref.year}.`;

    case "article":
      return `${authorsList}. ${ref.title}. ${ref.journal}${
        ref.volume ? ", v." + ref.volume : ""
      }${ref.number ? ", n." + ref.number : ""}${
        ref.pages ? ", p." + ref.pages : ""
      }, ${ref.year}.`;

    case "chapter":
      return `${authorsList}. ${ref.title}. In: ${ref.publisher} (org.). ${
        ref.subtitle
      }. ${ref.city}: ${ref.publisher}, ${ref.year}${
        ref.number ? ". cap. " + ref.number : ""
      }${ref.pages ? ", p." + ref.pages : ""}.`;

    case "law":
      return `${ref.title}. ${ref.publisher}, ${ref.city}, ${ref.year}.`;

    case "ebook":
      return `${authorsList}. ${ref.title.toUpperCase()}. ${ref.city}: ${
        ref.publisher
      }, ${ref.year}. E-book.`;

    case "event":
      return `${authorsList}. ${ref.title}. In: ${ref.publisher}, ${ref.year}. Anais...${
        ref.pages ? " p." + ref.pages : ""
      }.`;

    case "website":
      return `${authorsList}. ${ref.title}. Disponível em: ${ref.url}. Acesso em: ${ref.accessDate}.`;

    default:
      return `${authorsList}. ${ref.title}. ${ref.year}.`;
  }
}

// ─── UTILITÁRIOS ───────────────────────────────────────────────────────────────

export function getStyleById(id: StyleId): AbntStyle | undefined {
  return ABNT_STYLES.find(s => s.id === id);
}

export function getAllStyles(): AbntStyle[] {
  return ABNT_STYLES;
}
