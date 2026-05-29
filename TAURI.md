# EditeCC + Tauri — Guia de Setup

> ⚠️ O build do Tauri exige Rust e ferramentas nativas.
> **Faça isso no Linux desktop, não no Termux.**

---

## Pré-requisitos (Linux)

```bash
# 1. Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. Dependências do sistema (Ubuntu/Debian)
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  libssl-dev \
  build-essential

# 3. Verificar
rustc --version   # rustc 1.77+
cargo --version
```

---

## Setup do projeto

```bash
# No diretório do editecc:
npm install

# Instalar a CLI do Tauri globalmente (opcional, já está no package.json)
npm install -D @tauri-apps/cli@^2
```

---

## Desenvolvimento

```bash
# Roda Next.js + Tauri juntos (abre a janela nativa)
npm run tauri:dev
```

O Tauri vai:
1. Iniciar `next dev --webpack` em background (porta 3000)
2. Abrir a janela nativa apontando para `localhost:3000`
3. Hot reload funciona normalmente

---

## Build de produção

```bash
# Linux (.AppImage + .deb)
npm run tauri:build

# Windows (cross-compile a partir do Linux — requer mingw-w64)
rustup target add x86_64-pc-windows-msvc
npm run tauri:build:windows
```

Os binários ficam em `src-tauri/target/release/bundle/`.

---

## Estrutura dos arquivos Tauri

```
editecc/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          # Entry point Rust
│   │   └── lib.rs           # Comandos: save, open, export
│   ├── capabilities/
│   │   └── default.json     # Permissões (fs, dialog)
│   ├── icons/               # Ícones do app (gerar com tauri icon)
│   ├── Cargo.toml           # Dependências Rust
│   ├── build.rs             # Build script
│   └── tauri.conf.json      # Config principal
├── hooks/
│   └── useTauri.ts          # Hook: abstrai invoke() com fallback web
└── next.config.ts           # Detecta TAURI_ENV_PLATFORM p/ static export
```

---

## Comandos Rust disponíveis (invoke do frontend)

| Comando | Descrição |
|---------|-----------|
| `save_document_as` | Diálogo "Salvar como" → `.editecc` |
| `save_document_silent` | Salva no caminho já conhecido (autosave) |
| `open_document` | Diálogo "Abrir" → retorna DocumentData |
| `export_html` | Salva HTML com estilos ABNT embutidos |
| `list_recent_documents` | Lista arquivos recentes |

---

## Como usar o hook no frontend

```tsx
import { useTauri } from "@/hooks/useTauri";

export default function Toolbar() {
  const { saveAs, openDocument, exportHtml, exportPdf, isTauri } = useTauri();

  return (
    <div>
      <button onClick={() => saveAs({ id, html, cover, title, updatedAt })}>
        Salvar
      </button>
      <button onClick={() => exportPdf()}>
        Exportar PDF
      </button>
      {isTauri && <span>🖥️ App Desktop</span>}
    </div>
  );
}
```

O hook detecta automaticamente se está rodando no Tauri ou no browser.
Se estiver no browser, usa fallback (download, localStorage, window.print()).

---

## Gerar ícones

```bash
# Coloca um PNG 1024x1024 em src-tauri/icons/app-icon.png e roda:
npm run tauri icon src-tauri/icons/app-icon.png
```

---

## Cross-compile Windows → Linux

Para gerar o `.exe` a partir do Linux:

```bash
# Instalar mingw
sudo apt install -y mingw-w64

# Adicionar target Rust
rustup target add x86_64-pc-windows-gnu

# Build
cargo build --target x86_64-pc-windows-gnu --release
```
