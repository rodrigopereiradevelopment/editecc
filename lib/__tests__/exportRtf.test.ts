import { describe, it, expect } from "vitest";
import { escapeRtf, escapeRtfAnsi, capaToRtf, folhaRostoToRtf, folhaAprovacaoToRtf, generateFullRtf } from "@/lib/exportRtf";
import type { CoverData } from "@/lib/coverReducer";
import type { Examinador } from "@/lib/document";

// Texto como aparece no RTF após escapeRtfAnsi
const ANSI_SP = escapeRtfAnsi("São Paulo");       // S\'e3o Paulo
const ANSI_JOÃO = escapeRtfAnsi("JOÃO SILVA");     // JO\'c3O SILVA
const ANSI_OBRIGADO = escapeRtfAnsi("obrigado");

const cover: CoverData = {
  autor: "João Silva",
  autores: [],
  titulo: "Sistema de Gerenciamento",
  subtitulo: "uma abordagem com banco de dados",
  orientador: "Prof. José Santos",
  curso: "Desenvolvimento de Sistemas",
  etec: "Centro Paula Souza – ETEC",
  local: "São Paulo",
  ano: "2026",
};

const examinadores: Examinador[] = [
  { nome: "Maria Oliveira", instituicao: "ETEC", titulo: "Mestre" },
];

describe("escapeRtf", () => {
  it("escapa acentos com \\uXXXX", () => {
    const result = escapeRtf("não");
    expect(result).toMatch(/\\u227/);
    expect(result).not.toContain("não");
  });

  it("escapa chaves e barras", () => {
    const result = escapeRtf("texto {com} chaves\\e barra");
    expect(result).toContain("\\{");
    expect(result).toContain("\\}");
    expect(result).toContain("\\\\");
  });
});

describe("escapeRtfAnsi", () => {
  it("converte acentos para \\'xx", () => {
    const result = escapeRtfAnsi("ação");
    expect(result).toMatch(/\\'[0-9a-f]{2}/);
  });

  it("escapa caracteres especiais", () => {
    const result = escapeRtfAnsi("a{b}c\\d");
    expect(result).toBe("a\\{b\\}c\\\\d");
  });
});

describe("capaToRtf", () => {
  it("inclui instituição em maiúsculas", () => {
    const result = capaToRtf(cover);
    expect(result).toContain("CENTRO PAULA SOUZA");
  });

  it("inclui título em maiúsculas", () => {
    const result = capaToRtf(cover);
    expect(result).toContain("SISTEMA DE GERENCIAMENTO");
  });

  it("inclui subtítulo", () => {
    const result = capaToRtf(cover);
    expect(result).toContain("uma abordagem com banco de dados");
  });

  it("inclui cidade e ano", () => {
    const result = capaToRtf(cover);
    expect(result).toContain(ANSI_SP);
    expect(result).toContain("2026");
  });

  it("usafonte Arial 14pt (fs28) para instituiçãoe título", () => {
    const result = capaToRtf(cover);
    expect(result).toContain("\\fs28");
  });

  it("usa fonte Arial para corpo (\\f0)", () => {
    const result = capaToRtf(cover);
    expect(result).toContain("\\f0");
  });
});

describe("folhaRostoToRtf", () => {
  it("inclui nome do autor em maiúsculas", () => {
    const result = folhaRostoToRtf(cover, "Desenvolvimento de Sistemas");
    expect(result).toContain(ANSI_JOÃO);
  });

  it("inclui título Arial 14pt", () => {
    const result = folhaRostoToRtf(cover, "Desenvolvimento de Sistemas");
    expect(result).toContain("\\fs28");
    expect(result).toContain("SISTEMA DE GERENCIAMENTO");
  });

  it("inclui nota explicativa com curso e etec", () => {
    const result = folhaRostoToRtf(cover, "Desenvolvimento de Sistemas");
    expect(result).toContain(escapeRtfAnsi("Técnico em Desenvolvimento de Sistemas"));
    expect(result).toContain("Centro Paula Souza");
  });

  it("inclui orientador", () => {
    const result = folhaRostoToRtf(cover, "Desenvolvimento de Sistemas");
    expect(result).toContain(escapeRtfAnsi("Prof. José Santos"));
  });

  it("usa \\li para margem esquerda de 50%", () => {
    const result = folhaRostoToRtf(cover, "Desenvolvimento de Sistemas");
    // \li 8,5cm × 567 ≈ 4820 twips
    expect(result).toMatch(/\\li4[8-9]\d{2}/);
  });

  it("inclui cidade e ano no final", () => {
    const result = folhaRostoToRtf(cover, "Desenvolvimento de Sistemas");
    expect(result).toContain(ANSI_SP);
    expect(result).toContain("2026");
  });
});

describe("folhaAprovacaoToRtf", () => {
  it("inclui nome do autor", () => {
    const result = folhaAprovacaoToRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores);
    expect(result).toContain(ANSI_JOÃO);
  });

  it("usa Times New Roman (\\f1)", () => {
    const result = folhaAprovacaoToRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores);
    expect(result).toContain("\\f1");
  });

  it("formata data corretamente", () => {
    const result = folhaAprovacaoToRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores);
    expect(result).toContain("5 de junho de 2026");
  });

  it("inclui banca examinadora", () => {
    const result = folhaAprovacaoToRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores);
    expect(result).toContain("Maria Oliveira");
  });

  it("inclui orientador na seção de assinatura", () => {
    const result = folhaAprovacaoToRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores);
    expect(result).toContain("Professor Orientador");
  });
});

describe("generateFullRtf", () => {
  it("começa com cabeçalho RTF", () => {
    const result = generateFullRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores, "<p>teste</p>");
    expect(result).toMatch(/^\{?\\rtf1/);
  });

  it("inclui quebras de página", () => {
    const result = generateFullRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores, "<p>teste</p>");
    expect(result).toContain("\\page");
  });

  it("termina com chave de fechamento", () => {
    const result = generateFullRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores, "<p>teste</p>");
    expect(result[result.length - 1]).toBe("}");
  });

  it("inclui conteúdo do Tiptap convertido", () => {
    const result = generateFullRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores, "<p>texto do TCC</p>");
    expect(result).toContain(escapeRtfAnsi("texto do TCC"));
  });

  it("não contém tags HTML", () => {
    const result = generateFullRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores, "<p>texto</p>");
    expect(result).not.toContain("&lt;");
    expect(result).not.toContain("<p>");
    expect(result).not.toContain("</p>");
  });

  it("aplica margens ABNT em twips", () => {
    const result = generateFullRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores, "<p>texto</p>");
    expect(result).toMatch(/\\margt1701/);
    expect(result).toMatch(/\\margb1134/);
    expect(result).toMatch(/\\margl1701/);
    expect(result).toMatch(/\\margr1134/);
  });

  it("usa Arial 12pt (\\fs24)", () => {
    const result = generateFullRtf(cover, "Desenvolvimento de Sistemas", "2026-06-05", "Mogi Mirim", examinadores, "<p>texto</p>");
    expect(result).toContain("\\fs24");
  });
});

describe("tiptapToRtf — conversão de HTML", () => {
  it("converte <h1> para bold centralizado", async () => {
    const { tiptapToRtf } = await import("@/lib/exportRtf");
    const result = tiptapToRtf("<h1>1 INTRODUÇÃO</h1>");
    expect(result).toContain("\\qc");
    expect(result).toContain("\\b");
    expect(result).toContain(escapeRtfAnsi("1 INTRODUÇÃO"));
  });

  it("converte <p> com recuo de primeira linha", async () => {
    const { tiptapToRtf } = await import("@/lib/exportRtf");
    const result = tiptapToRtf("<p>parágrafo normal</p>");
    expect(result).toContain("\\fi");
    expect(result).toContain("parágrafo normal");
  });
});