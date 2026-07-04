export interface CoverData {
  autor: string;
  autores: string[];
  titulo: string;
  subtitulo: string;
  orientador: string;
  curso: string;
  etec: string;
  local: string;
  ano: string;
}

export type CoverAction =
  | { type: "SET_FIELD"; field: keyof CoverData; value: string }
  | { type: "SET_AUTORES"; value: string[] }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; cover: CoverData };

export interface CoverHistory {
  past: CoverData[];
  present: CoverData;
  future: CoverData[];
}

export const MAX_HISTORY = 50;

export const coverInitial: CoverData = {
  autor: "",
  autores: [""],
  titulo: "",
  subtitulo: "",
  orientador: "",
  curso: "",
  etec: "Centro Paula Souza – ETEC",
  local: "São Paulo",
  ano: new Date().getFullYear().toString(),
};

export function coverReducer(state: CoverHistory, action: CoverAction): CoverHistory {
  switch (action.type) {
    case "SET_FIELD": {
      const next = { ...state.present, [action.field]: action.value };
      return { past: [...state.past.slice(-MAX_HISTORY + 1), state.present], present: next, future: [] };
    }
    case "SET_AUTORES": {
      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), state.present],
        present: { ...state.present, autores: action.value },
        future: [],
      };
    }
    case "UNDO": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] };
    }
    case "REDO": {
      if (!state.future.length) return state;
      return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) };
    }
    case "RESET":
      return { past: [], present: action.cover, future: [] };
  }
}
