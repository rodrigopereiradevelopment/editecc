import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorToolbar } from "@/components/EditorToolbar";
import { EditorStatusBar } from "@/components/EditorStatusBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

describe("EditorToolbar", () => {
  it("renderiza botões de formatação", () => {
    render(
      <EditorToolbar
        applyFormat={() => {}}
        handleGerarSlides={() => {}}
        handleExportPdf={() => {}}
        slidesLoading={false}
        slidesProgress={0}
        slidesStatus=""
        savedMsg={false}
        onOpenShortcuts={() => {}}
      />
    );
    expect(screen.getByLabelText("Negrito")).toBeDefined();
    expect(screen.getByLabelText("Itálico")).toBeDefined();
    expect(screen.getByLabelText("Sublinhado")).toBeDefined();
    expect(screen.getByLabelText("Atalhos de teclado")).toBeDefined();
  });

  it("exibe mensagem de salvo quando savedMsg=true", () => {
    render(
      <EditorToolbar
        applyFormat={() => {}}
        handleGerarSlides={() => {}}
        handleExportPdf={() => {}}
        slidesLoading={false}
        slidesProgress={0}
        slidesStatus=""
        savedMsg={true}
        onOpenShortcuts={() => {}}
      />
    );
    expect(screen.getByText("Salvo")).toBeDefined();
  });
});

describe("EditorStatusBar", () => {
  it("renderiza contagem de palavras e caracteres", () => {
    render(<EditorStatusBar wordCount={150} charCount={850} />);
    expect(screen.getByText("150")).toBeDefined();
    expect(screen.getByText("850")).toBeDefined();
  });
});

describe("ErrorBoundary", () => {
  it("renderiza children quando não há erro", () => {
    render(
      <ErrorBoundary>
        <p>Conteúdo normal</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Conteúdo normal")).toBeDefined();
  });

  it("renderiza fallback quando há erro", () => {
    const Throws = () => { throw new Error("test error"); };
    render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>
    );
    expect(screen.getByText("Erro ao carregar")).toBeDefined();
  });
});
