// src-tauri/src/lib.rs
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::FsExt;
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

// ─── TIPOS ────────────────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Debug)]
pub struct DocumentData {
    pub id: String,
    pub html: String,
    pub cover: serde_json::Value,
    pub title: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SaveResult {
    pub success: bool,
    pub path: Option<String>,
    pub error: Option<String>,
}

// ─── COMANDOS ─────────────────────────────────────────────────────────────────

/// Salva o documento via diálogo "Salvar como"
#[tauri::command]
async fn save_document_as(
    app: tauri::AppHandle,
    data: DocumentData,
) -> SaveResult {
    let file_name = if data.title.is_empty() {
        "meu-tcc.editecc".to_string()
    } else {
        format!("{}.editecc", sanitize_filename(&data.title))
    };

    let path = app
        .dialog()
        .file()
        .set_file_name(&file_name)
        .add_filter("EditeCC", &["editecc"])
        .blocking_save_file();

    match path {
        Some(p) => {
            let json = serde_json::to_string_pretty(&data).unwrap_or_default();
            let path_buf: std::path::PathBuf = p.into();
            match fs::write(&path_buf, json) {
                Ok(_) => SaveResult {
                    success: true,
                    path: Some(path_buf.display().to_string()),
                    error: None,
                },
                Err(e) => SaveResult {
                    success: false,
                    path: None,
                    error: Some(e.to_string()),
                },
            }
        }
        None => SaveResult {
            success: false,
            path: None,
            error: Some("Cancelado pelo usuário".to_string()),
        },
    }
}

/// Salva silenciosamente num caminho já conhecido
#[tauri::command]
async fn save_document_silent(
    path: String,
    data: DocumentData,
) -> SaveResult {
    let json = serde_json::to_string_pretty(&data).unwrap_or_default();
    match fs::write(&path, json) {
        Ok(_) => SaveResult {
            success: true,
            path: Some(path),
            error: None,
        },
        Err(e) => SaveResult {
            success: false,
            path: None,
            error: Some(e.to_string()),
        },
    }
}

/// Abre um documento .editecc via diálogo
#[tauri::command]
async fn open_document(app: tauri::AppHandle) -> Option<DocumentData> {
    let path = app
        .dialog()
        .file()
        .add_filter("EditeCC", &["editecc"])
        .blocking_pick_file();

    match path {
        Some(p) => {
            let path_buf: std::path::PathBuf = p.into();
            match fs::read_to_string(&path_buf) {
                Ok(content) => {
                    serde_json::from_str(&content).ok()
                }
                Err(_) => None,
            }
        }
        None => None,
    }
}

/// Exporta o HTML do documento para um arquivo .html
#[tauri::command]
async fn export_html(
    app: tauri::AppHandle,
    html: String,
    title: String,
) -> SaveResult {
    let file_name = if title.is_empty() {
        "meu-tcc.html".to_string()
    } else {
        format!("{}.html", sanitize_filename(&title))
    };

    // Envolve o HTML num template com os estilos ABNT embutidos
    let full_html = wrap_html_with_abnt_styles(&html, &title);

    let path = app
        .dialog()
        .file()
        .set_file_name(&file_name)
        .add_filter("HTML", &["html"])
        .blocking_save_file();

    match path {
        Some(p) => {
            let path_buf: std::path::PathBuf = p.into();
            match fs::write(&path_buf, full_html) {
                Ok(_) => SaveResult {
                    success: true,
                    path: Some(path_buf.display().to_string()),
                    error: None,
                },
                Err(e) => SaveResult {
                    success: false,
                    path: None,
                    error: Some(e.to_string()),
                },
            }
        }
        None => SaveResult {
            success: false,
            path: None,
            error: Some("Cancelado".to_string()),
        },
    }
}

/// Lista documentos recentes salvos na pasta de dados do app
#[tauri::command]
async fn list_recent_documents(app: tauri::AppHandle) -> Vec<String> {
    let data_dir = app.path().app_data_dir().unwrap_or_default();
    let recent_file = data_dir.join("recent.json");

    match fs::read_to_string(&recent_file) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => vec![],
    }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => c,
        })
        .collect::<String>()
        .trim()
        .to_string()
}

fn wrap_html_with_abnt_styles(body: &str, title: &str) -> String {
    format!(
        r#"<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    @page {{
      size: A4;
      margin: 3cm 2cm 2cm 3cm;
    }}
    body {{
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111;
    }}
    h1 {{
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      margin: 2em 0 1em;
    }}
    h2 {{
      font-size: 12pt;
      font-weight: bold;
      text-align: left;
      margin: 1.5em 0 0.8em;
    }}
    h3 {{
      font-size: 12pt;
      font-weight: bold;
      font-style: italic;
      text-align: left;
      margin: 1.5em 0 0.8em;
    }}
    p {{
      font-size: 12pt;
      line-height: 1.5;
      text-align: justify;
      text-indent: 1.25cm;
      margin: 0;
    }}
    blockquote {{
      font-size: 10pt;
      line-height: 1;
      margin-left: 4cm;
      text-align: justify;
      margin-bottom: 1em;
    }}
  </style>
</head>
<body>
{body}
</body>
</html>"#,
        title = title,
        body = body
    )
}

// ─── APP ──────────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            save_document_as,
            save_document_silent,
            open_document,
            export_html,
            list_recent_documents,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar EditeCC");
}
