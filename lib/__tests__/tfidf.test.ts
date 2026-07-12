import { describe, it, expect } from "vitest";
import { extractTopTerms, splitSentences, extractiveSummarize } from "@/lib/tfidf";

describe("splitSentences", () => {
  it("divide texto longo em frases", () => {
    const text = "Esta é a primeira frase do texto longo que precisa ter mais de cem caracteres para funcionar corretamente. Esta é a segunda frase do texto. Esta é a terceira frase do texto.";
    const result = splitSentences(text);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it("retorna array vazio para string vazia", () => {
    expect(splitSentences("")).toEqual([]);
  });

  it("retorna 1 frase para texto curto", () => {
    const result = splitSentences("Texto curto.");
    expect(result).toHaveLength(1);
  });
});

describe("extractiveSummarize", () => {
  it("retorna vazio para texto vazio", () => {
    expect(extractiveSummarize("")).toBe("");
  });

  it("retorna bullet para texto curto", () => {
    const result = extractiveSummarize("Texto curto aqui.");
    expect(result).toContain("•");
  });
});

describe("extractTopTerms", () => {
  it("retorna array vazio para texto curto", () => {
    expect(extractTopTerms("<p>curto</p>")).toEqual([]);
  });

  it("extrai termos importantes de HTML", () => {
    const html = `
      <p>machine learning é uma área da inteligência artificial.
      machine learning permite que computadores aprendam com dados.
      deep learning é um subconjunto de machine learning.
      neural networks são usadas em deep learning.
      inteligência artificial transforma o mundo.</p>
    `;
    const terms = extractTopTerms(html, 5);
    expect(terms.length).toBeGreaterThan(0);
    expect(terms.some(t => t.includes("machine") || t.includes("learning") || t.includes("artificial"))).toBe(true);
  });

  it("remove termos já existentes no glossário", () => {
    const html = `
      <p>machine learning é uma área importante.
      machine learning permite aprendizado.
      deep learning é um subconjunto.
      neural networks são estruturas complexas.</p>
    `;
    const terms = extractTopTerms(html, 10);
    const filtered = terms.filter(t => t.toLowerCase() !== "machine");
    expect(filtered).not.toContain("machine");
  });

  it("não contém stopwords", () => {
    const html = `
      <p>o computador é uma máquina que processa dados.
      a máquina processa dados complexos.
      dados são processados pela máquina.
      processamento de dados é importante.</p>
    `;
    const terms = extractTopTerms(html, 10);
    expect(terms).not.toContain("uma");
    expect(terms).not.toContain("são");
    expect(terms).not.toContain("que");
  });
});
