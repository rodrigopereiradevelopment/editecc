export interface CoverData {
  autor: string;
  titulo: string;
  subtitulo: string;
  orientador: string;
  curso: string;
  etec: string;
  local: string;
  ano: string;
}

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  message: string;
}
