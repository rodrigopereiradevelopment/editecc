# EditeCC ✏️

**Editor de textos acadêmicos com formatação ABNT automática.**

Desenvolvido para estudantes que precisam formatar TCCs, monografias e trabalhos acadêmicos sem perder horas configurando margens e estilos no Word.

> Projeto open source — clone, instale e use. Sem APIs externas, sem cadastro, sem cobrança.

---

## ✨ Funcionalidades (v0.7)

- 📄 **Folha A4** simulada com margens ABNT (3cm esq/sup, 2cm dir/inf)
- 🎨 **Editor rico com Tiptap** — Negrito, Itálico, Sublinhado, Justificar, Títulos H1/H2/H3
- 📋 **Capa automática** — gerada em tempo real conforme você preenche o formulário
- 📃 **Folha de Rosto, Folha de Aprovação** — elementos pré-textuais obrigatórios
- 📖 **Dedicatória, Agradecimentos, Epígrafe** — elementos pré-textuais opcionais
- 📝 **Resumo + Abstract** — campos dedicados com contador de palavras, renderizados como páginas A4
- 🌐 **Tradução automática Transformers.js** — resumo pt→en/es/fr/de/it, 100% local (NLLB-200, ~600MB)
- 📑 **Sumário automático** a partir dos headings do documento
- 📚 **Gerador de referências com Citation.js** — DOI, ISBN, BibTeX → ABNT NBR 6023
- 🖼️ **Lista de Figuras e Tabelas automática**
- 📄 **Anexos, Apêndices, Glossário** — elementos pós-textuais com identificação por letras
- 📝 **Notas de Rodapé** — gerenciador com inserção de marcadores no texto
- 📽️ **Gerador de Slides v2** — sumarização automática das seções via Transformers.js (`distilbart-cnn`), formatação em bullets, geração `.pptx` (parser H1/H2 + PptxGenJS)
- ♿ **Acessibilidade WCAG 2.2** — landmarks (`<main>`, `<nav>`, `<aside>`), `aria-label` em botões com ícone, `:focus-visible`, skip link, `aria-live` em notificações, `prefers-reduced-motion`
- 👋 **Onboarding** — tela de boas-vindas no primeiro acesso com "Novo TCC" e "Importar .editecc"
- 🎯 **Atalhos de teclado visíveis** — modal com todas as combinações (Ctrl+B/I/U/Z/Y, Esc, Ctrl+P)
- 💡 **Tema claro/escuro** — toggle com ícone sol/lua no painel lateral, CSS variables internas
- ⌨️ **Skeleton loading** — shimmer animado simulando sidebar + toolbar + canvas A4 durante carregamento
- 🔤 **Botões de heading** — H1/H2/H3 na toolbar para aplicar títulos ABNT com um clique
- ✅ **Validador ABNT** — detecta problemas de formatação, seções faltando e tamanho do resumo
- 📄 **Numeração de página** automática no canto inferior direito
- 📁 **Múltiplos documentos** — crie, renomeie, exporte e importe documentos `.editecc`
- 💾 **Autosave** a cada 20 segundos
- 📤 **Exportar PDF** via impressão nativa
- 🖥️ **Build Tauri funcional** — app desktop nativo Linux/Windows

---

## 🗺️ Roadmap

| Versão | Status | Funcionalidades |
|--------|--------|----------------|
| **v0.1** | ✅ Concluído | MVP: editor + capa + sumário + autosave + PDF |
| **v0.1.1** | ✅ Concluído | Folha de Rosto, Resumo, Abstract — conformidade com Manual ETEC 2022 |
| **v0.2** | ✅ Concluído | Gerador de referências (Citation.js), Lista de Figuras/Tabelas automática |
| **v0.3** | ✅ Concluído | Folha de Aprovação, Dedicatória, Agradecimentos, Epígrafe, Tradução Transformers.js (5 idiomas), numeração de página, recuo 2,5cm |
| **v0.4** | ✅ Concluído | Export `.editecc`, suporte a múltiplos documentos |
| **v0.5** | ✅ Concluído | Build Tauri — app desktop nativo Linux/Windows |
| **v0.6** | ✅ Concluído | Anexos, Apêndices, Glossário, Notas de rodapé |
| **v0.7** | ✅ Concluído | Gerador de slides (parser H1/H2 + PptxGenJS + placeholder 1º parágrafo) |
| **v0.8** | ✅ Concluído | Gerador de slides v2: sumarização de seções via Transformers.js (`distilbart-cnn`) em vez do primeiro parágrafo — bullets formatados, loading com progresso na toolbar |
| **v0.9** | ✅ Concluído | Acessibilidade (WCAG 2.2): aria-labels, foco visível, landmarks (main/nav/aside), skip link, live regions, reduced motion |
| **v0.9.1** | ✅ Concluído | Onboarding (boas-vindas + Novo/Importar), estados vazios, responsivo mínimo (min-width 1024px) |
| **v0.9.2** | ✅ Concluído | Atalhos de teclado visíveis (modal), landing page (hero + features grid + steps + CTA), tema claro (CSS variables + toggle) |
| **v0.9.3** | ✅ Concluído | Skeleton loading (canvas + sidebar + toolbar), atalhos H1/H2/H3 na toolbar, documentação de uso (USAGE.md) |
| **v0.9.4** | ✅ Concluído | Performance (debounce coverData), tema claro na landing page, atalho Ctrl+Shift+S para slides, heurística isNewDoc robusta, persistência de tema em localStorage, undo/redo para dados da capa (reducer + Ctrl+Z) |
| **v0.9.5** | ✅ Concluído | Testes de integração (coverReducer: 10 testes), cache de status de modelo em localStorage, refatoração coverReducer para módulo separado |
| **v0.9.6** | ✅ Concluído | Folha de Aprovação completa: examinadores editáveis (nome, título, instituição), cidade, UI no sidebar, persistência em EditeccDocument |
| **v1.0.0** | 🎯 Meta | Build Tauri para Linux/Windows/Mac — download direto sem clonar |

---

## 🚀 Como usar

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
git clone https://github.com/rodrigopereiradevelopment/editecc.git
cd editecc
npm install --legacy-peer-deps
npm run dev
```

Acesse `http://localhost:3000` no navegador.

> **Linux/Mac:** `npm run dev` normal.  
> **Android (Termux):** `npm run dev -- --webpack` (Turbopack não suporta arm64).

### Build para produção

```bash
npm run build
npm start
```

---

## 🏗️ Arquitetura

```
editecc/
├── app/
│   ├── layout.tsx              # Layout raiz + metadados
│   ├── globals.css             # Estilos ABNT globais (Arial 12pt, margens, citações)
│   ├── page.tsx                # Landing page
│   └── editor/
│       └── page.tsx            # Página do editor (Tiptap + sidebar + canvas)
├── components/
│   ├── Capa.tsx                # Folha da Capa ABNT
│   ├── FolhaRosto.tsx          # Folha de Rosto ABNT
│   ├── FolhaAprovacao.tsx      # Folha de Aprovação (banca examinadora)
│   ├── Dedicatoria.tsx         # Dedicatória (opcional)
│   ├── Agradecimentos.tsx      # Agradecimentos (opcional)
│   ├── Epigrafe.tsx            # Epígrafe (opcional)
│   ├── ResumoPage.tsx          # Resumo renderizado como página A4
│   ├── AbstractPage.tsx        # Abstract renderizado como página A4
│   ├── ResumoSection.tsx       # Campo de Resumo com contador de palavras
│   ├── AbstractSection.tsx     # Campo de Abstract com tradução automática
│   ├── GeradorReferencias.tsx  # Gerador de referências com Citation.js
│   └── ListaFigurasTabelas.tsx # Lista automática de figuras e tabelas
├── lib/
│   └── abnt/
│       └── styles.ts           # Estilos, validações e gerador de sumário ABNT
├── hooks/
│   ├── useAutosave.ts          # Autosave (localStorage e IndexedDB)
│   ├── useTranslation.ts       # Tradução Transformers.js (NLLB-200, 5 idiomas)
│   └── useTauri.ts             # Abstração para backend Rust do Tauri
└── src-tauri/                  # Backend Rust para build desktop (Tauri)
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Editor | Tiptap v3 + ProseMirror |
| Persistência | localStorage / IndexedDB |
| Desktop | Tauri v2 (Rust) — build Linux/Windows funcional |
| Referências | Citation.js (DOI, ISBN, BibTeX → ABNT NBR 6023) |
| Tradução | Transformers.js (NLLB-200, 100% local, 5 idiomas) |

---

## 📐 Padrão ABNT Implementado

Baseado no **Manual de TCC das ETECs (2022)** e na **ABNT NBR 14724:2011**.

| Elemento | Configuração |
|----------|-------------|
| Margens | 3cm (sup/esq), 2cm (inf/dir) |
| Fonte | Arial 12pt (conforme Manual ETEC 2022) |
| Espaçamento | 1,5 entre linhas |
| Recuo de parágrafo | 2,5cm na primeira linha |
| Título 1 (seção primária) | 12pt, negrito, maiúsculas, centralizado |
| Título 2 (seção secundária) | 12pt, negrito, à esquerda |
| Título 3 (seção terciária) | 12pt, negrito, itálico, à esquerda |
| Citação longa (>3 linhas) | 10pt, espaço simples, recuo 4cm |
| Referências | 12pt, espaço simples, linha em branco entre entradas |
| Resumo / Abstract | 10pt, espaço simples, parágrafo único sem recuo, 150–500 palavras |
| Título/Subtítulo na Capa | Arial 14pt, maiúsculas, centralizado |
| Numeração de página | Canto inferior direito (todas as páginas) |
| Norma base | ABNT NBR 14724:2011 |

---

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças grandes, abra uma issue primeiro.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit (`git commit -m 'feat: adiciona gerador de referências'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

MIT — use, modifique e distribua livremente.

---

*Feito com ☕ para os estudantes da ETEC e de todo o Brasil.*