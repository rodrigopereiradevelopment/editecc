"use client";

const ABNT_CSS = `
  @page { size: 210mm 297mm; margin: 0mm; }
  @page :first { margin: 0mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
  body { font-family: Arial, Calibri, sans-serif; font-size: 12pt; line-height: 1.5; text-align: justify; color: #111; background: white; }
  h1 { font-size: 12pt; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.5; margin: 2em 0 1em; text-indent: 0; }
  h2 { font-size: 12pt; font-weight: 700; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; text-indent: 0; }
  h3 { font-size: 12pt; font-weight: 700; font-style: italic; text-align: left; line-height: 1.5; margin: 1.5em 0 0.8em; text-indent: 0; }
  p { text-indent: 1.25cm; margin: 0; line-height: 1.5; text-align: justify; }
  blockquote { font-size: 10pt; line-height: 1; margin-left: 4cm; text-align: justify; border: none; padding: 0; text-indent: 0; }
  blockquote p { text-indent: 0; }
  ul, ol { padding-left: 1.5cm; line-height: 1.5; }
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    padding: 3cm 2cm 2cm 3cm;
    page-break-after: always;
    page-break-inside: avoid;
  }
  .a4-page:first-of-type { page-break-before: auto; }
  .abnt-referencia { font-size: 10pt; line-height: 1; text-indent: 0; margin-bottom: 6pt; }
  img { max-width: 100%; height: auto; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; }
  table thead { border-top: 2px solid #000; border-bottom: 1px solid #000; }
  table tbody { border-bottom: 2px solid #000; }
  table th, table td { padding: 0.5em; text-align: left; font-size: 12pt; border: none; }
  .figure-caption { font-size: 10pt; text-align: center; margin-top: 0.5em; font-weight: bold; }
`;

/** Propriedades CSS de flexbox a serem removidas */
const FLEX_PROPS = /(?:display\s*:\s*(?:inline-)?flex|flex(?:-direction|-wrap|-grow|-shrink|-basis)?\s*:\s*[^;]+|justify-content\s*:\s*[^;]+|align-items\s*:\s*[^;]+|align-content\s*:\s*[^;]+|gap\s*:\s*[^;]+|order\s*:\s*[^;]+)\s*;?\s*/gi;

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

  // ── Tipo 2: Container com flex-grow + texto → margins ──
  if (hasFlexGrow(raw, "1") && el.textContent?.trim()) {
    const cleaned = raw.replace(FLEX_PROPS, "").trim();
    const margin = "margin-top: 2cm; margin-bottom: 2cm";
    el.setAttribute("style", cleaned ? `${cleaned}; ${margin}` : margin);
    Array.from(el.children).forEach(child => stripFlex(child as HTMLElement));
    return;
  }

  // ── Tipo 3: Demais elementos → só remover props flex ──
  const cleaned = raw.replace(FLEX_PROPS, "").trim();
  if (cleaned !== raw) el.setAttribute("style", cleaned);
  Array.from(el.children).forEach(child => stripFlex(child as HTMLElement));
}

function esc(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function getFullDocumentHTML(): string {
  const pages = document.querySelectorAll<HTMLElement>(".a4-page");
  let bodyHTML = "";
  pages.forEach((el, i) => {
    const clone = el.cloneNode(true) as HTMLElement;
    stripFlex(clone);
    const inner = clone.innerHTML;
    let style = clone.getAttribute("style") || "";
    if (i > 0) style += "; page-break-before: always; mso-page-break-before: always";
    bodyHTML += `<div class="a4-page" style="${esc(style)}">${inner}</div>`;
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
