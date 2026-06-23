# EditeCC — Guia de Uso

## Começando

1. Acesse **[EditeCC](https://editecc.vercel.app/editor)** ou `npm run dev` + `localhost:3000`
2. Na tela inicial, clique em **"Novo TCC"** ou importe um arquivo `.editecc`
3. Preencha os dados da capa no painel lateral (instituição, autor, título, orientador, etc.)
4. Ative os elementos pré-textuais desejados: Folha de Rosto, Resumo, Abstract, Dedicatória, etc.
5. Escreva o conteúdo no editor ABNT — use os estilos H1/H2/H3 e Texto Corrente

## Formatação ABNT

O editor segue a **NBR 14724:2011**:

| Elemento | Formatação |
|----------|-----------|
| Título 1 (H1) | 12pt, negrito, centralizado, MAIÚSCULO |
| Título 2 (H2) | 12pt, negrito, alinhado à esquerda |
| Título 3 (H3) | 12pt, negrito, itálico, alinhado à esquerda |
| Texto Corrente | 12pt, justificado, recuo 2,5cm, espaço 1,5 |
| Citação Longa | 10pt, recuo 4cm, espaço simples |
| Referência | 12pt, espaço simples |

## Elementos do TCC

### Pré-textuais (ordem ABNT)
1. **Capa** — gerada automaticamente pelos dados do formulário
2. **Folha de Rosto** — ativar no painel lateral
3. **Folha de Aprovação** — data + assinaturas
4. **Dedicatória** — texto livre
5. **Agradecimentos** — texto livre
6. **Epígrafe** — citação + autor
7. **Resumo** — 150–500 palavras + 3-5 palavras-chave
8. **Abstract** — tradução automática do resumo (5 idiomas via IA local)

### Pós-textuais (ordem ABNT)
- **Glossário** — termos e definições
- **Apêndices** — documentos produzidos pelo autor
- **Anexos** — documentos de terceiros
- **Notas de Rodapé** — notas numeradas

## Tradução Automática

O resumo pode ser traduzido para **inglês, espanhol, francês, alemão ou italiano** usando IA local (Transformers.js ~600MB):

1. Digite o resumo em português
2. Selecione o idioma alvo
3. Clique em "Traduzir" — o modelo é baixado uma vez e cacheado no IndexedDB

> **Nota:** O primeiro download pode levar alguns minutos (~600MB). Totalmente offline, sem API externa.

## Geração de Slides

1. Escreva o TCC com títulos H1 e H2
2. Clique em **"Slides"** na toolbar
3. O EditeCC extrai cada seção e sumariza com IA local (~300MB)
4. Um arquivo PPTX é baixado automaticamente

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+B` | Negrito |
| `Ctrl+I` | Itálico |
| `Ctrl+U` | Sublinhado |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Refazer |
| `Ctrl+P` | Exportar PDF |
| `Esc` | Fechar modal |

## Exportar

- **PDF**: Clique em "Exportar PDF" na toolbar (usa `window.print`)
- **.editecc**: Abra o painel Docs e clique em Exportar
- **Slides PPTX**: Clique em "Slides" na toolbar

## Tema Claro / Escuro

Clique no ícone ☀/🌙 no canto superior direito do painel lateral para alternar.

## Dicas

- O **autosave** salva automaticamente a cada 20 segundos
- Você pode ter **múltiplos documentos** — gerencie no painel Docs
- O validador ABNT detecta problemas de formatação automaticamente
- A lista de figuras e tabelas é gerada automaticamente a partir do conteúdo
