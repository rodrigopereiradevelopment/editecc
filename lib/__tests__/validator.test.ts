import { describe, it, expect } from "vitest";
import { validateDocument } from "@/lib/abnt/styles";

describe("validateDocument", () => {
  it("retorna warning se faltar Introdução", () => {
    const issues = validateDocument("<h1>2 REVISÃO</h1><p>texto</p>");
    expect(issues.some(i => i.message.includes("INTRODUÇÃO"))).toBe(true);
  });

  it("retorna warning se faltar Conclusão", () => {
    const issues = validateDocument("<h1>1 INTRODUÇÃO</h1><p>texto</p>");
    expect(issues.some(i => i.message.includes("CONCLUSÃO") || i.message.includes("CONSIDERAÇÕES"))).toBe(true);
  });

  it("retorna error se faltar Referências", () => {
    const issues = validateDocument("<h1>1 INTRODUÇÃO</h1><p>texto</p>");
    expect(issues.some(i => i.type === "error" && i.message.includes("REFERÊNCIAS"))).toBe(true);
  });

  it("documento completo passa sem warnings críticos", () => {
    const html = "<h1>1 INTRODUÇÃO</h1><p>texto</p><h1>3 CONCLUSÃO</h1><p>fim</p><p>REFERÊNCIAS</p>";
    const issues = validateDocument(html);
    const errors = issues.filter(i => i.type === "error");
    expect(errors).toHaveLength(0);
  });

  it("detecta hierarquia quebrada (H3 direto após H1)", () => {
    const html = "<h1>1 INTRODUÇÃO</h1><h3>1.1.1 Detalhe</h3><p>texto</p>";
    const issues = validateDocument(html);
    expect(issues.some(i => i.message.includes("Hierarquia"))).toBe(true);
  });

  it("hierarquia correta não gera warning", () => {
    const html = "<h1>1 INTRODUÇÃO</h1><h2>1.1 Objetivos</h2><p>texto</p>";
    const issues = validateDocument(html);
    expect(issues.some(i => i.message.includes("Hierarquia"))).toBe(false);
  });

  it("avisa títulos sem numeração", () => {
    const html = "<h1>INTRODUÇÃO</h1><p>texto</p>";
    const issues = validateDocument(html);
    expect(issues.some(i => i.message.includes("numeração"))).toBe(true);
  });

  it("resumo curto gera warning", () => {
    const html = "<h1>1 INTRODUÇÃO</h1><p>texto</p><h1>RESUMO</h1><p>apenas algumas palavras aqui</p>";
    const issues = validateDocument(html);
    expect(issues.some(i => i.message.includes("150"))).toBe(true);
  });

  it("documento válido retorna sucesso", () => {
    const html = "<h1>1 INTRODUÇÃO</h1><p>texto</p><h1>3 CONCLUSÃO</h1><p>fim</p><p>REFERÊNCIAS</p>";
    const issues = validateDocument(html);
    const hasError = issues.some(i => i.type === "error");
    expect(hasError).toBe(false);
  });

  it("não gera erro para citação longa com 3+ linhas", () => {
    const html = `<h1>1 INTRODUÇÃO</h1><blockquote><p>linha 1</p><p>linha 2</p><p>linha 3</p></blockquote><h1>3 CONCLUSÃO</h1><p>fim</p><p>REFERÊNCIAS</p>`;
    const issues = validateDocument(html);
    expect(issues.some(i => i.message.includes("citação"))).toBe(false);
  });
});
