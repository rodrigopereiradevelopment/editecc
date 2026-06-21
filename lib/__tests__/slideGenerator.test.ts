import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseSections, gerarPPTX } from "../slideGenerator";

describe("parseSections", () => {
  it("retorna array vazio para HTML vazio", () => {
    expect(parseSections("")).toEqual([]);
  });

  it("retorna array vazio para HTML sem headings", () => {
    const html = "<p>Apenas um parágrafo</p>";
    expect(parseSections(html)).toEqual([]);
  });

  it("extrai seção com título e parágrafo", () => {
    const html = "<h1>1 INTRODUÇÃO</h1><p>Texto da introdução.</p>";
    const result = parseSections(html);
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe("Introdução");
    expect(result[0].conteudo).toBe("Texto da introdução.");
  });

  it("mapeia títulos conhecidos corretamente", () => {
    const html = `
      <h1>1 INTRODUÇÃO</h1><p>Intro text.</p>
      <h1>2 OBJETIVOS</h1><p>Objetivos text.</p>
      <h1>3 METODOLOGIA</h1><p>Metodologia text.</p>
      <h1>4 RESULTADOS</h1><p>Resultados text.</p>
      <h1>5 CONCLUSÃO</h1><p>Conclusão text.</p>
      <h1>6 REFERÊNCIAS</h1><p>Refs text.</p>
    `;
    const result = parseSections(html);
    expect(result.map((s) => s.titulo)).toEqual([
      "Introdução",
      "Objetivos",
      "Metodologia",
      "Resultados",
      "Conclusão",
      "Referências",
    ]);
  });

  it("mapeia variações de título", () => {
    const html = `
      <h1>CONSIDERAÇÕES FINAIS</h1><p>Fim.</p>
      <h1>FUNDAMENTAÇÃO TEÓRICA</h1><p>Teoria.</p>
      <h1>REVISÃO BIBLIOGRÁFICA</h1><p>Rev.</p>
    `;
    const result = parseSections(html);
    expect(result.map((s) => s.titulo)).toEqual([
      "Considerações Finais",
      "Fundamentação Teórica",
      "Revisão Bibliográfica",
    ]);
  });

  it("usa título genérico para heading desconhecido", () => {
    const html = "<h1>MEU TÍTULO CUSTOM</h1><p>Conteúdo custom.</p>";
    const result = parseSections(html);
    expect(result[0].titulo).toBe("MEU TÍTULO CUSTOM");
  });

  it("extrai H2 headings também", () => {
    const html = "<h2>2.1 Objetivo Geral</h2><p>Texto do objetivo geral.</p>";
    const result = parseSections(html);
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe("Objetivo Geral");
  });

  it("limita conteúdo a 500 caracteres", () => {
    const longText = "A".repeat(600);
    const html = `<h1>INTRODUÇÃO</h1><p>${longText}</p>`;
    const result = parseSections(html);
    expect(result[0].conteudo.length).toBe(500);
    expect(result[0].conteudo).toBe("A".repeat(500));
  });

  it("extrai apenas primeiro parágrafo, ignorando headings seguintes", () => {
    const html = `
      <h1>INTRODUÇÃO</h1>
      <p>Parágrafo um da introdução.</p>
      <p>Parágrafo dois da introdução.</p>
      <h1>OBJETIVOS</h1>
      <p>Parágrafo dos objetivos.</p>
    `;
    const result = parseSections(html);
    expect(result).toHaveLength(2);
    expect(result[0].conteudo).toBe(
      "Parágrafo um da introdução. Parágrafo dois da introdução."
    );
    expect(result[1].conteudo).toBe("Parágrafo dos objetivos.");
  });

  it("ignora headings sem conteúdo subsequente", () => {
    const html = "<h1>INTRODUÇÃO</h1><h1>OBJETIVOS</h1><p>Texto obj.</p>";
    const result = parseSections(html);
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe("Objetivos");
  });

  it("manipula HTML com tags diversas entre heading e parágrafo", () => {
    const html =
      "<h1>INTRODUÇÃO</h1><br/><strong>Nota:</strong><p>Texto real.</p>";
    const result = parseSections(html);
    expect(result[0].conteudo).toContain("Texto real.");
  });
});

describe("gerarPPTX", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:test") });
  });

  it("não lança erro com seções vazias", () => {
    expect(() =>
      gerarPPTX([], {
        titulo: "Teste",
        autor: "Autor",
        curso: "Curso",
        orientador: "Orientador",
      })
    ).not.toThrow();
  });

  it("não lança erro com seções preenchidas", () => {
    expect(() =>
      gerarPPTX(
        [
          { titulo: "Introdução", conteudo: "Texto da intro." },
          { titulo: "Objetivos", conteudo: "Texto dos obj." },
        ],
        {
          titulo: "Meu TCC",
          autor: "João",
          curso: "Informática",
          orientador: "Prof. Silva",
        }
      )
    ).not.toThrow();
  });

  it("não lança erro com capa sem dados", () => {
    expect(() =>
      gerarPPTX([{ titulo: "Seção", conteudo: "Conteúdo" }], {
        titulo: "",
        autor: "",
        curso: "",
        orientador: "",
      })
    ).not.toThrow();
  });

  it("não lança erro com seção de conteúdo muito longo", () => {
    expect(() =>
      gerarPPTX(
        [{ titulo: "Introdução", conteudo: "X".repeat(2000) }],
        {
          titulo: "TCC",
          autor: "Autor",
          curso: "Curso",
          orientador: "Orientador",
        }
      )
    ).not.toThrow();
  });
});
