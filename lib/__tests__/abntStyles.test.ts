import { describe, it, expect } from "vitest";
import { generateTOC, countWords, extractFigures, extractTables, formatReference, getStyleById, getAllStyles } from "@/lib/abnt/styles";
import type { Reference } from "@/lib/abnt/styles";

describe("generateTOC", () => {
  it("extrai headings do HTML", () => {
    const html = "<h1>1 INTRODUÇÃO</h1><h2>1.1 Objetivos</h2><h3>1.1.1 Específicos</h3>";
    const toc = generateTOC(html);
    expect(toc).toHaveLength(3);
    expect(toc[0].text).toBe("1 INTRODUÇÃO");
    expect(toc[0].level).toBe(1);
    expect(toc[1].level).toBe(2);
    expect(toc[2].level).toBe(3);
  });

  it("ignora headings sem texto", () => {
    const html = "<h1></h1><h1>1 TÍTULO</h1>";
    const toc = generateTOC(html);
    expect(toc).toHaveLength(1);
  });

  it("retorna array vazio se não há headings", () => {
    expect(generateTOC("<p>apenas texto</p>")).toEqual([]);
  });
});

describe("countWords", () => {
  it("conta palavras corretamente", () => {
    expect(countWords("um dois três")).toBe(3);
  });

  it("retorna 0 para string vazia", () => {
    expect(countWords("")).toBe(0);
  });

  it("ignora espaços extras", () => {
    expect(countWords("  um   dois  ")).toBe(2);
  });
});

describe("extractFigures", () => {
  it("extrai figuras com figcaption", () => {
    const html = '<figure id="fig1"><figcaption>Figura 1 - Resultados</figcaption></figure>';
    const figs = extractFigures(html);
    expect(figs).toHaveLength(1);
    expect(figs[0].caption).toBe("Figura 1 - Resultados");
  });

  it("usa alt como fallback", () => {
    const html = '<img alt="Gráfico de vendas" />';
    const figs = extractFigures(html);
    expect(figs).toHaveLength(1);
    expect(figs[0].caption).toBe("Gráfico de vendas");
  });
});

describe("extractTables", () => {
  it("extrai tabelas com título", () => {
    const html = '<table id="tab1" title="Tabela 1 - Dados"><tr><td>a</td></tr></table>';
    const tables = extractTables(html);
    expect(tables).toHaveLength(1);
    expect(tables[0].caption).toBe("Tabela 1 - Dados");
  });

  it("usa fallback para tabela sem título", () => {
    const html = "<table><tr><td>a</td></tr></table>";
    const tables = extractTables(html);
    expect(tables).toHaveLength(1);
    expect(tables[0].caption).toContain("Tabela");
  });
});

describe("formatReference", () => {
  const base: Reference = {
    type: "book",
    authors: ["SILVA, João"],
    title: "Livro de Exemplo",
    year: 2024,
    city: "São Paulo",
    publisher: "Editora",
  };

  it("formata livro padrão", () => {
    const result = formatReference(base);
    expect(result).toContain("SILVA, João");
    expect(result).toContain("LIVRO DE EXEMPLO");
    expect(result).toContain("São Paulo");
    expect(result).toContain("Editora");
    expect(result).toContain("2024");
  });

  it("formata artigo de periódico", () => {
    const ref: Reference = { ...base, type: "article", journal: "Revista Exemplo", volume: "10", number: "2", pages: "15-30" };
    const result = formatReference(ref);
    expect(result).toContain("Revista Exemplo");
    expect(result).toContain("v.10");
    expect(result).toContain("n.2");
    expect(result).toContain("p.15-30");
  });

  it("formata site", () => {
    const ref: Reference = { ...base, type: "website", url: "https://exemplo.com", accessDate: "10 mar. 2024" };
    const result = formatReference(ref);
    expect(result).toContain("https://exemplo.com");
    expect(result).toContain("10 mar. 2024");
  });
});

describe("getStyleById / getAllStyles", () => {
  it("getStyleById retorna estilo existente", () => {
    const style = getStyleById("texto-corrente");
    expect(style).toBeDefined();
    expect(style?.label).toBe("Texto Corrente");
  });

  it("getStyleById retorna undefined para ID inválido", () => {
    expect(getStyleById("invalido" as any)).toBeUndefined();
  });

  it("getAllStyles retorna todos os estilos", () => {
    const styles = getAllStyles();
    expect(styles.length).toBeGreaterThan(0);
    expect(styles.some(s => s.id === "titulo-1")).toBe(true);
  });
});
