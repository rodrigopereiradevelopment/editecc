import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorToolbar } from "@/components/EditorToolbar";
import { EditorStatusBar } from "@/components/EditorStatusBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EditorSkeleton } from "@/components/EditorSkeleton";

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

  it("renderiza botões de heading H1/H2/H3", () => {
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
    expect(screen.getByLabelText("Título 1")).toBeDefined();
    expect(screen.getByLabelText("Título 2")).toBeDefined();
    expect(screen.getByLabelText("Título 3")).toBeDefined();
  });

  it("chama applyFormat ao clicar em H1", () => {
    const spy = vi.fn();
    render(
      <EditorToolbar
        applyFormat={spy}
        handleGerarSlides={() => {}}
        handleExportPdf={() => {}}
        slidesLoading={false}
        slidesProgress={0}
        slidesStatus=""
        savedMsg={false}
        onOpenShortcuts={() => {}}
      />
    );
    fireEvent.mouseDown(screen.getByLabelText("Título 1"));
    expect(spy).toHaveBeenCalledWith("toggleHeading", { level: 1 });
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
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>
    );
    expect(screen.getByText("Erro ao carregar")).toBeDefined();
    consoleSpy.mockRestore();
  });
});

describe("EditorSkeleton", () => {
  it("renderiza estrutura do skeleton", () => {
    const { container } = render(<EditorSkeleton />);
    expect(container.querySelector("aside")).toBeDefined();
  });
});
