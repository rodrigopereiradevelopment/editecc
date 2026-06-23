<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview
- **Name**: EditeCC
- **Purpose**: Editor de textos acadêmicos com formatação ABNT automática (TCCs, monografias).
- **Stack**: Next.js 16.x (App Router), Tiptap v3, Tauri v2 (Rust), Transformers.js, PptxGenJS, Citation.js, Vitest.
- **Main Workflows**: Escrever e formatar TCC → elementos pré/pós-textuais → traduzir resumo → exportar PDF → gerar slides.

## Dev Commands

```bash
npm install --legacy-peer-deps   # install deps
npm run dev                      # dev server (Turbopack, port 3000)
npm run build                    # production build (npx next build)
npm run start                    # serve production build
npm run lint                     # ESLint
npm test                         # Vitest (unit tests)
npm run test:watch               # Vitest watch mode

# Tauri (app desktop nativo)
npm run tauri:dev                # dev com janela Tauri
npm run tauri:build:linux        # build Linux
npm run tauri:build:windows      # build Windows
```

## Architecture

- **`app/`**: Next.js App Router — landing page (`app/page.tsx`) e editor (`app/editor/page.tsx`)
- **`components/`**: 22 componentes React — Capa, FolhaRosto, FolhaAprovacao, ResumoPage, AbstractPage, AnexoPage, ApendicePage, GlossarioPage, NotasRodapePage, Editor, DocumentManager, PosTextuaisManager, etc.
- **`lib/`**: Lógica central — `lib/abnt/styles.ts` (formatação ABNT, validação, sumário), `lib/document.ts` (tipos, storage, export/import `.editecc`), `lib/slideGenerator.ts` (parser Tiptap → PPTX)
- **`hooks/`**: React hooks — `useAutosave`, `useDocuments`, `useTranslation` (Transformers.js NLLB-200), `useSummarization` (Transformers.js distilbart-cnn), `useTauri`
- **`app/editor/page.tsx`**: Entry point do editor (~900 linhas) — gerencia todo o estado + canvas A4 + sidebar + toolbar
- **Persistência**: 100% localStorage (`editecc-docs`), autosave a cada 20s
- **Desktop**: Tauri v2 — Rust backend opcional para app nativo (Linux/Windows)

## Available Subagents

Custom subagents configured in `.opencode/agents/`:

| Agent Type | Function | Model |
|------------|----------|-------|
| `qa-agent` | Generates and analyzes unit tests for Vitest, validates test coverage | opencode/big-pickle |
| `ux-agent` | UX/UI audit, accessibility (WCAG/W3C), mobile-first patterns | opencode/big-pickle |

Built-in agent types also available:

| Agent Type | Function | Model |
|------------|----------|-------|
| `explore` | Fast codebase exploration, file search, code patterns | opencode/big-pickle |
| `general` | General-purpose research and multi-step tasks | opencode/big-pickle |

Custom slash commands configured in `.opencode/commands/`:

| Command | Function | Model |
|---------|----------|-------|
| `run-tests` | Executa `npm test` e reporta resultados | opencode/big-pickle |
| `build-check` | Executa `npm run build` e reporta erros de compilação | opencode/big-pickle |
| `lint-check` | Executa `npm run lint` e reporta problemas | opencode/big-pickle |
| `update-docs` | Sincroniza AGENTS.md e README.md com o estado atual do projeto | opencode/big-pickle |

## Important Quirks

- **Package manager**: Usa `npm` (yarn não está disponível)
- **Turbopack**: Dev server usa Turbopack (não webpack) — se tiver erro de compatibilidade, use `npx next dev --webpack`
- **Peer deps**: Sempre use `--legacy-peer-deps` no `npm install`
- **Build**: `npm run build` usa `npx next build` (verificado: compila sem erros)
- **Tradução**: Transformers.js NLLB-200-distilled-600M — 1 modelo (~600MB) cobre 5 idiomas (en/es/fr/de/it), cache IndexedDB, download único
- **Sumarização**: Transformers.js distilbart-cnn-6-6 (~300MB) — carregado sob demanda quando gera slides
- **Modelos de IA**: Ambos 100% offline, sem API externa, sem cadastro
- **Rust/Cargo não disponível** neste ambiente — build Tauri não pode ser executado aqui
- **Icons**: Os SVGs dos ícones na toolbar são definidos inline em `app/editor/page.tsx`
- **Estrutura do TCC no canvas**: Capa → FolhaRosto → FolhaAprovacao → Dedicatória → Agradecimentos → Epígrafe → Resumo → Abstract → Editor → ListaFigTab → Anexos → Apêndices → Glossário → NotasRodape
- **PDF**: Export via `window.print()` — funciona bem com margens ABNT via CSS `@page`

## Test Status

```bash
# 1 suite, 21 tests passing
npm test
```

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Rust + Cargo (apenas para build Tauri)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **editecc** (439 symbols, 714 relationships, 16 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/editecc/context` | Codebase overview, check index freshness |
| `gitnexus://repo/editecc/clusters` | All functional areas |
| `gitnexus://repo/editecc/processes` | All execution flows |
| `gitnexus://repo/editecc/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
