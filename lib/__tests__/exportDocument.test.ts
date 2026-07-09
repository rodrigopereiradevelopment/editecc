import { describe, it, expect, beforeEach } from "vitest";

describe("stripFlex — casos reais do canvas", () => {
  beforeEach(() => {
    // Monta 3 páginas espelhando o HTML real do canvas do usuário
    document.body.innerHTML = `
      <!-- Capa -->
      <div class="a4-page" style="background:white;width:21cm;min-height:29.7cm;padding:3cm 2cm 2cm 3cm;display:flex;flex-direction:column;align-items:center;font-family:Arial;font-size:12pt;">
        <p style="font-size:14pt;font-weight:bold;text-align:center;text-transform:uppercase;">Centro Paula Souza</p>
        <p style="font-size:12pt;text-align:center;">Desenvolvimento de Sistemas</p>
        <div style="flex:0 0 4cm"></div>
        <div style="text-align:center;"><p style="font-weight:bold;">João da Silva</p></div>
        <div style="flex:1 1 0%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
          <p style="font-size:14pt;font-weight:bold;">Sistema de Gerenciamento</p>
          <p style="font-size:12pt;">uma abordagem com BD</p>
        </div>
        <div style="text-align:center;"><p>São Paulo</p><p>2026</p></div>
      </div>

      <!-- Folha de Rosto -->
      <div class="a4-page" style="background:white;width:21cm;min-height:29.7cm;padding:3cm 2cm 2cm 3cm;display:flex;flex-direction:column;align-items:center;font-family:Arial;font-size:12pt;">
        <p style="font-size:14pt;font-weight:bold;text-align:center;">João da Silva</p>
        <div style="flex:0 0 5cm"></div>
        <div style="text-align:center;">
          <p style="font-size:14pt;font-weight:bold;">Sistema de Gerenciamento</p>
          <p style="font-size:10pt;">Trabalho de Conclusão de Curso</p>
        </div>
        <div style="flex:0 0 2cm"></div>
        <div style="text-align:justify;width:18cm;"><p>Texto da nota...</p></div>
        <div style="flex:0 0 2cm"></div>
        <div style="text-align:center;"><p>Orientador: Prof. José</p></div>
        <div style="flex:1 1 0%"></div>   <!-- ← SPACER ELÁSTICO VAZIO -->
        <div style="text-align:center;"><p>São Paulo</p><p>2026</p></div>
      </div>

      <!-- Folha de Aprovação -->
      <div class="a4-page" style="background:white;width:21cm;min-height:29.7cm;padding:3cm 2cm 2cm 3cm;display:flex;flex-direction:column;align-items:center;font-family:Arial;font-size:12pt;">
        <p style="font-size:14pt;font-weight:bold;text-align:center;">João da Silva</p>
        <p style="font-size:14pt;font-weight:bold;text-align:center;">Sistema de Gerenciamento</p>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;gap:1.5cm;width:100%;">
          <div style="text-align:center;"><p style="font-size:12pt;">Prof. José</p></div>
        </div>
        <div style="text-align:center;"><p>São Paulo</p><p>2026</p></div>
      </div>
    `;
  });

  it("Capa: spacer fixo vira height", async () => {
    const html = (await import("@/lib/exportDocument")).getFullDocumentHTML();
    expect(html).toContain("height: 4cm");
  });

  it("Capa: container título preserva flex+display:flex (centralização vertical)", async () => {
    const html = (await import("@/lib/exportDocument")).getFullDocumentHTML();
    // Container título: flex:1 + display:flex → preserva flex (Tipo 2a)
    expect(html).toContain("display:flex");
    expect(html).toContain("justify-content:center");
    // Gap removido mas flex mantido
    expect(html).not.toContain("gap:");
  });

  it("FolhaRosto: spacer elástico vazio (flex:1 1 0%) vira height 5cm", async () => {
    const html = (await import("@/lib/exportDocument")).getFullDocumentHTML();
    // O 7º spacer entre "Orientador: Prof." e "São Paulo" tem flex:1 1 0%
    expect(html).toContain("height: 5cm");
  });

  it("FolhaAprovacao: container preserva flex+display:flex (layout interno)", async () => {
    const html = (await import("@/lib/exportDocument")).getFullDocumentHTML();
    // Container assinatura: flex:1 + display:flex → preserva flex (Tipo 2a)
    // Gap e flex sizing removidos, layout mantido
    expect(html).not.toContain("gap: 1.5cm");
    expect(html).toContain("display:flex");
    expect(html).toContain("flex-direction:column");
    expect(html).toContain("justify-content:flex-start");
    // Conteúdo preservado
    expect(html).toContain("Prof. José");
  });

  it("flex sizing removido, layout flex preservado", async () => {
    const html = (await import("@/lib/exportDocument")).getFullDocumentHTML();
    // Sizing removido
    expect(html).not.toContain("flex: 1 1 0%");
    expect(html).not.toContain("flex: 0 0 4cm");
    expect(html).not.toContain("flex: 0 0 5cm");
    expect(html).not.toContain("flex: 0 0 2cm");
    expect(html).not.toContain("flex-grow");
    expect(html).not.toContain("flex-shrink");
    expect(html).not.toContain("flex-basis");
    expect(html).not.toContain("flex-wrap");
    expect(html).not.toContain("gap:");
    // Layout interno preservado (display:flex, justify-content, align-items, flex-direction)
    // para que Capa e FolhaRosto mantenham centralização vertical
    expect(html).toContain("display:flex");
    expect(html).toContain("flex-direction:column");
    expect(html).toContain("justify-content:center");
    expect(html).toContain("align-items:center");
  });

  it("page-break-before nas páginas 2+", async () => {
    const html = (await import("@/lib/exportDocument")).getFullDocumentHTML();
    // Cada inline adiciona page-break-before:always + mso-page-break-before:always
    // O regex /page-break-before:\s*always/ também pega o mso (contém a string)
    // CSS usa page-break-after (não conta), então são apenas os inline: 2 páginas × 2
    const matches = html.match(/page-break-before:\s*always/g);
    expect(matches?.length).toBe(4); // 2 páginas × 2 (mso+normal)
  });
});
