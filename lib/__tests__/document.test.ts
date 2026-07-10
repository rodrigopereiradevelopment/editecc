import { describe, it, expect, beforeEach } from "vitest";
import { emptyDoc, getAllDocuments, saveAllDocuments, getCurrentId, setCurrentId } from "@/lib/document";

const STORAGE_KEY = "editecc-docs";

describe("document storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("emptyDoc cria documento padrão", () => {
    const doc = emptyDoc("Meu TCC");
    expect(doc.id).toBeTruthy();
    expect(doc.title).toBe("Meu TCC");
    expect(doc.cover.autor).toBe("");
  });

  it("saveAllDocuments salva e getAllDocuments recupera", () => {
    const doc = emptyDoc("Teste");
    saveAllDocuments([doc]);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const loaded = getAllDocuments();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(doc.id);
  });

  it("getAllDocuments retorna [] quando vazio", () => {
    expect(getAllDocuments()).toEqual([]);
  });

  it("getAllDocuments retorna [] em caso de JSON inválido", () => {
    localStorage.setItem(STORAGE_KEY, "invalid json");
    expect(getAllDocuments()).toEqual([]);
  });

  it("setCurrentId e getCurrentId funcionam", () => {
    setCurrentId("abc123");
    expect(getCurrentId()).toBe("abc123");
  });

  it("getCurrentId retorna null se não existir", () => {
    expect(getCurrentId()).toBeNull();
  });

  it("emptyDoc gera ids únicos", () => {
    const a = emptyDoc();
    const b = emptyDoc();
    expect(a.id).not.toBe(b.id);
  });

  it("createAt é uma data ISO", () => {
    const doc = emptyDoc();
    expect(() => new Date(doc.createdAt)).not.toThrow();
    expect(new Date(doc.createdAt).toISOString()).toBe(doc.createdAt);
  });
});
