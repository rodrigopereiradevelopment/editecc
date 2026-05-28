# EditeCC ✏️

**Editor de textos acadêmicos com formatação ABNT automática.**

Desenvolvido para estudantes que precisam formatar TCCs, monografias e trabalhos acadêmicos sem perder horas configurando margens e estilos no Word.

> Projeto open source — clone, instale e use. Sem APIs externas, sem cadastro, sem cobrança.

---

## ✨ Funcionalidades (v0.1 — MVP)

- 📄 **Folha A4** simulada com margens ABNT (3cm esq/sup, 2cm dir/inf)
- 🎨 **Estilos pré-definidos**: Título 1/2/3, Texto Corrente, Citação Longa, Referência
- 📋 **Capa automática** gerada por formulário (instituição, autor, título, cidade, ano)
- 📑 **Sumário automático** a partir dos headings do documento
- ✅ **Validador ABNT** (contagem de palavras no resumo, formatação de citações)
- 💾 **Autosave** com IndexedDB (sem servidor, tudo no navegador)
- 📤 **Exportar PDF** via impressão nativa (`Ctrl+P` → Salvar como PDF)

## 🗺️ Roadmap

| Versão | Funcionalidades |
|--------|----------------|
| **v0.1** | MVP: editor + capa + sumário + autosave + PDF |
| **v0.2** | Folha de rosto, gerador de referências (Citation.js), lista de figuras automática |
| **v0.3** | Validador ABNT completo, contador de palavras no resumo, ordem das referências |
| **v0.4** | Tradução do resumo (LibreTranslate local ou manual), exportar `.editecc` para reabrir |
| **v1.0** | UI polida, onboarding, suporte a múltiplos documentos |

---

## 🚀 Como usar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
git clone https://github.com/rodrigopereiradevelopment/editecc.git
cd editecc
npm install
npm run dev
```

Acesse `http://localhost:3000` no navegador.

### Build para produção

```bash
npm run build
npm start
```

### Deploy no GitHub Pages

```bash
npm run build
# Configurar output: 'export' no next.config.js
npx gh-pages -d out
```

---

## 🏗️ Arquitetura

```
editecc/
├── app/
│   ├── layout.tsx          # Layout raiz + fontes
│   ├── page.tsx            # Landing page
│   └── editor/
│       └── page.tsx        # Página do editor
├── components/
│   ├── Editor.tsx          # Motor Tiptap (editor rico)
│   ├── Editor.module.css   # Estilos ABNT da folha A4
│   ├── Toolbar.tsx         # Barra de ferramentas
│   ├── Sidebar.tsx         # Painel lateral (capa, sumário, validador)
│   └── CoverPage.tsx       # Componente da capa ABNT
├── lib/
│   └── abnt/
│       └── styles.ts       # Definições e validações ABNT
├── hooks/
│   └── useAutosave.ts      # Autosave com IndexedDB (idb)
└── public/
    └── ...
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Editor | Tiptap v2 + ProseMirror |
| Estilos | CSS Modules + Tailwind |
| Persistência | IndexedDB via `idb` |
| Referências (v0.2) | Citation.js |
| Paginação (v0.3) | Paged.js |
| Tradução (v0.4) | LibreTranslate (self-hosted) |

---

## 📐 Padrão ABNT Implementado

| Elemento | Configuração |
|----------|-------------|
| Margens | 3cm (sup/esq), 2cm (inf/dir) |
| Fonte | Times New Roman 12pt |
| Espaçamento | 1,5 entre linhas |
| Recuo | 1,25cm na primeira linha |
| Título 1 | 12pt, negrito, maiúsculas, centralizado |
| Título 2 | 12pt, negrito, à esquerda |
| Título 3 | 12pt, negrito, itálico, à esquerda |
| Citação longa | 10pt, espaço simples, recuo 4cm |
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
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
