# EditeCC ✏️

**Editor de textos acadêmicos com formatação ABNT automática.**

Desenvolvido para estudantes que precisam formatar TCCs, monografias e trabalhos acadêmicos sem perder horas configurando margens e estilos no Word.

> **Versão atual: v1.0.1** — [Baixar](https://github.com/rodrigopereiradevelopment/editecc/releases/tag/v1.0.1) | [Versão Web](https://editecc.vercel.app)

---

## ✨ Funcionalidades (v1.0.1)

- 📄 **Folha A4** simulada com margens ABNT (3cm esq/sup, 2cm dir/inf)
- 🎨 **Editor rico com Tiptap** — Negrito, Itálico, Sublinhado, Justificar, Títulos H1/H2/H3
- 📋 **Capa automática** — gerada em tempo real conforme você preenche o formulário
- 📃 **Folha de Rosto, Folha de Aprovação** — elementos pré-textuais obrigatórios
- 📖 **Dedicatória, Agradecimentos, Epígrafe** — elementos pré-textuais opcionais
- 📝 **Resumo + Abstract** — campos dedicados com contador de palavras, renderizados como páginas A4
- 🌐 **Tradução automática Transformers.js** — resumo pt→en/es/fr/de/it, 100% local (NLLB-200)
- 📑 **Sumário automático** a partir dos headings do documento (com split de páginas longas)
- 📚 **Gerador de referências com Citation.js** — DOI, ISBN, BibTeX → ABNT NBR 6023 (com guards para campos indefinidos)
- 🖼️ **Lista de Figuras e Tabelas automática**
- 📄 **Anexos, Apêndices, Glossário** — elementos pós-textuais com identificação por letras
- 📖 **Glossário semi-automático** — TF-IDF detecta termos importantes do texto, você define as definições
- 📝 **Notas de Rodapé** — gerenciador com inserção de marcadores no texto
- 📽️ **Gerador de Slides** — sumarização extrativa TF-IDF offline, formatação em bullets, geração `.pptx`
- 🔍 **Tamanho da interface ajustável** — sidebar, labels, inputs e textareas com 4 níveis (P/M/G/XG)
- ♿ **Acessibilidade WCAG 2.2** — landmarks, aria-labels, foco visível, skip link, reduced motion
- 👋 **Onboarding** — tela de boas-vindas no primeiro acesso
- 🎯 **Atalhos de teclado** — Ctrl+B/I/U/Z/Y, Esc, Ctrl+P
- 💡 **Tema claro/escuro** — toggle com CSS variables
- ✅ **Validador ABNT** — hierarquia de seções, numeração, itálico em obras, citações longas
- 📁 **Múltiplos documentos** — crie, renomeie, exporte e importe documentos `.editecc`
- 💾 **Autosave** a cada 20 segundos
- 📤 **Exportar PDF** — impressão nativa com margens ABNT corretas
- 📝 **Exportar RTF** — compatível com Word, LibreOffice e Google Docs
- 🖥️ **App desktop** — Windows (.exe), Linux (.deb, .AppImage, .rpm), macOS (.dmg)
- 🤖 **CI/CD** — GitHub Actions com lint, test, build e tauri-action

---

## 🗺️ Roadmap

| Versão | Status | Funcionalidades |
|--------|--------|----------------|
| **v0.1** | ✅ Concluído | MVP: editor + capa + sumário + autosave + PDF |
| **v0.1.1** | ✅ Concluído | Folha de Rosto, Resumo, Abstract |
| **v0.2** | ✅ Concluído | Gerador de referências (Citation.js), Lista de Figuras/Tabelas |
| **v0.3** | ✅ Concluído | Folha de Aprovação, Dedicatória, Agradecimentos, Epígrafe, Tradução |
| **v0.4** | ✅ Concluído | Export `.editecc`, múltiplos documentos |
| **v0.5** | ✅ Concluído | Build Tauri — app desktop Linux/Windows |
| **v0.6** | ✅ Concluído | Anexos, Apêndices, Glossário, Notas de rodapé |
| **v0.7** | ✅ Concluído | Gerador de slides (parser H1/H2 + PptxGenJS) |
| **v0.8** | ✅ Concluído | Slides v2: sumarização via Transformers.js |
| **v0.9** | ✅ Concluído | Acessibilidade WCAG 2.2 |
| **v0.9.1-v0.9.9** | ✅ Concluído | Onboarding, atalhos, tema, skeleton, UI ajustável |
| **v0.9.10** | ✅ Concluído | stripFlex reescrito, slide generator PT-BR |
| **v0.9.11** | ✅ Concluído | Migrar export .doc para RTF |
| **v0.9.12** | ✅ Concluído | RTF completo, acentos universais, Sumário automático |
| **v0.9.13** | ✅ Concluído | PDF com margens corretas, preview de páginas |
| **v0.9.14** | ✅ Concluído | Slides TF-IDF (sem IA), landing page, CI Tauri |
| **v1.0.0** | ✅ Concluído | **Lançamento oficial** — apps desktop (Win/Linux/Mac), landing, release pública |
| **v1.0.1** | 🔜 Próximo | Corrigir referências, glossário semi-automático, numeração de páginas, testes E2E |

---

## 🚀 Como usar

### Versão Web

Acesse direto no navegador: **[editecc.vercel.app](https://editecc.vercel.app)**

### Download Desktop

Baixe a versão para o seu sistema operacional na página de [releases](https://github.com/rodrigopereiradevelopment/editecc/releases/tag/v1.0.1):

| Sistema | Arquivo |
|---------|---------|
| Windows | `EditeCC_1.0.1_x64-setup.exe` |
| Linux (Ubuntu/Debian) | `EditeCC_1.0.1_amd64.deb` |
| Linux (Fedora/RHEL) | `EditeCC-1.0.1-1.x86_64.rpm` |
| Linux (qualquer) | `EditeCC_1.0.1_amd64.AppImage` |
| macOS (Apple Silicon) | `EditeCC_1.0.1_aarch64.dmg` |

### Desenvolvimento

```bash
git clone https://github.com/rodrigopereiradevelopment/editecc.git
cd editecc
npm install --legacy-peer-deps
npm run dev
```

Acesse `http://localhost:3000` no navegador.

---

## 🏗️ Arquitetura

```
editecc/
├── app/
│   ├── page.tsx                # Landing page
│   └── editor/page.tsx         # Página do editor
├── components/                 # 24 componentes React
├── lib/
│   ├── abnt/styles.ts          # Formatação ABNT + validação
│   ├── exportRtf.ts            # Exportação RTF completa
│   ├── slideGenerator.ts       # Parser Tiptap → PptxGenJS
│   └── tfidf.ts               # Sumarização extrativa TF-IDF + extração de termos
├── hooks/
│   ├── useTranslation.ts       # Tradução Transformers.js
│   └── useSummarization.ts     # Sumarização Transformers.js (deprecated)
└── src-tauri/                  # Backend Rust (Tauri v2)
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Editor | Tiptap v3 + ProseMirror |
| Persistência | localStorage / IndexedDB |
| Desktop | Tauri v2 (Rust) |
| Referências | Citation.js |
| Tradução | Transformers.js (NLLB-200, 100% local) |

---

## 📐 Padrão ABNT

| Elemento | Configuração |
|----------|-------------|
| Margens | 3cm (sup/esq), 2cm (inf/dir) |
| Fonte | Arial 12pt |
| Espaçamento | 1,5 entre linhas |
| Recuo | 2,5cm na primeira linha |
| Citação longa | 10pt, espaço simples, recuo 4cm |
| Referências | 12pt, espaço simples |
| Resumo | 10pt, espaço simples, 150–500 palavras |
| Numeração | Canto superior direito (a partir da Introdução) |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit (`git commit -m 'feat: adiciona funcionalidade'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

MIT — use, modifique e distribua livremente.

---

*Feito com ☕ para os estudantes da ETEC e de todo o Brasil.*