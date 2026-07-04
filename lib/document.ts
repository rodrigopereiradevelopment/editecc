"use client";

import type { Reference } from "@/lib/abnt/styles";
import type { PosTextualItem } from "@/components/PosTextuaisManager";
import type { GlossarioEntry } from "@/components/GlossarioManager";
import type { NotaRodape } from "@/components/NotasRodapeManager";

export interface Examinador {
  nome: string;
  instituicao: string;
  titulo: string;
}

export interface EditeccDocument {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  cover: {
    autor: string;
    autores: string[];
    titulo: string;
    subtitulo: string;
    orientador: string;
    curso: string;
    etec: string;
    local: string;
    ano: string;
  };
  resumo: string;
  palavrasChave: string[];
  abstract: string;
  keywords: string[];
  abstractLang: string;
  content: string;
  refs: Reference[];
  dedicatoriaTexto: string;
  agradecimentosTexto: string;
  epigrafeTexto: string;
  epigrafeAutor: string;
  aprovacaoData: string;
  aprovacaoCidade: string;
  examinadores: Examinador[];
  showFolhaRosto: boolean;
  showAprovacao: boolean;
  showDedicatoria: boolean;
  showAgradecimentos: boolean;
  showEpigrafe: boolean;
  showResumoPage: boolean;
  showAbstractPage: boolean;
  showFigList: boolean;
  anexos: PosTextualItem[];
  apendices: PosTextualItem[];
  glossario: GlossarioEntry[];
  notasRodape: NotaRodape[];
  showAnexos: boolean;
  showApendices: boolean;
  showGlossario: boolean;
  showNotasRodape: boolean;
}

const STORAGE_KEY = "editecc-docs";
const CURRENT_KEY = "editecc-current";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function emptyDoc(title = "Novo TCC"): EditeccDocument {
  return {
    id: generateId(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cover: {
      autor: "",
      autores: [""],
      titulo: "",
      subtitulo: "",
      orientador: "",
      curso: "",
      etec: "Centro Paula Souza – ETEC",
      local: "São Paulo",
      ano: new Date().getFullYear().toString(),
    },
    resumo: "",
    palavrasChave: [],
    abstract: "",
    keywords: [],
    abstractLang: "en",
    content: `<h1>1 INTRODUÇÃO</h1><p></p>`,
    refs: [],
    dedicatoriaTexto: "",
    agradecimentosTexto: "",
    epigrafeTexto: "",
    epigrafeAutor: "",
    aprovacaoData: "",
    aprovacaoCidade: "",
    examinadores: [],
    showFolhaRosto: false,
    showAprovacao: false,
    showDedicatoria: false,
    showAgradecimentos: false,
    showEpigrafe: false,
    showResumoPage: false,
    showAbstractPage: false,
    showFigList: false,
    anexos: [],
    apendices: [],
    glossario: [],
    notasRodape: [],
    showAnexos: false,
    showApendices: false,
    showGlossario: false,
    showNotasRodape: false,
  };
}

export function getAllDocuments(): EditeccDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveAllDocuments(docs: EditeccDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw new Error("Espaço de armazenamento esgotado. Exporte e limpe documentos antigos.");
    }
    throw new Error(`Erro ao salvar: ${err instanceof Error ? err.message : "desconhecido"}`);
  }
}

export function getCurrentId(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentId(id: string): void {
  try {
    localStorage.setItem(CURRENT_KEY, id);
  } catch {
    // Fallha silenciosa — id não crítico
  }
}

export function exportDoc(doc: EditeccDocument): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.editecc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDoc(file: File): Promise<EditeccDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const doc = JSON.parse(reader.result as string) as EditeccDocument;
        if (!doc.id || !doc.cover) {
          reject(new Error("Arquivo .editecc inválido"));
          return;
        }
        doc.id = generateId();
        doc.updatedAt = new Date().toISOString();
        resolve(doc);
      } catch {
        reject(new Error("Erro ao ler arquivo .editecc"));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
}

// Migrate legacy v0.2 single-doc data
export function migrateLegacy(): EditeccDocument | null {
  const old = localStorage.getItem("editecc-v0.2") || localStorage.getItem("editecc-v0.1.1");
  if (!old) return null;
  try {
    const parsed = JSON.parse(old);
    const doc = emptyDoc(parsed.cover?.titulo?.trim() || "Meu TCC");
    if (parsed.cover) Object.assign(doc.cover, parsed.cover);
    if (parsed.resumo) doc.resumo = parsed.resumo;
    if (parsed.palavrasChave) doc.palavrasChave = parsed.palavrasChave;
    if (parsed.abstract) doc.abstract = parsed.abstract;
    if (parsed.keywords) doc.keywords = parsed.keywords;
    if (parsed.abstractLang) doc.abstractLang = parsed.abstractLang;
    if (parsed.content) doc.content = parsed.content;
    if (parsed.refs) doc.refs = parsed.refs;
    if (parsed.dedicatoriaTexto) doc.dedicatoriaTexto = parsed.dedicatoriaTexto;
    if (parsed.agradecimentosTexto) doc.agradecimentosTexto = parsed.agradecimentosTexto;
    if (parsed.epigrafeTexto) doc.epigrafeTexto = parsed.epigrafeTexto;
    if (parsed.epigrafeAutor) doc.epigrafeAutor = parsed.epigrafeAutor;
    if (parsed.aprovacaoData) doc.aprovacaoData = parsed.aprovacaoData;
    return doc;
  } catch {
    return null;
  }
}
