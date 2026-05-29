// lib/abnt/styles.ts
// Definições de estilos ABNT NBR 14724:2011

export const ABNT_PAGE = {
  width: "21cm",
  minHeight: "29.7cm",
  paddingTop: "3cm",
  paddingLeft: "3cm",
  paddingRight: "2cm",
  paddingBottom: "2cm",
} as const;

export const ABNT_FONT = {
  family: "'Times New Roman', Times, serif",
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
    description: "Fonte 12, justificado, espaço 1.5, recuo 1.25cm",
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
    label: "Citação Longa",
    tag: "blockquote",
    description: "Fonte 10, espaço simples, recuo 4cm à esquerda",
    cssClass: "abnt-citacao",
  },
  {
    id: "referencia",
    label: "Referência Bibliográfica",
    tag: "p",
    description: "Fonte 12, espaço simples, sem recuo",
    cssClass: "abnt-referencia",
  },
  {
    id: "nota-rodape",
    label: "Nota de Rodapé",
    tag: "p",
    description: "Fonte 10, espaço simples",
    cssClass: "abnt-nota",
  },
  {
    id: "legenda",
    label: "Legenda de Figura/Tabela",
    tag: "p",
    description: "Fonte 10, centralizado",
    cssClass: "abnt-legenda",
  },
];

// ─── VALIDAÇÕES ────────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  severity: "error" | "warning" | "info";
  message: string;
}

export function validateDocument(editorEl: HTMLElement): ValidationResult[] {
  const results: ValidationResult[] = [];
  const text = editorEl.innerText || "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Contagem de palavras
  results.push({
    ok: words > 0,
    severity: words > 0 ? "info" : "error",
    message: `Documento com ${words} palavra(s)`,
  });

  // Resumo entre 150-500 palavras (se existir seção de resumo)
  const h1s = editorEl.querySelectorAll("h1");
  const resumoH = Array.from(h1s).find(h =>
    h.innerText.toLowerCase().includes("resumo")
  );
  if (resumoH) {
    const nextSibling = resumoH.nextElementSibling;
    if (nextSibling) {
      const resumoWords = (nextSibling.textContent || "")
        .trim()
        .split(/\s+/).length;
      if (resumoWords < 150) {
        results.push({
          ok: false,
          severity: "warning",
          message: `Resumo com ${resumoWords} palavras — ABNT recomenda 150 a 500`,
        });
      } else if (resumoWords > 500) {
        results.push({
          ok: false,
          severity: "warning",
          message: `Resumo com ${resumoWords} palavras — ABNT limita a 500`,
        });
      } else {
        results.push({
          ok: true,
          severity: "info",
          message: `Resumo com ${resumoWords} palavras ✓`,
        });
      }
    }
  }

  // Verifica blockquotes com < 3 linhas (provável citação curta mal formatada)
  const blockquotes = editorEl.querySelectorAll("blockquote");
  blockquotes.forEach((bq) => {
    const lines = (bq.textContent || "").split("\n").filter(l => l.trim()).length;
    if (lines < 3) {
      results.push({
        ok: false,
        severity: "warning",
        message: `Citação com menos de 3 linhas — usar aspas no texto corrente (ABNT 10520)`,
      });
    }
  });

  // Verifica se tem pelo menos Introdução e Conclusão
  const headingTexts = Array.from(h1s).map(h => h.innerText.toLowerCase());
  if (!headingTexts.some(t => t.includes("introdu"))) {
    results.push({ ok: false, severity: "warning", message: "Seção Introdução não encontrada" });
  }
  if (!headingTexts.some(t => t.includes("conclus") || t.includes("consider"))) {
    results.push({ ok: false, severity: "warning", message: "Seção Conclusão/Considerações não encontrada" });
  }

  return results;
}

// ─── GERADOR DE SUMÁRIO ────────────────────────────────────────────────────────

export interface TocEntry {
  level: 1 | 2 | 3;
  text: string;
  id: string;
}

export function generateTOC(editorEl: HTMLElement): TocEntry[] {
  return Array.from(editorEl.querySelectorAll("h1,h2,h3"))
    .map((el, i) => {
      const id = `heading-${i}`;
      el.id = id;
      return {
        level: parseInt(el.tagName[1]) as 1 | 2 | 3,
        text: (el as HTMLElement).innerText.trim(),
        id,
      };
    })
    .filter(e => e.text.length > 0);
}
