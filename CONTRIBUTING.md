# Contribuindo com o EditeCC

Obrigado pelo interesse em contribuir! 🎉

## Setup Dev

```bash
git clone https://github.com/rodrigopereiradevelopment/editecc.git
cd editecc
npm install --legacy-peer-deps
npm run dev
```

Acesse `http://localhost:3000`.

- Node.js >= 18
- npm >= 9
- Rust + Cargo (apenas para build Tauri — não obrigatório para contribuir com frontend)

## Commits

Commits pequenos e descritivos, com prefixo:

| Prefixo | Exemplo |
|---------|---------|
| `feat:` | `feat: glossário semi-automático com TF-IDF` |
| `fix:` | `fix: referências undefined no formatReference` |
| `refactor:` | `refactor: extrai stripFlex para função separada` |
| `test:` | `test: adiciona edge cases para formatReference` |
| `docs:` | `docs: atualiza README com v1.0.1` |
| `ci:` | `ci: fix Windows npm ci com --force` |

## Testes

```bash
npm test        # Vitest (11 suites, 146+ testes)
npm run lint    # ESLint
```

- Testes novos são **obrigatórios** para features novas
- `npm run lint` precisa passar antes de abrir PR
- Todo `formatReference` tem testes de edge case (undefined, empty, etc.)

## Code Style

- ESLint + TypeScript estrito
- Componentes React com `"use client";` no topo
- Sem comentários no código (código autoexplicativo)
- Mesmo estilo de formatação do resto do projeto

## PR Checklist

- [ ] `npm run lint` passa sem erros
- [ ] `npm test` passa (incluindo testes novos)
- [ ] Commits pequenos e descritivos
- [ ] Não quebra compatibilidade com documentos `.editecc` salvos
- [ ] Features novas têm testes

## Cuidados

- **Tauri (Rust)**: não temos Rust/Cargo neste ambiente. Builds Tauri só via GitHub Actions (push de tag `v*`)
- **Static Export**: o build Tauri usa `output: export`. Qualquer nova rota precisa ser compatível com exportação estática
- **Transformers.js**: modelos NLLB-200 (~600MB) e distilbart (~300MB) carregados sob demanda. Cache via IndexedDB. Sem API externa.
- **localStorage**: persistência 100% local (`editecc-docs`). Não quebrar o schema de documentos existentes.

## Áreas que aceitam contribuição

| Área | Descrição |
|------|-----------|
| ABNT | Regras de formatação, validação, estilos |
| Editor | Tiptap, UI, canvas A4, toolbar |
| Exportação | RTF, PDF, DOC, Slides |
| UX/UI | Acessibilidade WCAG, tema, layout responsivo |
| Performance | TF-IDF, carregamento de modelos, autosave |
| Tauri | Cuidado — build só roda no CI |
