"use client";

import { splitContentIntoPages } from "@/lib/abnt/pageBreak";

const ABNT_CSS = `
  @page { size: 210mm 297mm; margin: 0; }
  @page :first { margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
  body { font-family: Arial, Calibri, sans-serif; font-size: 12pt; line-height: 1.5; text-align: justify; color: #111; background: white; }
  h1 { font-size: 12pt; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.5; margin: 2em 0 1em; text-indent: 0; }
  h2 { font-size: 12pt; font-weight: 700; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; text-indent: 0; }
  h3 { font-size: 12pt; font-weight: 700; font-style: italic; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; text-indent: 0; }
  p { text-indent: 2.5cm; margin: 0; line-height: 1.5; text-align: justify; }
  blockquote { font-size: 10pt; line-height: 1; margin-left: 4cm; text-align: justify; border: none; padding: 0; text-indent: 0; }
  blockquote p { text-indent: 0; }
  ul, ol { padding-left: 1.5cm; line-height: 1.5; }
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    padding: 3cm 2cm 2cm 3cm;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    page-break-after: always;
    page-break-inside: avoid;
    position: relative;
  }
  .a4-page:first-of-type { page-break-before: auto; }
  .a4-page.has-number::after {
    counter-increment: page-counter;
    content: counter(page-counter);
    position: absolute;
    bottom: 2cm;
    right: 2cm;
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    color: #111;
  }
  .a4-page.has-number-first {
    counter-reset: page-counter var(--start-page, 0);
  }
  .abnt-referencia { font-size: 10pt; line-height: 1; text-indent: 0; margin-bottom: 6pt; }
  img { max-width: 100%; height: auto; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; }
  table thead { border-top: 2px solid #000; border-bottom: 1px solid #000; }
  table tbody { border-bottom: 2px solid #000; }
  table th, table td { padding: 0.5em; text-align: left; font-size: 12pt; border: none; }
  .figure-caption { font-size: 10pt; text-align: center; margin-top: 0.5em; font-weight: bold; }
`;

/** Propriedades CSS de flexbox a serem removidas (sizing + gap, não layout) */
const FLEX_SIZING = /(?:flex(?:-grow|-shrink|-basis)?\s*:\s*[^;]+|gap\s*:\s*[^;]+)\s*;?\s*/gi;

/**
 * Detecta flex-grow (flex: N ou flex-grow: N) no style raw.
 * Usa \b pra não pegar flex: 10 quando testamos N=1.
 */
function hasFlexGrow(raw: string, n: string): boolean {
  return new RegExp(`(?:^|[;])\\s*flex(?:\\s*:|\\s*-grow\\s*:)\\s*${n}\\b`, "i").test(raw);
}

function stripFlex(el: HTMLElement) {
  const raw = el.getAttribute("style") || "";

  // ── Tipo 1: Spacer vazio → converte flex: para height ──
  if (!el.textContent?.trim() && el.children.length === 0) {
    const m = raw.match(/(?:^|[;])\s*flex\s*:\s*([^;]+)/i);
    if (m) {
      const v = m[1].trim();
      const parts = v.split(/\s+/).filter(Boolean);
      let h = "";
      if (parts[0] === "0" && parts[1] === "0") h = parts[2] ?? "";
      else if (parts[0] === "1") h = "5cm";
      if (h && h !== "0") el.setAttribute("style", `height: ${h}`);
      else el.removeAttribute("style");
      return;
    }
  }

  // ── Tipo 2a: Container com flex-grow E display:flex → preservar flex (layout interno) ──
  // Ex: Capa título container — flex:1 + display:flex centraliza verticalmente
  if (hasFlexGrow(raw, "1") && el.textContent?.trim() && /display\s*:\s*flex/i.test(raw)) {
    // Só remover gap (sizing), manter flex, display:flex, justify-content, align-items
    const cleaned = raw.replace(/gap\s*:\s*[^;]+;?\s*/gi, "").trim();
    el.setAttribute("style", cleaned);
    Array.from(el.children).forEach(child => stripFlex(child as HTMLElement));
    return;
  }

  // ── Tipo 2b: Container com flex-grow + texto (sem display:flex) → margins ──
  if (hasFlexGrow(raw, "1") && el.textContent?.trim()) {
    const cleaned = raw.replace(FLEX_SIZING, "").trim();
    const margin = "margin-top: 2cm; margin-bottom: 2cm";
    el.setAttribute("style", cleaned ? `${cleaned}; ${margin}` : margin);
    Array.from(el.children).forEach(child => stripFlex(child as HTMLElement));
    return;
  }

  // ── Tipo 3: Demais elementos → só remover sizing flex, manter layout flex ──
  const cleaned = raw.replace(FLEX_SIZING, "").trim();
  if (cleaned !== raw) el.setAttribute("style", cleaned);
  Array.from(el.children).forEach(child => stripFlex(child as HTMLElement));
}

function esc(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function splitSumarioPages(
  clone: HTMLElement,
  baseStyle: string,
): { html: string; extraPages: number } {
  const h1 = clone.querySelector("h1");
  const entries = Array.from(clone.querySelectorAll("p"));
  const MAX_PER_PAGE = 25;

  if (entries.length <= MAX_PER_PAGE) {
    let s = baseStyle;
    s += "; page-break-inside: auto";
    return { html: `<div class="a4-page" style="${esc(s)}">${clone.innerHTML}</div>`, extraPages: 0 };
  }

  const pages: string[] = [];
  for (let i = 0; i < entries.length; i += MAX_PER_PAGE) {
    let s = baseStyle;
    s += "; page-break-inside: auto";
    if (i > 0) s += "; page-break-before: always; mso-page-break-before: always";

    let content = "";
    if (i === 0 && h1) {
      content += `<h1 style="font-size:12pt;font-weight:700;text-transform:uppercase;text-align:center;margin-bottom:1.5em;">SUMÁRIO</h1>`;
    }
    const chunk = entries.slice(i, i + MAX_PER_PAGE);
    chunk.forEach((p) => { content += p.outerHTML; });
    pages.push(`<div class="a4-page" style="${esc(s)}">${content}</div>`);
  }

  return { html: pages.join(""), extraPages: pages.length - 1 };
}

export function getFullDocumentHTML(): string {
  const pages = document.querySelectorAll<HTMLElement>(".a4-page");
  let bodyHTML = "";
  let pageIndex = 0;
  let sumarioIndex = -1;
  let sumarioExtraPages = 0;

  // Primeiro: encontrar qual página é o Sumário e checar overflow
  pages.forEach((el) => {
    const text = el.textContent || "";
    if (text.includes("SUMÁRIO") && el.querySelector("h1")) {
      sumarioIndex = pageIndex;
      const entries = el.querySelectorAll("p");
      if (entries.length > 25) {
        sumarioExtraPages = Math.ceil(entries.length / 25) - 1;
      }
    }
    pageIndex++;
  });

  // Resetar pageIndex para o loop principal
  pageIndex = 0;

  pages.forEach((el) => {
    const clone = el.cloneNode(true) as HTMLElement;
    stripFlex(clone);

    const isSumario = sumarioIndex >= 0 &&
      pageIndex === sumarioIndex &&
      clone.querySelector("h1") &&
      (clone.textContent || "").includes("SUMÁRIO");

    if (isSumario) {
      const baseStyle = clone.getAttribute("style") || "";
      const result = splitSumarioPages(clone, baseStyle);
      bodyHTML += result.html;
      pageIndex += 1 + result.extraPages;
      return;
    }

    // Verificar se é conteúdo do editor (Tiptap)
    if (clone.classList.contains("editor-area")) {
      // Dividir conteúdo do editor em múltiplas páginas
      const editorHtml = clone.innerHTML;
      const splitPages = splitContentIntoPages(editorHtml);

      splitPages.forEach((pageHtml) => {
        let style = "";
        let classes = "a4-page";
        if (pageIndex > 0) style += "page-break-before: always; mso-page-break-before: always;";
        // Adicionar has-number depois do Sumário (ajustado por extra pages)
        const effectiveSumarioIndex = sumarioIndex + sumarioExtraPages;
        if (effectiveSumarioIndex >= 0 && pageIndex > effectiveSumarioIndex) {
          classes += " has-number";
          if (pageIndex === effectiveSumarioIndex + 1) {
            classes += " has-number-first";
            style += ` --start-page: ${pageIndex};`;
          }
        }
        bodyHTML += `<div class="${classes}" style="${esc(style)}">${pageHtml}</div>`;
        pageIndex++;
      });
    } else {
      // Outras páginas (Capa, FolhaRosto, etc.)
      const inner = clone.innerHTML;
      let style = clone.getAttribute("style") || "";
      let classes = "a4-page";
      if (pageIndex > 0) style += "; page-break-before: always; mso-page-break-before: always";
      // Adicionar has-number depois do Sumário (ajustado por extra pages)
      const effectiveSumarioIndex = sumarioIndex + sumarioExtraPages;
      if (effectiveSumarioIndex >= 0 && pageIndex > effectiveSumarioIndex) {
        classes += " has-number";
        if (pageIndex === effectiveSumarioIndex + 1) {
          classes += " has-number-first";
          style += `; --start-page: ${pageIndex}`;
        }
      }
      bodyHTML += `<div class="${classes}" style="${esc(style)}">${inner}</div>`;
      pageIndex++;
    }
  });

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="ProgId" content="Word.Document">
  <title>Documento ABNT</title>
  <style>${ABNT_CSS}</style>
</head>
<body>${bodyHTML}</body>
</html>`;
}

export function printFullDocument(): Promise<void> {
  return new Promise((resolve, reject) => {
    const html = getFullDocumentHTML();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("title", "Impressão do documento");
    document.body.appendChild(iframe);

    iframe.contentDocument!.open();
    iframe.contentDocument!.write(html);
    iframe.contentDocument!.close();

    iframe.onload = () => {
      try {
        iframe.contentWindow!.print();
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    };
  });
}

export function downloadDoc(filename: string): void {
  const html = getFullDocumentHTML();
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
