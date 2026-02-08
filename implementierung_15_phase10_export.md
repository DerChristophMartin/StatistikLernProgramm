━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
15. PHASE 10 — EXPORT (PDF/HTML)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Lektionen können als PDF oder HTML exportiert werden:
  - PDF für Druck/Archive
  - HTML für Web-Sharing oder Offline-Ansicht


  EXPORT-OPTIONEN
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬─────────────────────────────────────────────────────┐
  │ Option              │ Beschreibung                                         │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ include_code        │ Code-Zellen mit einschließen                        │
  │ include_output      │ Code-Ausgaben mit einschließen                      │
  │ include_solutions   │ Quiz-Lösungen anzeigen                              │
  │ page_size           │ A4, Letter, etc.                                     │
  │ theme               │ light, dark, print                                   │
  │ toc                 │ Inhaltsverzeichnis generieren                       │
  └─────────────────────┴─────────────────────────────────────────────────────┘


  DATEI: src-tauri/src/services/export_service.rs
  ──────────────────────────────────────────────────────

  use crate::models::export::{ExportOptions, ExportFormat};
  use pulldown_cmark::{Parser, Options, html};
  use std::path::PathBuf;
  use std::fs;

  pub struct ExportService;

  impl ExportService {
      /// Exportiert eine Lektion als HTML
      pub fn export_html(
          lesson_path: &PathBuf,
          options: &ExportOptions,
      ) -> Result<String, String> {
          let content = fs::read_to_string(lesson_path)
              .map_err(|e| format!("Fehler beim Lesen: {}", e))?;

          // Frontmatter entfernen
          let markdown = Self::strip_frontmatter(&content);

          // Markdown zu HTML konvertieren
          let parser_options = Options::all();
          let parser = Parser::new_ext(&markdown, parser_options);
          let mut html_output = String::new();
          html::push_html(&mut html_output, parser);

          // HTML-Template anwenden
          let html_doc = Self::wrap_in_template(&html_output, options);

          Ok(html_doc)
      }

      /// Exportiert als PDF (via HTML → PDF Konvertierung)
      pub fn export_pdf(
          lesson_path: &PathBuf,
          output_path: &PathBuf,
          options: &ExportOptions,
      ) -> Result<PathBuf, String> {
          // Erst HTML generieren
          let html = Self::export_html(lesson_path, options)?;

          // HTML in temporäre Datei schreiben
          let temp_html = std::env::temp_dir().join("statistiklab_export.html");
          fs::write(&temp_html, &html)
              .map_err(|e| format!("Fehler: {}", e))?;

          // PDF generieren mit print-to-pdf
          // Option 1: wkhtmltopdf (falls installiert)
          // Option 2: Headless Chrome/Chromium
          // Option 3: Native Rust-Lösung (printpdf)

          #[cfg(feature = "headless-chrome")]
          {
              Self::chrome_to_pdf(&temp_html, output_path)?;
          }

          #[cfg(not(feature = "headless-chrome"))]
          {
              Self::native_pdf(&html, output_path)?;
          }

          Ok(output_path.clone())
      }

      fn strip_frontmatter(content: &str) -> String {
          let parts: Vec<&str> = content.splitn(3, "---").collect();
          if parts.len() >= 3 {
              parts[2].to_string()
          } else {
              content.to_string()
          }
      }

      fn wrap_in_template(content: &str, options: &ExportOptions) -> String {
          let theme_css = match options.theme.as_str() {
              "dark" => include_str!("../resources/export-dark.css"),
              "print" => include_str!("../resources/export-print.css"),
              _ => include_str!("../resources/export-light.css"),
          };

          format!(r#"
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    {css}
  </style>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
</head>
<body>
  <article class="lesson-content">
    {content}
  </article>
</body>
</html>
"#,
              title = options.title.as_deref().unwrap_or("StatistikLab Export"),
              css = theme_css,
              content = content,
          )
      }

      #[cfg(feature = "headless-chrome")]
      fn chrome_to_pdf(html_path: &PathBuf, output_path: &PathBuf) -> Result<(), String> {
          use headless_chrome::{Browser, LaunchOptions};

          let browser = Browser::new(LaunchOptions::default())
              .map_err(|e| format!("Browser-Fehler: {}", e))?;

          let tab = browser.new_tab()
              .map_err(|e| format!("Tab-Fehler: {}", e))?;

          let file_url = format!("file://{}", html_path.display());
          tab.navigate_to(&file_url)
              .map_err(|e| format!("Navigation-Fehler: {}", e))?;

          tab.wait_until_navigated()
              .map_err(|e| format!("Wait-Fehler: {}", e))?;

          let pdf_data = tab.print_to_pdf(None)
              .map_err(|e| format!("PDF-Fehler: {}", e))?;

          fs::write(output_path, pdf_data)
              .map_err(|e| format!("Schreib-Fehler: {}", e))?;

          Ok(())
      }
  }


  DATEI: src-tauri/src/models/export.rs
  ──────────────────────────────────────────────────────

  use serde::{Deserialize, Serialize};

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub enum ExportFormat {
      Pdf,
      Html,
  }

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct ExportOptions {
      pub format: ExportFormat,
      pub title: Option<String>,
      pub theme: String,          // "light", "dark", "print"
      pub include_code: bool,
      pub include_output: bool,
      pub include_solutions: bool,
      pub page_size: String,       // "A4", "Letter"
      pub generate_toc: bool,
  }

  impl Default for ExportOptions {
      fn default() -> Self {
          Self {
              format: ExportFormat::Pdf,
              title: None,
              theme: "print".to_string(),
              include_code: true,
              include_output: true,
              include_solutions: false,
              page_size: "A4".to_string(),
              generate_toc: true,
          }
      }
  }


  DATEI: src-tauri/src/commands/export_commands.rs
  ──────────────────────────────────────────────────────

  use crate::models::export::ExportOptions;
  use crate::services::export_service::ExportService;
  use std::path::PathBuf;
  use tauri::State;
  use tauri_plugin_dialog::DialogExt;

  #[tauri::command]
  pub async fn export_lesson(
      app: tauri::AppHandle,
      lesson_path: String,
      options: ExportOptions,
  ) -> Result<String, String> {
      let lesson_path = PathBuf::from(lesson_path);

      match options.format {
          crate::models::export::ExportFormat::Html => {
              let html = ExportService::export_html(&lesson_path, &options)?;

              // Speicherort wählen
              let file_path = app.dialog()
                  .file()
                  .add_filter("HTML", &["html"])
                  .set_file_name("export.html")
                  .blocking_save_file();

              if let Some(path) = file_path {
                  std::fs::write(&path, &html)
                      .map_err(|e| format!("Speichern fehlgeschlagen: {}", e))?;
                  Ok(path.to_string())
              } else {
                  Err("Export abgebrochen".to_string())
              }
          }
          crate::models::export::ExportFormat::Pdf => {
              let file_path = app.dialog()
                  .file()
                  .add_filter("PDF", &["pdf"])
                  .set_file_name("export.pdf")
                  .blocking_save_file();

              if let Some(path) = file_path {
                  let path_buf = PathBuf::from(&path);
                  ExportService::export_pdf(&lesson_path, &path_buf, &options)?;
                  Ok(path.to_string())
              } else {
                  Err("Export abgebrochen".to_string())
              }
          }
      }
  }


  DATEI: src/lib/components/ExportDialog.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { invoke } from '@tauri-apps/api/core';
    import Modal from './common/Modal.svelte';
    import { lessonStore } from '$lib/stores/lesson.store';
    import { toastStore } from '$lib/stores/toast.store';

    export let isOpen = false;
    export let lessonPath: string;

    let options = {
      format: 'pdf',
      theme: 'print',
      include_code: true,
      include_output: true,
      include_solutions: false,
      page_size: 'A4',
      generate_toc: true,
    };

    let isExporting = false;

    async function handleExport() {
      isExporting = true;

      try {
        const result = await invoke<string>('export_lesson', {
          lessonPath,
          options: {
            ...options,
            format: options.format === 'pdf' ? 'Pdf' : 'Html',
          },
        });

        toastStore.success(`Export erfolgreich: ${result}`);
        isOpen = false;
      } catch (e) {
        toastStore.error(`Export fehlgeschlagen: ${e}`);
      } finally {
        isExporting = false;
      }
    }
  </script>

  <Modal bind:isOpen title="Lektion exportieren">
    <div class="export-options">
      <!-- Format -->
      <div class="option-group">
        <label>Format</label>
        <div class="radio-group">
          <label>
            <input type="radio" bind:group={options.format} value="pdf" />
            PDF
          </label>
          <label>
            <input type="radio" bind:group={options.format} value="html" />
            HTML
          </label>
        </div>
      </div>

      <!-- Theme -->
      <div class="option-group">
        <label>Design</label>
        <select bind:value={options.theme}>
          <option value="print">Druck (Schwarz auf Weiß)</option>
          <option value="light">Hell</option>
          <option value="dark">Dunkel</option>
        </select>
      </div>

      <!-- Checkboxes -->
      <div class="option-group">
        <label>Inhalt</label>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={options.include_code} />
            Code-Zellen einschließen
          </label>
          <label>
            <input type="checkbox" bind:checked={options.include_output} />
            Code-Ausgaben einschließen
          </label>
          <label>
            <input type="checkbox" bind:checked={options.include_solutions} />
            Quiz-Lösungen anzeigen
          </label>
          <label>
            <input type="checkbox" bind:checked={options.generate_toc} />
            Inhaltsverzeichnis generieren
          </label>
        </div>
      </div>

      {#if options.format === 'pdf'}
        <div class="option-group">
          <label>Seitengröße</label>
          <select bind:value={options.page_size}>
            <option value="A4">A4</option>
            <option value="Letter">Letter (US)</option>
          </select>
        </div>
      {/if}
    </div>

    <svelte:fragment slot="footer">
      <button class="cancel-btn" on:click={() => isOpen = false}>
        Abbrechen
      </button>
      <button 
        class="export-btn" 
        on:click={handleExport}
        disabled={isExporting}
      >
        {isExporting ? 'Exportiere...' : 'Exportieren'}
      </button>
    </svelte:fragment>
  </Modal>

  <style>
    .export-options {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .option-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option-group > label {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .radio-group, .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-group label, .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
      cursor: pointer;
    }

    select {
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .cancel-btn {
      padding: 10px 20px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
    }

    .export-btn {
      padding: 10px 24px;
      background: var(--accent-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .export-btn:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  </style>
