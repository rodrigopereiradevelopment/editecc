import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

describe("ErrorBoundary", () => {
  it("renderiza children quando não há erro", () => {
    render(
      <ErrorBoundary>
        <p>Conteúdo normal</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Conteúdo normal")).toBeDefined();
  });

  it("renderiza fallback customizado quando presente", () => {
    const Throw = () => { throw new Error("Teste erro"); };
    render(
      <ErrorBoundary fallback={<p>Fallback customizado</p>}>
        <Throw />
      </ErrorBoundary>
    );
    expect(screen.getByText("Fallback customizado")).toBeDefined();
  });

  it("renderiza fallback padrão em caso de erro", () => {
    const Throw = () => { throw new Error("Algo quebrou"); };
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>
    );
    expect(screen.getByText("Erro ao carregar")).toBeDefined();
  });
});
