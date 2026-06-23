import { describe, it, expect } from "vitest";
import { coverReducer, coverInitial, MAX_HISTORY, type CoverHistory } from "@/lib/coverReducer";

const emptyState: CoverHistory = { past: [], present: coverInitial, future: [] };

describe("coverReducer", () => {
  describe("SET_FIELD", () => {
    it("atualiza o campo presente", () => {
      const result = coverReducer(emptyState, {
        type: "SET_FIELD",
        field: "autor",
        value: "João Silva",
      });
      expect(result.present.autor).toBe("João Silva");
      expect(result.present.titulo).toBe(""); // outros campos inalterados
    });

    it("adiciona snapshot anterior ao history", () => {
      const result = coverReducer(emptyState, {
        type: "SET_FIELD",
        field: "autor",
        value: "João",
      });
      expect(result.past).toHaveLength(1);
      expect(result.past[0].autor).toBe(""); // valor antes
    });

    it("limpa future ao fazer nova edição", () => {
      const stateWithFuture: CoverHistory = {
        past: [{ ...coverInitial, autor: "Antigo" }],
        present: { ...coverInitial, autor: "Atual" },
        future: [{ ...coverInitial, author: "Futuro" } as any],
      };
      const result = coverReducer(stateWithFuture, {
        type: "SET_FIELD",
        field: "autor",
        value: "Novo",
      });
      expect(result.future).toHaveLength(0);
    });
  });

  describe("UNDO", () => {
    it("restaura último snapshot do past", () => {
      const state: CoverHistory = {
        past: [
          { ...coverInitial, autor: "V1" },
          { ...coverInitial, autor: "V2" },
        ],
        present: { ...coverInitial, autor: "V3" },
        future: [],
      };
      const result = coverReducer(state, { type: "UNDO" });
      expect(result.present.autor).toBe("V2");
      expect(result.past).toHaveLength(1);
      expect(result.future).toHaveLength(1);
      expect(result.future[0].autor).toBe("V3");
    });

    it("não faz nada quando past está vazio", () => {
      const result = coverReducer(emptyState, { type: "UNDO" });
      expect(result).toBe(emptyState); // mesmo objeto (reference equality)
    });
  });

  describe("REDO", () => {
    it("restaura primeiro snapshot do future", () => {
      const state: CoverHistory = {
        past: [{ ...coverInitial, autor: "V1" }],
        present: { ...coverInitial, autor: "V2" },
        future: [{ ...coverInitial, autor: "V3" }],
      };
      const result = coverReducer(state, { type: "REDO" });
      expect(result.present.autor).toBe("V3");
      expect(result.past).toHaveLength(2);
      expect(result.future).toHaveLength(0);
    });

    it("não faz nada quando future está vazio", () => {
      const result = coverReducer(emptyState, { type: "REDO" });
      expect(result).toBe(emptyState);
    });
  });

  describe("RESET", () => {
    it("reseta para novo cover e limpa histórico", () => {
      const state: CoverHistory = {
        past: [{ ...coverInitial, autor: "Old" }],
        present: { ...coverInitial, autor: "Current" },
        future: [{ ...coverInitial, autor: "Future" }],
      };
      const newCover = { ...coverInitial, titulo: "Novo TCC", autor: "Maria" };
      const result = coverReducer(state, { type: "RESET", cover: newCover });
      expect(result.present.titulo).toBe("Novo TCC");
      expect(result.present.autor).toBe("Maria");
      expect(result.past).toHaveLength(0);
      expect(result.future).toHaveLength(0);
    });
  });

  describe("MAX_HISTORY", () => {
    it("limita o past a MAX_HISTORY entradas", () => {
      let state = emptyState;
      for (let i = 0; i < MAX_HISTORY + 10; i++) {
        state = coverReducer(state, {
          type: "SET_FIELD",
          field: "autor",
          value: `User ${i}`,
        });
      }
      expect(state.past.length).toBeLessThanOrEqual(MAX_HISTORY);
      expect(state.present.autor).toBe(`User ${MAX_HISTORY + 9}`);
    });
  });

  describe("fluxo completo undo/redo", () => {
    it("edita → undo → redo funciona corretamente", () => {
      // 1. Editar autor
      let state = coverReducer(emptyState, {
        type: "SET_FIELD",
        field: "autor",
        value: "Maria",
      });
      expect(state.present.autor).toBe("Maria");

      // 2. Editar titulo
      state = coverReducer(state, {
        type: "SET_FIELD",
        field: "titulo",
        value: "Meu TCC",
      });
      expect(state.present.titulo).toBe("Meu TCC");
      expect(state.past).toHaveLength(2);

      // 3. Undo → volta titulo
      state = coverReducer(state, { type: "UNDO" });
      expect(state.present.titulo).toBe("");
      expect(state.present.autor).toBe("Maria");

      // 4. Undo → volta autor
      state = coverReducer(state, { type: "UNDO" });
      expect(state.present.autor).toBe("");

      // 5. Redo → autor volta
      state = coverReducer(state, { type: "REDO" });
      expect(state.present.autor).toBe("Maria");

      // 6. Redo → titulo volta
      state = coverReducer(state, { type: "REDO" });
      expect(state.present.titulo).toBe("Meu TCC");
    });
  });
});
