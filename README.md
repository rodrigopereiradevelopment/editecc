# EditeCC ✏️

**Editor de textos acadêmicos com formatação ABNT automática.**

Desenvolvido para estudantes que precisam formatar TCCs, monografias e trabalhos acadêmicos sem perder horas configurando margens e estilos no Word.

> Projeto open source — clone, instale e use. Sem APIs externas, sem cadastro, sem cobrança.

---

## ✨ Funcionalidades (v0.1.1)

- 📄 **Folha A4** simulada com margens ABNT (3cm esq/sup, 2cm dir/inf)
- 🎨 **Editor rico com Tiptap** — Negrito, Itálico, Sublinhado, Justificar, Títulos H1/H2/H3
- 📋 **Capa automática** — gerada em tempo real conforme você preenche o formulário
- 📃 **Folha de Rosto** — elemento pré-textual obrigatório com nota explicativa, orientador e curso
- 📝 **Resumo + Abstract** — campos dedicados com contador de palavras (150–500 conforme NBR 14724)
- 📑 **Sumário automático** a partir dos headings do documento
- ✅ **Validador ABNT** — detecta problemas de formatação, seções faltando e tamanho do resumo
- 💾 **Autosave** no localStorage a cada 20 segundos
- 📤 **Exportar PDF** via impressão nativa do navegador (`Ctrl+P` → Salvar como PDF)
- 🖥️ **Pronto para Tauri** — estrutura preparada para build desktop nativo (Windows/Linux)

---

## 🗺️ Roadmap

| Versão | Status | Funcionalidades |
|--------|--------|----------------|
| **v0.1** | ✅ Concluído | MVP: editor + capa + sumário + autosave + PDF |
| **v0.1.1** | ✅ Concluído | Folha de Rosto, Resumo, Abstract — conformidade com Manual ETEC 2022 |
| **v0.2** | 🔄 Próximo | Gerador de referências (Citation.js), Lista de Figuras/Tabelas automática |
| **v0.3** | 📋 Planejado | Folha de Aprovação (banca examinadora), Dedicatória, Agradecimentos, Epígrafe |
| **v0.4** | 📋 Planejado | Tradução do resumo (LibreTranslate self-hosted), exportar `.editecc` para reabrir |
| **v0.5** | 📋 Planejado | Build Tauri — app desktop nativo para Windows e Linux |
| **v1.0** | 🎯 Meta | UI polida, onboarding, suporte a múltiplos documentos, documentação completa |

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
│   ├── ResumoSection.tsx       # Campo de Resumo com contador de palavras
│   └── AbstractSection.tsx     # Campo de Abstract com contador de palavras
├── lib/
│   └── abnt/
│       └── styles.ts           # Estilos, validações e gerador de sumário ABNT
├── hooks/
│   └── useAutosave.ts          # Autosave (localStorage e IndexedDB)
└── src-tauri/                  # Backend Rust para build desktop (Tauri)
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Editor | Tiptap v3 + ProseMirror |
| Persistência | localStorage / IndexedDB via `idb` |
| Desktop (futuro) | Tauri v2 (Rust) |
| Referências (v0.2) | Citation.js |
| Tradução (v0.4) | LibreTranslate (self-hosted) |

---

## 📐 Padrão ABNT Implementado

Baseado no **Manual de TCC das ETECs (2022)** e na **ABNT NBR 14724:2011**.

| Elemento | Configuração |
|----------|-------------|
| Margens | 3cm (sup/esq), 2cm (inf/dir) |
| Fonte | Arial 12pt (conforme Manual ETEC 2022) |
| Espaçamento | 1,5 entre linhas |
| Recuo de parágrafo | 1,25cm na primeira linha |
| Título 1 (seção primária) | 12pt, negrito, maiúsculas, centralizado |
| Título 2 (seção secundária) | 12pt, negrito, à esquerda |
| Título 3 (seção terciária) | 12pt, negrito, itálico, à esquerda |
| Citação longa (>3 linhas) | 10pt, espaço simples, recuo 4cm |
| Referências | 12pt, espaço simples, linha em branco entre entradas |
| Resumo / Abstract | 10pt, espaço simples, parágrafo único sem recuo, 150–500 palavras |
| Título/Subtítulo na Capa | Arial 14pt, maiúsculas, centralizado |
| Numeração de página | A partir da Introdução, canto inferior direito *(v0.2)* |
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