"use client";

import PptxGenJS from "pptxgenjs";
import { extractiveSummarize } from "./tfidf";

export interface SlideSection {
  titulo: string;
  conteudo: string;
}

export interface SlideSectionFull extends SlideSection {
  textoCompleto: string;
}

const SECOES_CONHECIDAS: Record<string, string> = {
  introdução: "Introdução",
  objetivos: "Objetivos",
  "objetivo geral": "Objetivo Geral",
  "objetivos específicos": "Objetivos Específicos",
  metodologia: "Metodologia",
  resultados: "Resultados",
  discussão: "Discussão",
  conclusão: "Conclusão",
  "considerações finais": "Considerações Finais",
  referências: "Referências",
  fundamentação: "Fundamentação Teórica",
  "revisão bibliográfica": "Revisão Bibliográfica",
};

function normalizarTitulo(raw: string): string {
  // Remove numeração tipo "1 ", "1. ", "1.1 ", "1.1. ", "1 - " etc.
  const stripped = raw.replace(/^[\d]+(?:\.\d+)*\s*[.\-–—]?\s*/, "").trim();
  const cleaned = stripped.toLowerCase();
  for (const [chave, label] of Object.entries(SECOES_CONHECIDAS)) {
    if (cleaned.includes(chave)) return label;
  }
  return stripped;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return text.slice(0, cut > 0 ? cut : max) + "…";
}

export function parseSections(html: string): SlideSection[] {
  const div = document.createElement("div");
  div.innerHTML = html;

  const sections: SlideSection[] = [];
  const headings = div.querySelectorAll("h1, h2");

  for (const h of headings) {
    const text = h.textContent?.trim();
    if (!text) continue;

    // Pega o próximo elemento não-vazio após o heading
    let next = h.nextElementSibling;
    let conteudo = "";
    while (next && !/^h[12]$/i.test(next.tagName)) {
      const t = next.textContent?.trim();
      if (t) {
        conteudo += (conteudo ? " " : "") + t;
      }
      next = next.nextElementSibling;
    }

    sections.push({
      titulo: normalizarTitulo(text),
      conteudo: conteudo ? truncate(conteudo, 500) : "",
    });
  }

  return sections;
}

export function parseSectionsFull(html: string): SlideSectionFull[] {
  const div = document.createElement("div");
  div.innerHTML = html;

  const sections: SlideSectionFull[] = [];
  const headings = div.querySelectorAll("h1, h2");

  for (const h of headings) {
    const text = h.textContent?.trim();
    if (!text) continue;

    let next = h.nextElementSibling;
    let conteudo = "";
    while (next && !/^h[12]$/i.test(next.tagName)) {
      const t = next.textContent?.trim();
      if (t) {
        conteudo += (conteudo ? " " : "") + t;
      }
      next = next.nextElementSibling;
    }

    sections.push({
      titulo: normalizarTitulo(text),
      conteudo: conteudo ? truncate(conteudo, 500) : "",
      textoCompleto: conteudo,
    });
  }

  return sections;
}

export function formatBullets(text: string): string {
  // Se já tem bullets (do TF-IDF), retorna direto
  if (text.includes("•")) return text;

  // Fallback: divide por frases
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences
    .slice(0, 5)
    .map((s) => {
      const clean = s.replace(/^[•\-–—*]\s*/, "").trim();
      return `• ${clean.replace(/[.!?]$/, "")}`;
    })
    .join("\n");
}

/**
 * Gera bullets usando TF-IDF extrativo (sem IA).
 * Para cada seção: textoCompleto → extractiveSummarize → bullets.
 */
export function gerarBulletsTfidf(sections: SlideSectionFull[]): SlideSection[] {
  return sections.map((sec) => ({
    titulo: sec.titulo,
    conteudo: sec.textoCompleto
      ? extractiveSummarize(sec.textoCompleto, 5)
      : "",
  }));
}

export function gerarPPTX(
  sections: SlideSection[],
  cover: { titulo: string; autor: string; curso: string; orientador: string }
): void {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";

  const AZUL = "2563EB";
  const BRANCO = "FFFFFF";
  const CINZA = "64748B";

  // ── Slide 1: Capa ──
  const slide1 = pptx.addSlide();
  slide1.background = { color: AZUL };
  slide1.addText(cover.titulo || "TÍTULO DO TRABALHO", {
    x: 1, y: 1.5, w: 11.33, h: 2,
    fontSize: 32, fontFace: "Arial", color: BRANCO, bold: true,
    align: "center", valign: "middle",
  });
  slide1.addText(cover.autor || "Nome do(s) Autor(es)", {
    x: 1, y: 3.8, w: 11.33, h: 0.8,
    fontSize: 18, fontFace: "Arial", color: BRANCO,
    align: "center",
  });
  slide1.addText(`${cover.curso} | Orientador: ${cover.orientador}`, {
    x: 1, y: 4.8, w: 11.33, h: 0.6,
    fontSize: 14, fontFace: "Arial", color: "BFDBFE",
    align: "center",
  });
  slide1.addText("Gerado por EditeCC", {
    x: 1, y: 6.5, w: 11.33, h: 0.5,
    fontSize: 10, fontFace: "Arial", color: "93C5FD",
    align: "center",
  });

  // ── Slides de seção ──
  for (const sec of sections) {
    const slide = pptx.addSlide();
    slide.background = { color: BRANCO };

    // Barra superior azul
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: AZUL },
    });

    slide.addText(sec.titulo, {
      x: 0.8, y: 0.4, w: 11.73, h: 0.8,
      fontSize: 24, fontFace: "Arial", color: "1E293B", bold: true,
    });

    slide.addText(sec.conteudo, {
      x: 0.8, y: 1.5, w: 11.73, h: 5.0,
      fontSize: 16, fontFace: "Arial", color: "334155",
      lineSpacingMultiple: 1.5,
      valign: "top",
    });

    // Número do slide
    slide.addText(`${sections.indexOf(sec) + 2}`, {
      x: 6, y: 6.8, w: 1.33, h: 0.4,
      fontSize: 10, fontFace: "Arial", color: CINZA,
      align: "center",
    });
  }

  pptx.writeFile({ fileName: "apresentacao_tcc.pptx" });
}
