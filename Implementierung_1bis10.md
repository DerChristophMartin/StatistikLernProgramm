╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║              STATISTIK-LAB — VOLLSTÄNDIGER IMPLEMENTIERUNGSPLAN                ║
║              Interaktives Statistik-Lernprogramm (Desktop-App)                ║
║                                                                                ║
║              Version: 1.0                                                      ║
║              Letzte Aktualisierung: 2025                                       ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INHALTSVERZEICHNIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1.  PROJEKT-ÜBERSICHT & VISION
  2.  ARCHITEKTUR-DIAGRAMM
  3.  TECH-STACK (DETAILLIERT)
  4.  PROJEKTSTRUKTUR (ALLE DATEIEN)
  5.  PHASE 0 — ENTWICKLUNGSUMGEBUNG EINRICHTEN
  6.  PHASE 1 — TAURI-GRUNDGERÜST
  7.  PHASE 2 — PYTHON-ENGINE (PYODIDE)
  8.  PHASE 3 — MARKDOWN-PARSER & KURSFORMAT
  9.  PHASE 4 — CODE-EDITOR (CODEMIRROR 6)
  10. PHASE 5 — UI-KOMPONENTEN (SVELTE)
  11. PHASE 6 — RUST-BACKEND (DATEISYSTEM, SQLITE)
  12. PHASE 7 — FORTSCHRITT & GAMIFICATION
  13. PHASE 8 — INTERAKTIVE WIDGETS
  14. PHASE 9 — QUIZ-SYSTEM
  15. PHASE 10 — EXPORT (PDF/HTML)
  16. PHASE 11 — KURS-EDITOR
  17. PHASE 12 — EINSTELLUNGEN & THEMES
  18. PHASE 13 — TESTING
  19. PHASE 14 — BUILD & DISTRIBUTION
  20. DATENBANK-SCHEMA (VOLLSTÄNDIG)
  21. KURSFORMAT-SPEZIFIKATION
  22. API-REFERENZ (RUST ↔ FRONTEND)
  23. STATISTIK-KURS INHALT (BEISPIEL)
  24. PERFORMANCE-OPTIMIERUNG
  25. BEKANNTE HERAUSFORDERUNGEN & LÖSUNGEN
  26. ZEITPLAN & MEILENSTEINE


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PROJEKT-ÜBERSICHT & VISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  PRODUKTNAME:    StatistikLab
  BESCHREIBUNG:   Eine Desktop-Anwendung zum interaktiven Erlernen von Statistik.
                  Kombiniert geführte Lektionen (wie Obsidian) mit ausführbarem
                  Python-Code (wie Jupyter Notebook) in einer schönen,
                  benutzerfreundlichen Oberfläche.

  ZIELGRUPPE:     - Studierende (Psychologie, BWL, Sozialwissenschaften, Medizin)
                  - Selbstlerner
                  - Dozenten (Kurse erstellen und teilen)

  KERNFEATURES:
    ✦ Kapitelbasierte Navigation mit Fortschrittsanzeige
    ✦ Markdown-Lektionen mit LaTeX-Matheformeln
    ✦ Ausführbare Python-Code-Zellen (numpy, pandas, scipy, matplotlib, sklearn)
    ✦ Interaktive Visualisierungen mit Schiebereglern
    ✦ Übungsaufgaben mit automatischer Validierung
    ✦ Multiple-Choice-Quiz
    ✦ Fortschrittsspeicherung (lokal, SQLite)
    ✦ Eigene Datensätze importieren
    ✦ Dark/Light Theme
    ✦ Export als PDF/HTML
    ✦ Kurs-Editor zum Erstellen eigener Kurse
    ✦ Gamification (Punkte, Abzeichen, Streaks)

  DESIGNPRINZIPIEN:
    1. "Null-Setup" — Installieren und sofort lernen, kein Python/Conda nötig
    2. "Geführt, nicht leer" — Kein leeres Notebook, sondern strukturierter Lernpfad
    3. "Schön & ermutigend" — Modernes UI, Fortschritt sichtbar, Erfolge feiern
    4. "Offline-first" — Alles funktioniert ohne Internet
    5. "Offen" — Kurse sind einfache Dateien (Markdown + YAML), teilbar


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. ARCHITEKTUR-DIAGRAMM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────────────────────────────────────────────────────────────┐
  │                         TAURI 2.0 SHELL                            │
  │                                                                      │
  │  ┌────────────────────── WEBVIEW ──────────────────────────────┐    │
  │  │                                                              │    │
  │  │  ┌─────────────────────────────────────────────────────┐    │    │
  │  │  │              SVELTE 5 APPLICATION                    │    │    │
  │  │  │                                                       │    │    │
  │  │  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │    │    │
  │  │  │  │ Sidebar  │ │ Toolbar  │ │   Status Bar       │   │    │    │
  │  │  │  │ Kapitel- │ │ Actions  │ │   Fortschritt      │   │    │    │
  │  │  │  │ baum     │ │          │ │                      │   │    │    │
  │  │  │  └──────────┘ └──────────┘ └────────────────────┘   │    │    │
  │  │  │                                                       │    │    │
  │  │  │  ┌──────────────────────────────────────────────┐    │    │    │
  │  │  │  │           CONTENT AREA                        │    │    │    │
  │  │  │  │                                                │    │    │    │
  │  │  │  │  ┌──────────────────────────────────────┐     │    │    │    │
  │  │  │  │  │  Markdown Cell (rendered HTML)        │     │    │    │    │
  │  │  │  │  │  mit KaTeX Matheformeln               │     │    │    │    │
  │  │  │  │  └──────────────────────────────────────┘     │    │    │    │
  │  │  │  │                                                │    │    │    │
  │  │  │  │  ┌──────────────────────────────────────┐     │    │    │    │
  │  │  │  │  │  Code Cell (CodeMirror 6)             │     │    │    │    │
  │  │  │  │  │  ┌────────────────────────────────┐   │     │    │    │    │
  │  │  │  │  │  │  import numpy as np             │   │     │    │    │    │
  │  │  │  │  │  │  data = np.random.normal(...)   │   │     │    │    │    │
  │  │  │  │  │  └────────────────────────────────┘   │     │    │    │    │
  │  │  │  │  │           │                            │     │    │    │    │
  │  │  │  │  │           ▼                            │     │    │    │    │
  │  │  │  │  │  ┌────────────────────────────────┐   │     │    │    │    │
  │  │  │  │  │  │  PYODIDE (WebAssembly)          │   │     │    │    │    │
  │  │  │  │  │  │  numpy, pandas, scipy,          │   │     │    │    │    │
  │  │  │  │  │  │  matplotlib, scikit-learn       │   │     │    │    │    │
  │  │  │  │  │  └────────────────────────────────┘   │     │    │    │    │
  │  │  │  │  │           │                            │     │    │    │    │
  │  │  │  │  │           ▼                            │     │    │    │    │
  │  │  │  │  │  ┌────────────────────────────────┐   │     │    │    │    │
  │  │  │  │  │  │  Output Cell                    │   │     │    │    │    │
  │  │  │  │  │  │  Text + Plots (PNG/SVG)         │   │     │    │    │    │
  │  │  │  │  │  └────────────────────────────────┘   │     │    │    │    │
  │  │  │  │  └──────────────────────────────────────┘     │    │    │    │
  │  │  │  │                                                │    │    │    │
  │  │  │  │  ┌──────────────────────────────────────┐     │    │    │    │
  │  │  │  │  │  Interactive Widget                    │     │    │    │    │
  │  │  │  │  │  Slider, Dropdowns → Live Update      │     │    │    │    │
  │  │  │  │  └──────────────────────────────────────┘     │    │    │    │
  │  │  │  │                                                │    │    │    │
  │  │  │  │  ┌──────────────────────────────────────┐     │    │    │    │
  │  │  │  │  │  Quiz Cell                             │     │    │    │    │
  │  │  │  │  │  Multiple Choice / Lückentext          │     │    │    │    │
  │  │  │  │  └──────────────────────────────────────┘     │    │    │    │
  │  │  │  │                                                │    │    │    │
  │  │  │  └──────────────────────────────────────────────┘    │    │    │
  │  │  │                                                       │    │    │
  │  │  │  STORES (Svelte State Management)                    │    │    │
  │  │  │  ├── courseStore (Kursstruktur)                       │    │    │
  │  │  │  ├── progressStore (Fortschritt)                     │    │    │
  │  │  │  ├── settingsStore (Einstellungen)                   │    │    │
  │  │  │  └── pythonStore (Engine-Status)                     │    │    │
  │  │  │                                                       │    │    │
  │  │  └─────────────────────────────────────────────────────┘    │    │
  │  │                                                              │    │
  │  │  BIBLIOTHEKEN IM WEBVIEW:                                   │    │
  │  │  ├── Pyodide 0.26.x (Python via WebAssembly)               │    │
  │  │  ├── CodeMirror 6 (Code-Editor)                             │    │
  │  │  ├── KaTeX 0.16.x (LaTeX-Rendering)                        │    │
  │  │  ├── markdown-it 14.x (Markdown → HTML)                    │    │
  │  │  ├── Plotly.js 2.x (optionale interaktive Charts)          │    │
  │  │  └── highlight.js (Syntax-Highlighting für Nicht-Python)    │    │
  │  │                                                              │    │
  │  └──────────────────────────────────────────────────────────────┘    │
  │                              │                                        │
  │                              │ Tauri IPC (invoke / events)           │
  │                              │                                        │
  │  ┌───────────────────── RUST BACKEND ──────────────────────────┐    │
  │  │                                                              │    │
  │  │  COMMANDS (von Frontend aufrufbar):                         │    │
  │  │  ├── load_course(path) → CourseStructure                    │    │
  │  │  ├── load_lesson(course_id, lesson_id) → LessonContent     │    │
  │  │  ├── save_progress(user_progress) → Result                 │    │
  │  │  ├── get_progress(course_id) → UserProgress                │    │
  │  │  ├── list_courses() → Vec<CourseMeta>                      │    │
  │  │  ├── import_dataset(file_path) → Result                    │    │
  │  │  ├── export_pdf(lesson_id) → Result<PathBuf>               │    │
  │  │  ├── export_html(lesson_id) → Result<String>               │    │
  │  │  ├── get_settings() → Settings                              │    │
  │  │  ├── save_settings(settings) → Result                       │    │
  │  │  ├── get_achievements() → Vec<Achievement>                  │    │
  │  │  ├── search_courses(query) → Vec<SearchResult>              │    │
  │  │  └── get_app_data_dir() → PathBuf                           │    │
  │  │                                                              │    │
  │  │  SERVICES:                                                   │    │
  │  │  ├── CourseService (Kurse laden, parsen, validieren)        │    │
  │  │  ├── ProgressService (Fortschritt CRUD)                     │    │
  │  │  ├── SettingsService (App-Einstellungen)                    │    │
  │  │  ├── ExportService (PDF/HTML generierung)                   │    │
  │  │  ├── SearchService (Volltextsuche)                          │    │
  │  │  └── AchievementService (Gamification-Logik)                │    │
  │  │                                                              │    │
  │  │  DATENBANK:                                                  │    │
  │  │  └── SQLite (via rusqlite)                                  │    │
  │  │      ├── user_progress                                       │    │
  │  │      ├── achievements                                        │    │
  │  │      ├── settings                                            │    │
  │  │      ├── course_cache                                        │    │
  │  │      └── code_history                                        │    │
  │  │                                                              │    │
  │  └──────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  DATEISYSTEM:                                                        │
  │  ├── ~/StatistikLab/courses/      (Kurs-Dateien)                   │
  │  ├── ~/StatistikLab/datasets/     (Importierte Datensätze)         │
  │  ├── ~/StatistikLab/exports/      (Exportierte PDFs/HTML)          │
  │  └── ~/StatistikLab/statistiklab.db  (SQLite-Datenbank)           │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. TECH-STACK (DETAILLIERT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  FRAMEWORK & RUNTIME
  ──────────────────────────────────────────────────────
  Tauri                2.x         Desktop-Shell, Rust-Backend, System-Webview
  Svelte               5.x         Frontend-Framework (reaktiv, kompiliert)
  SvelteKit            2.x         Routing, Projektstruktur (SSG-Modus)
  Vite                 6.x         Build-Tool, Dev-Server, HMR
  TypeScript           5.x         Typsicherheit im Frontend
  Rust                 1.80+       Backend-Logik, Dateisystem, DB

  PYTHON-AUSFÜHRUNG
  ──────────────────────────────────────────────────────
  Pyodide              0.26.x      CPython kompiliert zu WebAssembly
  numpy                (via Pyodide)  Numerische Berechnungen
  pandas               (via Pyodide)  Datenmanipulation
  scipy                (via Pyodide)  Statistische Tests
  matplotlib           (via Pyodide)  Plotting
  scikit-learn         (via Pyodide)  Machine Learning
  statsmodels          (via Pyodide)  Statistische Modelle
  seaborn              (via Pyodide)  Statistische Visualisierung

  CODE-EDITOR
  ──────────────────────────────────────────────────────
  @codemirror/state    6.x         Editor-State-Management
  @codemirror/view     6.x         Editor-View-Layer
  @codemirror/lang-python  6.x     Python Syntax-Highlighting & Autocomplete
  @codemirror/theme-one-dark 6.x   Dark-Theme für Editor
  @codemirror/autocomplete 6.x     Autovervollständigung

  RENDERING
  ──────────────────────────────────────────────────────
  markdown-it          14.x        Markdown → HTML Konvertierung
  markdown-it-katex    (Plugin)    LaTeX in Markdown
  KaTeX                0.16.x      LaTeX Matheformel-Rendering
  highlight.js         11.x        Code-Syntax-Highlighting (für Nicht-Editierbare)
  DOMPurify            3.x         HTML-Sanitization (Sicherheit)

  VISUALISIERUNG
  ──────────────────────────────────────────────────────
  Plotly.js             2.x        Interaktive Charts (optional, für Widgets)
  D3.js                 7.x        Low-Level-Visualisierungen (optional)

  DATENBANK (RUST)
  ──────────────────────────────────────────────────────
  rusqlite             0.31.x      SQLite-Bindings für Rust
  serde                1.x         Serialisierung/Deserialisierung
  serde_json           1.x         JSON-Handling
  serde_yaml           0.9.x       YAML-Parsing (Kurs-Dateien)

  DATEISYSTEM (RUST)
  ──────────────────────────────────────────────────────
  walkdir              2.x         Rekursives Verzeichnis-Durchlaufen
  notify               6.x         Dateisystem-Watcher (Live-Reload)
  pulldown-cmark       0.11.x      Markdown-Parsing in Rust (für Export)

  EXPORT (RUST)
  ──────────────────────────────────────────────────────
  printpdf             0.7.x       PDF-Generierung
  headless_chrome      (optional)  HTML→PDF via Chrome (Alternative)

  STYLING
  ──────────────────────────────────────────────────────
  Tailwind CSS         3.x         Utility-First CSS (oder eigenes CSS)
                                    ODER
  Eigenes CSS                       Handgeschriebenes CSS mit CSS-Variablen
                                    für Theme-Support

  TESTING
  ──────────────────────────────────────────────────────
  Vitest               2.x         Unit-Tests (Frontend)
  Playwright           1.x         E2E-Tests
  cargo test           (builtin)   Rust Unit-Tests


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. PROJEKTSTRUKTUR (ALLE DATEIEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  statistik-lab/
  │
  ├── .github/
  │   └── workflows/
  │       ├── ci.yml                          # CI Pipeline (Test + Lint)
  │       └── release.yml                     # Build & Release für alle Plattformen
  │
  ├── src-tauri/                              # ═══ RUST BACKEND ═══
  │   ├── Cargo.toml                          # Rust Dependencies
  │   ├── tauri.conf.json                     # Tauri-Konfiguration
  │   ├── capabilities/
  │   │   └── default.json                    # Berechtigungen (Dateisystem etc.)
  │   ├── icons/                              # App-Icons (generiert)
  │   │   ├── icon.ico
  │   │   ├── icon.png
  │   │   └── icon.icns
  │   ├── src/
  │   │   ├── main.rs                         # Tauri Entry-Point
  │   │   ├── lib.rs                          # Library Root
  │   │   ├── commands/                       # Tauri Commands (IPC)
  │   │   │   ├── mod.rs
  │   │   │   ├── course_commands.rs          # Kurse laden, listen
  │   │   │   ├── lesson_commands.rs          # Lektionen laden
  │   │   │   ├── progress_commands.rs        # Fortschritt CRUD
  │   │   │   ├── settings_commands.rs        # Einstellungen
  │   │   │   ├── export_commands.rs          # PDF/HTML Export
  │   │   │   ├── dataset_commands.rs         # Datensatz-Import
  │   │   │   ├── search_commands.rs          # Volltextsuche
  │   │   │   └── achievement_commands.rs     # Gamification
  │   │   ├── services/                       # Business-Logik
  │   │   │   ├── mod.rs
  │   │   │   ├── course_service.rs           # Kursstruktur parsen
  │   │   │   ├── lesson_parser.rs            # Markdown + Frontmatter parsen
  │   │   │   ├── progress_service.rs         # Fortschritts-Logik
  │   │   │   ├── settings_service.rs         # Settings laden/speichern
  │   │   │   ├── export_service.rs           # Export-Logik
  │   │   │   ├── search_service.rs           # Suchindex
  │   │   │   └── achievement_service.rs      # Achievement-Regeln
  │   │   ├── models/                         # Datenmodelle (Structs)
  │   │   │   ├── mod.rs
  │   │   │   ├── course.rs                   # Course, Chapter, Lesson
  │   │   │   ├── progress.rs                 # UserProgress, LessonProgress
  │   │   │   ├── settings.rs                 # AppSettings
  │   │   │   ├── achievement.rs              # Achievement, Badge
  │   │   │   └── search.rs                   # SearchResult
  │   │   ├── db/                             # Datenbank
  │   │   │   ├── mod.rs
  │   │   │   ├── connection.rs               # SQLite-Verbindung
  │   │   │   ├── migrations.rs               # Schema-Migrationen
  │   │   │   └── queries.rs                  # SQL-Queries
  │   │   └── utils/                          # Hilfsfunktionen
  │   │       ├── mod.rs
  │   │       ├── paths.rs                    # App-Pfade bestimmen
  │   │       └── error.rs                    # Custom Error Types
  │   └── resources/                          # Gebündelte Ressourcen
  │       └── default-course/                 # Mitgelieferter Statistik-Kurs
  │           ├── kurs.yaml
  │           ├── 01-grundlagen/
  │           │   ├── kapitel.yaml
  │           │   ├── 01-was-ist-statistik.md
  │           │   ├── 02-datentypen.md
  │           │   └── 03-erste-schritte-python.md
  │           ├── 02-deskriptive-statistik/
  │           │   ├── kapitel.yaml
  │           │   ├── 01-lagemaße.md
  │           │   ├── 02-streuungsmaße.md
  │           │   ├── 03-visualisierung.md
  │           │   └── 04-uebungen.md
  │           ├── 03-wahrscheinlichkeit/
  │           │   ├── kapitel.yaml
  │           │   ├── 01-grundbegriffe.md
  │           │   ├── 02-verteilungen.md
  │           │   ├── 03-normalverteilung.md
  │           │   └── 04-zentraler-grenzwertsatz.md
  │           ├── 04-inferenzstatistik/
  │           │   ├── kapitel.yaml
  │           │   ├── 01-hypothesentests.md
  │           │   ├── 02-t-test.md
  │           │   ├── 03-chi-quadrat.md
  │           │   ├── 04-anova.md
  │           │   └── 05-p-wert-kontroverse.md
  │           ├── 05-korrelation-regression/
  │           │   ├── kapitel.yaml
  │           │   ├── 01-korrelation.md
  │           │   ├── 02-lineare-regression.md
  │           │   ├── 03-multiple-regression.md
  │           │   └── 04-modelldiagnostik.md
  │           └── datasets/
  │               ├── iris.csv
  │               ├── titanic.csv
  │               ├── mpg.csv
  │               └── tips.csv
  │
  ├── src/                                    # ═══ SVELTE FRONTEND ═══
  │   ├── app.html                            # HTML-Template
  │   ├── app.css                             # Globale Styles + CSS-Variablen
  │   ├── lib/                                # Wiederverwendbare Module
  │   │   ├── components/                     # UI-Komponenten
  │   │   │   ├── layout/
  │   │   │   │   ├── AppShell.svelte         # Haupt-Layout (Sidebar + Content)
  │   │   │   │   ├── Sidebar.svelte          # Kapitel-Navigation
  │   │   │   │   ├── Toolbar.svelte          # Obere Aktionsleiste
  │   │   │   │   ├── StatusBar.svelte        # Untere Statusleiste
  │   │   │   │   └── Resizer.svelte          # Sidebar-Breite anpassen
  │   │   │   ├── lesson/
  │   │   │   │   ├── LessonView.svelte       # Gesamte Lektionsansicht
  │   │   │   │   ├── MarkdownCell.svelte     # Gerenderter Markdown-Block
  │   │   │   │   ├── CodeCell.svelte         # Ausführbare Code-Zelle
  │   │   │   │   ├── OutputCell.svelte       # Code-Ausgabe (Text + Plots)
  │   │   │   │   ├── ExerciseCell.svelte     # Übungsaufgabe mit Validierung
  │   │   │   │   ├── QuizCell.svelte         # Multiple-Choice-Quiz
  │   │   │   │   ├── InteractiveWidget.svelte # Slider-basierte Visualisierung
  │   │   │   │   ├── HintBox.svelte          # Aufklappbarer Hinweis
  │   │   │   │   ├── InfoBox.svelte          # Info/Warnung/Tipp Boxen
  │   │   │   │   └── DatasetViewer.svelte    # Tabellen-Vorschau für CSV
  │   │   │   ├── editor/
  │   │   │   │   ├── PythonEditor.svelte     # CodeMirror-Wrapper
  │   │   │   │   ├── EditorToolbar.svelte    # Run/Reset/Copy Buttons
  │   │   │   │   └── Autocomplete.svelte     # Custom Autocomplete-Logik
  │   │   │   ├── progress/
  │   │   │   │   ├── ProgressBar.svelte      # Fortschrittsbalken
  │   │   │   │   ├── ChapterProgress.svelte  # Kapitel-Fortschritt
  │   │   │   │   ├── AchievementBadge.svelte # Abzeichen-Anzeige
  │   │   │   │   ├── StreakCounter.svelte     # Lernstreak-Anzeige
  │   │   │   │   └── Dashboard.svelte        # Übersichts-Dashboard
  │   │   │   ├── settings/
  │   │   │   │   ├── SettingsModal.svelte    # Einstellungs-Dialog
  │   │   │   │   ├── ThemePicker.svelte      # Theme-Auswahl
  │   │   │   │   └── FontSizePicker.svelte   # Schriftgröße
  │   │   │   ├── course/
  │   │   │   │   ├── CourseSelector.svelte    # Kursauswahl (Start-Screen)
  │   │   │   │   ├── CourseCard.svelte        # Kurs-Vorschaukarte
  │   │   │   │   └── CourseImport.svelte      # Kurs importieren
  │   │   │   ├── search/
  │   │   │   │   ├── SearchModal.svelte       # Suchfeld (Cmd+K)
  │   │   │   │   └── SearchResult.svelte      # Einzelnes Suchergebnis
  │   │   │   └── common/
  │   │   │       ├── Button.svelte            # Wiederverwendbarer Button
  │   │   │       ├── Modal.svelte             # Modal-Dialog
  │   │   │       ├── Tooltip.svelte           # Tooltip
  │   │   │       ├── Toast.svelte             # Benachrichtigung
  │   │   │       ├── Spinner.svelte           # Ladeanimation
  │   │   │       └── Icon.svelte              # Icon-Wrapper
  │   │   │
  │   │   ├── engine/                          # Python-Engine
  │   │   │   ├── pyodide-engine.ts            # Pyodide laden & verwalten
  │   │   │   ├── pyodide-worker.ts            # Web Worker für Python
  │   │   │   ├── python-prelude.py            # Python-Setup-Code
  │   │   │   ├── exercise-validator.ts        # Übungscode validieren
  │   │   │   └── output-parser.ts             # Output + Plots extrahieren
  │   │   │
  │   │   ├── parser/                          # Kursformat-Parser
  │   │   │   ├── markdown-parser.ts           # Markdown → Zellen konvertieren
  │   │   │   ├── cell-types.ts                # Zell-Typ Definitionen
  │   │   │   ├── frontmatter.ts               # YAML-Frontmatter parsen
  │   │   │   └── quiz-parser.ts               # Quiz-Syntax parsen
  │   │   │
  │   │   ├── stores/                          # Svelte Stores (State)
  │   │   │   ├── course.store.ts              # Aktueller Kurs & Navigation
  │   │   │   ├── lesson.store.ts              # Aktuelle Lektion & Zellen
  │   │   │   ├── progress.store.ts            # Fortschritt
  │   │   │   ├── python.store.ts              # Python-Engine Status
  │   │   │   ├── settings.store.ts            # App-Einstellungen
  │   │   │   ├── ui.store.ts                  # UI-State (Sidebar offen, etc.)
  │   │   │   └── toast.store.ts               # Benachrichtigungen
  │   │   │
  │   │   ├── tauri/                           # Tauri IPC Wrapper
  │   │   │   ├── commands.ts                  # Typisierte invoke()-Wrapper
  │   │   │   └── events.ts                    # Tauri Event-Listener
  │   │   │
  │   │   ├── utils/                           # Hilfsfunktionen
  │   │   │   ├── debounce.ts
  │   │   │   ├── format.ts                    # Zahlenformatierung
  │   │   │   ├── keyboard.ts                  # Keyboard-Shortcuts
  │   │   │   └── theme.ts                     # Theme-Switching Logik
  │   │   │
  │   │   └── types/                           # TypeScript-Typen
  │   │       ├── course.ts                    # Course, Chapter, Lesson
  │   │       ├── cells.ts                     # CellType, CodeCell, QuizCell
  │   │       ├── progress.ts                  # Progress-Typen
  │   │       └── settings.ts                  # Settings-Typen
  │   │
  │   ├── routes/                              # SvelteKit Routes
  │   │   ├── +layout.svelte                   # Root-Layout
  │   │   ├── +page.svelte                     # Start-Screen (Kursauswahl)
  │   │   ├── course/
  │   │   │   └── [courseId]/
  │   │   │       └── [lessonId]/
  │   │   │           └── +page.svelte         # Lektionsansicht
  │   │   ├── dashboard/
  │   │   │   └── +page.svelte                 # Fortschritts-Dashboard
  │   │   └── editor/
  │   │       └── +page.svelte                 # Kurs-Editor (Phase 11)
  │   │
  │   └── static/                              # Statische Dateien
  │       ├── pyodide/                         # Pyodide-Dateien (offline)
  │       │   ├── pyodide.js
  │       │   ├── pyodide.asm.wasm
  │       │   ├── pyodide-lock.json
  │       │   └── packages/                    # Vorgeladene Python-Pakete
  │       │       ├── numpy/
  │       │       ├── pandas/
  │       │       ├── scipy/
  │       │       ├── matplotlib/
  │       │       └── scikit_learn/
  │       ├── fonts/
  │       │   ├── Inter-Variable.woff2         # UI-Schrift
  │       │   ├── JetBrainsMono-Variable.woff2 # Code-Schrift
  │       │   └── KaTeX_Main-Regular.woff2     # Mathe-Schrift
  │       └── images/
  │           ├── logo.svg
  │           ├── welcome.svg
  │           └── achievements/                # Achievement-Icons
  │               ├── first-run.svg
  │               ├── chapter-complete.svg
  │               └── streak-7.svg
  │
  ├── package.json
  ├── svelte.config.js
  ├── vite.config.ts
  ├── tsconfig.json
  ├── tailwind.config.js                       # (falls Tailwind genutzt wird)
  ├── postcss.config.js
  ├── .eslintrc.cjs
  ├── .prettierrc
  ├── .gitignore
  ├── README.md
  └── LICENSE


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. PHASE 0 — ENTWICKLUNGSUMGEBUNG EINRICHTEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  VORAUSSETZUNGEN INSTALLIEREN
  ──────────────────────────────────────────────────────

  # 1. Node.js (v20+ empfohlen)
  # Download: https://nodejs.org/
  # Oder via nvm:
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  nvm install 20
  nvm use 20

  # 2. Rust installieren
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup update

  # 3. Tauri Systemabhängigkeiten
  # === macOS ===
  xcode-select --install

  # === Linux (Ubuntu/Debian) ===
  sudo apt update
  sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

  # === Windows ===
  # Visual Studio Build Tools installieren (mit C++ Workload)
  # WebView2 ist ab Windows 10+ vorinstalliert

  # 4. Tauri CLI installieren
  cargo install tauri-cli --version "^2.0"

  # Verifizieren:
  node --version       # v20.x.x
  rustc --version      # 1.80+
  cargo tauri --version # tauri-cli 2.x.x


  PROJEKT ERSTELLEN
  ──────────────────────────────────────────────────────

  # Projekt mit Tauri + Svelte erstellen
  npm create tauri-app@latest statistik-lab -- \
    --template sveltekit-ts

  cd statistik-lab

  # Frontend-Dependencies installieren
  npm install

  # Test: App starten
  cargo tauri dev


  ZUSÄTZLICHE DEPENDENCIES INSTALLIEREN
  ──────────────────────────────────────────────────────

  # === Frontend (npm) ===

  # Python-Engine
  npm install pyodide

  # Code-Editor
  npm install @codemirror/state \
              @codemirror/view \
              @codemirror/lang-python \
              @codemirror/theme-one-dark \
              @codemirror/autocomplete \
              @codemirror/commands \
              @codemirror/language \
              @codemirror/search

  # Markdown & Mathe
  npm install markdown-it \
              @types/markdown-it \
              katex \
              @types/katex \
              markdown-it-texmath

  # Sanitization
  npm install dompurify \
              @types/dompurify

  # Visualisierung (optional)
  npm install plotly.js-dist-min

  # Syntax-Highlighting (für read-only Code-Blöcke)
  npm install highlight.js

  # YAML-Parsing
  npm install yaml

  # Tailwind CSS (optional)
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p

  # Dev-Tools
  npm install -D @sveltejs/adapter-static
  npm install -D vitest
  npm install -D @playwright/test


  # === Backend (Rust — in src-tauri/Cargo.toml) ===

  # Datei: src-tauri/Cargo.toml
  # Unter [dependencies] hinzufügen:

  [dependencies]
  tauri = { version = "2", features = ["shell-open"] }
  tauri-plugin-shell = "2"
  tauri-plugin-dialog = "2"
  tauri-plugin-fs = "2"
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  serde_yaml = "0.9"
  rusqlite = { version = "0.31", features = ["bundled"] }
  walkdir = "2"
  notify = "6"
  pulldown-cmark = "0.11"
  chrono = { version = "0.4", features = ["serde"] }
  uuid = { version = "1", features = ["v4"] }
  thiserror = "1"
  log = "0.4"
  env_logger = "0.11"
  directories = "5"      # Plattformspezifische App-Verzeichnisse


  PYODIDE OFFLINE VORBEREITEN
  ──────────────────────────────────────────────────────

  # Pyodide-Dateien herunterladen für Offline-Nutzung
  # (statt CDN → lokal bündeln)

  mkdir -p static/pyodide
  cd static/pyodide

  # Pyodide Core herunterladen
  PYODIDE_VERSION="0.26.2"
  BASE_URL="https://github.com/pyodide/pyodide/releases/download/${PYODIDE_VERSION}"

  wget "${BASE_URL}/pyodide-${PYODIDE_VERSION}.tar.bz2"
  tar -xjf "pyodide-${PYODIDE_VERSION}.tar.bz2"

  # Nur benötigte Dateien behalten:
  # pyodide.js, pyodide.asm.wasm, pyodide-lock.json
  # + Paket-Dateien für numpy, pandas, scipy, matplotlib, scikit-learn

  cd ../..


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. PHASE 1 — TAURI-GRUNDGERÜST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DATEI: src-tauri/tauri.conf.json
  ──────────────────────────────────────────────────────

  {
    "$schema": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-config-schema/schema.json",
    "productName": "StatistikLab",
    "version": "0.1.0",
    "identifier": "com.statistiklab.app",
    "build": {
      "frontendDist": "../build",
      "devUrl": "http://localhost:5173",
      "beforeDevCommand": "npm run dev",
      "beforeBuildCommand": "npm run build"
    },
    "app": {
      "title": "StatistikLab",
      "windows": [
        {
          "title": "StatistikLab — Interaktiv Statistik lernen",
          "width": 1280,
          "height": 800,
          "minWidth": 900,
          "minHeight": 600,
          "resizable": true,
          "fullscreen": false,
          "decorations": true
        }
      ],
      "security": {
        "csp": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:"
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": [
        "resources/**/*"
      ],
      "category": "Education",
      "shortDescription": "Interaktiv Statistik lernen",
      "longDescription": "StatistikLab ist eine Desktop-Anwendung zum interaktiven Erlernen von Statistik mit ausführbarem Python-Code."
    }
  }


  DATEI: src-tauri/capabilities/default.json
  ──────────────────────────────────────────────────────

  {
    "$schema": "../gen/schemas/desktop-schema.json",
    "identifier": "default",
    "description": "Capability for the main window",
    "windows": ["main"],
    "permissions": [
      "core:default",
      "shell:allow-open",
      "dialog:allow-open",
      "dialog:allow-save",
      "fs:allow-read",
      "fs:allow-write",
      "fs:allow-exists",
      "fs:allow-mkdir",
      "fs:scope-home"
    ]
  }


  DATEI: src-tauri/src/main.rs
  ──────────────────────────────────────────────────────

  // Prevents additional console window on Windows in release
  #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

  fn main() {
      statistik_lab::run();
  }


  DATEI: src-tauri/src/lib.rs
  ──────────────────────────────────────────────────────

  mod commands;
  mod db;
  mod models;
  mod services;
  mod utils;

  use db::connection::Database;
  use std::sync::Mutex;

  pub struct AppState {
      pub db: Mutex<Database>,
  }

  pub fn run() {
      // Logger initialisieren
      env_logger::init();

      // Datenbank initialisieren
      let app_dirs = directories::ProjectDirs::from("com", "statistiklab", "StatistikLab")
          .expect("Konnte App-Verzeichnisse nicht bestimmen");

      let data_dir = app_dirs.data_dir();
      std::fs::create_dir_all(data_dir).expect("Konnte Datenverzeichnis nicht erstellen");

      let db_path = data_dir.join("statistiklab.db");
      let database = Database::new(&db_path).expect("Datenbank-Initialisierung fehlgeschlagen");

      tauri::Builder::default()
          .plugin(tauri_plugin_shell::init())
          .plugin(tauri_plugin_dialog::init())
          .plugin(tauri_plugin_fs::init())
          .manage(AppState {
              db: Mutex::new(database),
          })
          .invoke_handler(tauri::generate_handler![
              // Course Commands
              commands::course_commands::list_courses,
              commands::course_commands::load_course,
              commands::course_commands::get_course_path,
              // Lesson Commands
              commands::lesson_commands::load_lesson,
              commands::lesson_commands::get_lesson_content,
              // Progress Commands
              commands::progress_commands::get_progress,
              commands::progress_commands::save_lesson_progress,
              commands::progress_commands::get_overall_progress,
              commands::progress_commands::reset_progress,
              // Settings Commands
              commands::settings_commands::get_settings,
              commands::settings_commands::save_settings,
              // Export Commands
              commands::export_commands::export_html,
              commands::export_commands::export_pdf,
              // Dataset Commands
              commands::dataset_commands::import_dataset,
              commands::dataset_commands::list_datasets,
              // Search Commands
              commands::search_commands::search,
              // Achievement Commands
              commands::achievement_commands::get_achievements,
              commands::achievement_commands::check_achievements,
          ])
          .setup(|app| {
              log::info!("StatistikLab gestartet");

              // Default-Kurs kopieren falls nicht vorhanden
              let resource_path = app.path().resource_dir()
                  .expect("Resource dir nicht gefunden");
              let courses_dir = data_dir.join("courses");

              if !courses_dir.exists() {
                  let default_course = resource_path.join("resources/default-course");
                  if default_course.exists() {
                      services::course_service::copy_default_course(
                          &default_course,
                          &courses_dir
                      ).ok();
                  }
              }

              Ok(())
          })
          .run(tauri::generate_context!())
          .expect("Fehler beim Starten der Anwendung");
  }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. PHASE 2 — PYTHON-ENGINE (PYODIDE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DATEI: src/lib/engine/pyodide-worker.ts
  ──────────────────────────────────────────────────────
  // Web Worker — Python läuft in eigenem Thread
  // → UI bleibt responsiv während Code ausgeführt wird

  import { loadPyodide, type PyodideInterface } from 'pyodide';

  let pyodide: PyodideInterface | null = null;

  interface WorkerMessage {
    id: string;
    type: 'init' | 'run' | 'load-package' | 'set-variable' | 'reset';
    code?: string;
    packages?: string[];
    variable?: { name: string; value: any };
  }

  interface WorkerResponse {
    id: string;
    type: 'init-done' | 'result' | 'error' | 'stdout' | 'stderr' | 'plot';
    data?: any;
    error?: string;
  }

  function respond(msg: WorkerResponse) {
    self.postMessage(msg);
  }

  // === PYTHON PRELUDE ===
  // Wird beim Init ausgeführt — konfiguriert matplotlib etc.
  const PYTHON_PRELUDE = `
import sys
import io
import base64
import json

# Matplotlib für Inline-Ausgabe konfigurieren
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt

# Seaborn Style setzen
try:
    import seaborn as sns
    sns.set_theme(style="whitegrid")
except:
    pass

# Custom show()-Funktion die Plots als Base64 zurückgibt
_statistiklab_plots = []

def _capture_plot():
    """Aktuellen Plot als Base64-PNG capturen."""
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=120, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close('all')
    _statistiklab_plots.append(img_b64)
    return img_b64

# plt.show() überschreiben
_original_show = plt.show
def _custom_show(*args, **kwargs):
    if plt.get_fignums():
        _capture_plot()
plt.show = _custom_show

# Stdout/Stderr capturing
class _OutputCapture:
    def __init__(self):
        self.stdout_capture = io.StringIO()
        self.stderr_capture = io.StringIO()
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr

    def start(self):
        self.stdout_capture = io.StringIO()
        self.stderr_capture = io.StringIO()
        sys.stdout = self.stdout_capture
        sys.stderr = self.stderr_capture
        global _statistiklab_plots
        _statistiklab_plots = []

    def stop(self):
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr
        return {
            'stdout': self.stdout_capture.getvalue(),
            'stderr': self.stderr_capture.getvalue(),
            'plots': _statistiklab_plots.copy()
        }

_output = _OutputCapture()

# Hilfsfunktionen für Statistik-Lektionen
def show_dataframe(df, max_rows=10):
    """DataFrame als HTML-Tabelle anzeigen."""
    print(df.to_html(max_rows=max_rows, classes='dataframe'))

def describe_data(data, name="Daten"):
    """Schnelle deskriptive Statistik."""
    import numpy as np
    print(f"\\n=== {name} ===")
    print(f"  n     = {len(data)}")
    print(f"  Mean  = {np.mean(data):.4f}")
    print(f"  Median= {np.median(data):.4f}")
    print(f"  Std   = {np.std(data, ddof=1):.4f}")
    print(f"  Min   = {np.min(data):.4f}")
    print(f"  Max   = {np.max(data):.4f}")
    print(f"  Range = {np.ptp(data):.4f}")

print("✅ StatistikLab Python Engine bereit!")
print(f"   Python {sys.version.split()[0]}")
print(f"   NumPy, Pandas, SciPy, Matplotlib geladen")
  `;

  // === MESSAGE HANDLER ===
  self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { id, type, code, packages, variable } = event.data;

    try {
      switch (type) {
        case 'init': {
          pyodide = await loadPyodide({
            // Für Offline-Nutzung: lokale Dateien
            // indexURL: '/pyodide/',
            // Für Entwicklung: CDN
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
          });

          // Standardpakete laden
          await pyodide.loadPackage([
            'numpy',
            'pandas',
            'scipy',
            'matplotlib',
            'scikit-learn',
          ]);

          // Optionale Pakete (nicht-blockierend)
          try {
            await pyodide.loadPackage(['statsmodels', 'seaborn']);
          } catch {
            console.warn('Optionale Pakete konnten nicht geladen werden');
          }

          // Prelude ausführen
          await pyodide.runPythonAsync(PYTHON_PRELUDE);

          respond({ id, type: 'init-done' });
          break;
        }

        case 'run': {
          if (!pyodide || !code) {
            respond({ id, type: 'error', error: 'Python Engine nicht initialisiert' });
            return;
          }

          // Output-Capturing starten
          pyodide.runPython('_output.start()');

          // Code ausführen
          let result: any;
          try {
            result = await pyodide.runPythonAsync(code);
          } catch (pyError: any) {
            // Python-Fehler abfangen
            pyodide.runPython(`
              sys.stdout = _output._original_stdout
              sys.stderr = _output._original_stderr
            `);
            respond({
              id,
              type: 'error',
              error: pyError.message || String(pyError),
            });
            return;
          }

          // Output einsammeln
          const outputJson = pyodide.runPython(`
            import json
            _result = _output.stop()
            json.dumps(_result)
          `);

          const output = JSON.parse(outputJson);

          // Plots einzeln senden
          for (const plotB64 of output.plots) {
            respond({ id, type: 'plot', data: plotB64 });
          }

          // Ergebnis senden
          respond({
            id,
            type: 'result',
            data: {
              stdout: output.stdout,
              stderr: output.stderr,
              result: result?.toString() ?? null,
              plotCount: output.plots.length,
            },
          });
          break;
        }

        case 'load-package': {
          if (!pyodide || !packages) return;
          await pyodide.loadPackage(packages);
          respond({ id, type: 'result', data: { loaded: packages } });
          break;
        }

        case 'set-variable': {
          if (!pyodide || !variable) return;
          pyodide.globals.set(variable.name, variable.value);
          respond({ id, type: 'result' });
          break;
        }

        case 'reset': {
          // Namespace zurücksetzen
          if (pyodide) {
            await pyodide.runPythonAsync(`
              # Alle User-Variablen löschen
              _keep = set(dir()) | {'_keep'}
              # Re-run prelude
            `);
            await pyodide.runPythonAsync(PYTHON_PRELUDE);
          }
          respond({ id, type: 'result' });
          break;
        }
      }
    } catch (error: any) {
      respond({
        id,
        type: 'error',
        error: error.message || 'Unbekannter Fehler',
      });
    }
  };


  DATEI: src/lib/engine/pyodide-engine.ts
  ──────────────────────────────────────────────────────
  // Hauptklasse — wird von Svelte-Komponenten genutzt

  export type EngineStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error';

  export interface ExecutionResult {
    stdout: string;
    stderr: string;
    result: string | null;
    plots: string[];       // Base64-encoded PNG-Bilder
    error: string | null;
    executionTime: number; // Millisekunden
  }

  type MessageCallback = (response: any) => void;

  class PyodideEngine {
    private worker: Worker | null = null;
    private callbacks: Map<string, MessageCallback> = new Map();
    private plotBuffers: Map<string, string[]> = new Map();
    private _status: EngineStatus = 'idle';
    private statusListeners: Set<(status: EngineStatus) => void> = new Set();

    get status(): EngineStatus {
      return this._status;
    }

    private setStatus(status: EngineStatus) {
      this._status = status;
      this.statusListeners.forEach((fn) => fn(status));
    }

    onStatusChange(fn: (status: EngineStatus) => void): () => void {
      this.statusListeners.add(fn);
      return () => this.statusListeners.delete(fn);
    }

    private generateId(): string {
      return Math.random().toString(36).substring(2, 15);
    }

    async init(): Promise<void> {
      if (this._status === 'ready' || this._status === 'loading') return;

      this.setStatus('loading');

      return new Promise((resolve, reject) => {
        try {
          this.worker = new Worker(
            new URL('./pyodide-worker.ts', import.meta.url),
            { type: 'module' }
          );

          this.worker.onmessage = (event) => {
            const { id, type, data, error } = event.data;

            if (type === 'plot') {
              // Plots sammeln
              if (!this.plotBuffers.has(id)) {
                this.plotBuffers.set(id, []);
              }
              this.plotBuffers.get(id)!.push(data);
              return;
            }

            const callback = this.callbacks.get(id);
            if (callback) {
              this.callbacks.delete(id);
              callback(event.data);
            }
          };

          this.worker.onerror = (error) => {
            this.setStatus('error');
            reject(error);
          };

          const id = this.generateId();
          this.callbacks.set(id, (response) => {
            if (response.type === 'init-done') {
              this.setStatus('ready');
              resolve();
            } else {
              this.setStatus('error');
              reject(new Error(response.error));
            }
          });

          this.worker.postMessage({ id, type: 'init' });
        } catch (error) {
          this.setStatus('error');
          reject(error);
        }
      });
    }

    async runCode(code: string): Promise<ExecutionResult> {
      if (!this.worker || this._status !== 'ready') {
        throw new Error('Python Engine nicht bereit');
      }

      this.setStatus('running');
      const startTime = performance.now();

      return new Promise((resolve) => {
        const id = this.generateId();
        this.plotBuffers.set(id, []);

        this.callbacks.set(id, (response) => {
          const executionTime = performance.now() - startTime;
          const plots = this.plotBuffers.get(id) || [];
          this.plotBuffers.delete(id);

          this.setStatus('ready');

          if (response.type === 'error') {
            resolve({
              stdout: '',
              stderr: '',
              result: null,
              plots: [],
              error: response.error,
              executionTime,
            });
          } else {
            resolve({
              stdout: response.data.stdout || '',
              stderr: response.data.stderr || '',
              result: response.data.result,
              plots,
              error: null,
              executionTime,
            });
          }
        });

        this.worker!.postMessage({ id, type: 'run', code });
      });
    }

    async loadPackage(packages: string[]): Promise<void> {
      if (!this.worker) throw new Error('Worker nicht initialisiert');

      return new Promise((resolve, reject) => {
        const id = this.generateId();
        this.callbacks.set(id, (response) => {
          if (response.type === 'error') reject(new Error(response.error));
          else resolve();
        });
        this.worker!.postMessage({ id, type: 'load-package', packages });
      });
    }

    async setVariable(name: string, value: any): Promise<void> {
      if (!this.worker) throw new Error('Worker nicht initialisiert');

      return new Promise((resolve) => {
        const id = this.generateId();
        this.callbacks.set(id, () => resolve());
        this.worker!.postMessage({
          id,
          type: 'set-variable',
          variable: { name, value },
        });
      });
    }

    async reset(): Promise<void> {
      if (!this.worker) return;
      return new Promise((resolve) => {
        const id = this.generateId();
        this.callbacks.set(id, () => resolve());
        this.worker!.postMessage({ id, type: 'reset' });
      });
    }

    destroy(): void {
      this.worker?.terminate();
      this.worker = null;
      this.callbacks.clear();
      this.plotBuffers.clear();
      this.setStatus('idle');
    }
  }

  // Singleton-Export
  export const pythonEngine = new PyodideEngine();


  DATEI: src/lib/engine/exercise-validator.ts
  ──────────────────────────────────────────────────────

  import { pythonEngine } from './pyodide-engine';

  export interface ValidationResult {
    passed: boolean;
    message: string;
    expected?: string;
    actual?: string;
    hint?: string;
  }

  export async function validateExercise(
    userCode: string,
    solution: string,
    validationType: 'exact' | 'approx' | 'contains' | 'custom' = 'approx',
    tolerance: number = 0.001
  ): Promise<ValidationResult> {
    // User-Code ausführen
    const userResult = await pythonEngine.runCode(userCode);

    if (userResult.error) {
      return {
        passed: false,
        message: '❌ Dein Code hat einen Fehler erzeugt.',
        actual: userResult.error,
        hint: 'Überprüfe die Syntax und versuche es erneut.',
      };
    }

    // Lösung ausführen
    const solutionResult = await pythonEngine.runCode(solution);

    if (solutionResult.error) {
      return {
        passed: false,
        message: '⚠️ Interner Fehler bei der Validierung.',
        actual: solutionResult.error,
      };
    }

    switch (validationType) {
      case 'exact':
        return validateExact(userResult.stdout.trim(), solutionResult.stdout.trim());

      case 'approx':
        return validateApprox(userResult.stdout.trim(), solutionResult.stdout.trim(), tolerance);

      case 'contains':
        return validateContains(userResult.stdout.trim(), solution);

      case 'custom':
        return validateCustom(userCode, solution);

      default:
        return validateApprox(userResult.stdout.trim(), solutionResult.stdout.trim(), tolerance);
    }
  }

  function validateExact(actual: string, expected: string): ValidationResult {
    const passed = actual === expected;
    return {
      passed,
      message: passed ? '✅ Perfekt! Genau richtig!' : '❌ Nicht ganz richtig.',
      expected,
      actual,
      hint: passed ? undefined : 'Vergleiche deine Ausgabe mit der erwarteten.',
    };
  }

  function validateApprox(actual: string, expected: string, tolerance: number): ValidationResult {
    // Versuche numerischen Vergleich
    const actualNum = parseFloat(actual.replace(/[^0-9.-]/g, ''));
    const expectedNum = parseFloat(expected.replace(/[^0-9.-]/g, ''));

    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      const passed = Math.abs(actualNum - expectedNum) < tolerance;
      return {
        passed,
        message: passed
          ? '✅ Richtig! (Numerisch korrekt)'
          : `❌ Nicht ganz. Erwartet: ~${expectedNum}, bekommen: ${actualNum}`,
        expected: expectedNum.toString(),
        actual: actualNum.toString(),
      };
    }

    // Fallback: String-Vergleich
    return validateExact(actual, expected);
  }

  function validateContains(actual: string, expected: string): ValidationResult {
    const passed = actual.toLowerCase().includes(expected.toLowerCase());
    return {
      passed,
      message: passed ? '✅ Richtig!' : '❌ Erwartete Ausgabe nicht gefunden.',
      expected,
      actual,
    };
  }

  async function validateCustom(userCode: string, validationCode: string): Promise<ValidationResult> {
    // Custom Validierungscode ausführen (z.B. Check ob Variable existiert)
    const checkCode = `
${userCode}

# Validierung
try:
    ${validationCode}
    print("PASSED")
except AssertionError as e:
    print(f"FAILED: {e}")
except Exception as e:
    print(f"ERROR: {e}")
    `;

    const result = await pythonEngine.runCode(checkCode);
    const output = result.stdout.trim();

    return {
      passed: output === 'PASSED',
      message: output === 'PASSED' ? '✅ Alle Tests bestanden!' : `❌ ${output}`,
    };
  }


  DATEI: src/lib/engine/output-parser.ts
  ──────────────────────────────────────────────────────

  import DOMPurify from 'dompurify';

  export interface ParsedOutput {
    segments: OutputSegment[];
  }

  export type OutputSegment =
    | { type: 'text'; content: string }
    | { type: 'html'; content: string }    // DataFrame-Tabellen
    | { type: 'plot'; src: string }         // Base64-Bilder
    | { type: 'error'; content: string };

  export function parseOutput(
    stdout: string,
    stderr: string,
    plots: string[],
    error: string | null
  ): ParsedOutput {
    const segments: OutputSegment[] = [];

    if (error) {
      segments.push({
        type: 'error',
        content: formatPythonError(error),
      });
      return { segments };
    }

    if (stdout) {
      // Check ob stdout HTML enthält (z.B. DataFrame.to_html())
      const parts = stdout.split(/(<table.*?<\/table>)/gs);

      for (const part of parts) {
        if (part.trim() === '') continue;

        if (part.startsWith('<table')) {
          segments.push({
            type: 'html',
            content: DOMPurify.sanitize(part),
          });
        } else {
          segments.push({
            type: 'text',
            content: part,
          });
        }
      }
    }

    // Plots einfügen
    for (const plotB64 of plots) {
      segments.push({
        type: 'plot',
        src: `data:image/png;base64,${plotB64}`,
      });
    }

    if (stderr && !error) {
      segments.push({
        type: 'text',
        content: stderr,
      });
    }

    return { segments };
  }

  function formatPythonError(error: string): string {
    // Python-Traceback aufhübschen
    return error
      .replace(/File "<exec>", /g, 'Zeile ')
      .replace(/\n\n+/g, '\n');
  }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. PHASE 3 — MARKDOWN-PARSER & KURSFORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DATEI: src/lib/types/cells.ts
  ──────────────────────────────────────────────────────

  export type CellType = 'markdown' | 'code' | 'exercise' | 'quiz' | 'widget' | 'hint' | 'info';

  export interface BaseCell {
    id: string;
    type: CellType;
    order: number;
  }

  export interface MarkdownCell extends BaseCell {
    type: 'markdown';
    content: string;          // Gerenderten HTML-Content
    rawMarkdown: string;      // Original Markdown
  }

  export interface CodeCell extends BaseCell {
    type: 'code';
    code: string;             // Python-Code
    editable: boolean;        // Darf User Code ändern?
    autoRun: boolean;         // Automatisch ausführen beim Laden?
    output?: ExecutionOutput;
  }

  export interface ExerciseCell extends BaseCell {
    type: 'exercise';
    instruction: string;      // Aufgabenstellung (HTML)
    starterCode: string;      // Vorgabe-Code mit Lücken
    solution: string;         // Lösung (für Validierung)
    hints: string[];          // Schrittweise Hinweise
    validationType: 'exact' | 'approx' | 'contains' | 'custom';
    tolerance?: number;
    completed: boolean;
  }

  export interface QuizCell extends BaseCell {
    type: 'quiz';
    question: string;
    options: QuizOption[];
    explanation: string;      // Erklärung nach Antwort
    multiSelect: boolean;     // Mehrere richtige Antworten?
    answered: boolean;
    correct: boolean;
  }

  export interface QuizOption {
    text: string;
    correct: boolean;
    selected: boolean;
  }

  export interface WidgetCell extends BaseCell {
    type: 'widget';
    widgetType: 'normal-distribution' | 'regression' | 'histogram' | 'custom';
    parameters: WidgetParameter[];
    code: string;             // Python-Code mit Platzhaltern
  }

  export interface WidgetParameter {
    name: string;
    label: string;
    type: 'slider' | 'select' | 'number';
    min?: number;
    max?: number;
    step?: number;
    value: number | string;
    options?: string[];       // Für select
  }

  export interface HintCell extends BaseCell {
    type: 'hint';
    title: string;
    content: string;          // HTML
    expanded: boolean;
  }

  export interface InfoCell extends BaseCell {
    type: 'info';
    variant: 'info' | 'warning' | 'tip' | 'important';
    title: string;
    content: string;          // HTML
  }

  export interface ExecutionOutput {
    segments: OutputSegment[];
    executionTime: number;
    timestamp: number;
  }

  export type Cell = MarkdownCell | CodeCell | ExerciseCell | QuizCell
    | WidgetCell | HintCell | InfoCell;


  DATEI: src/lib/types/course.ts
  ──────────────────────────────────────────────────────

  export interface CourseMeta {
    id: string;
    title: string;
    description: string;
    author: string;
    version: string;
    language: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    estimatedHours: number;
    coverImage?: string;
    chapters: ChapterMeta[];
  }

  export interface ChapterMeta {
    id: string;
    title: string;
    description: string;
    order: number;
    icon?: string;
    lessons: LessonMeta[];
  }

  export interface LessonMeta {
    id: string;
    title: string;
    order: number;
    estimatedMinutes: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    filePath: string;         // Relativer Pfad zur .md Datei
    prerequisites?: string[]; // IDs von vorausgesetzten Lektionen
  }

  export interface Lesson {
    meta: LessonMeta;
    cells: Cell[];            // Geparste Zellen
    rawContent: string;       // Original Markdown
  }


  DATEI: src/lib/parser/markdown-parser.ts
  ──────────────────────────────────────────────────────

  import MarkdownIt from 'markdown-it';
  import texmath from 'markdown-it-texmath';
  import katex from 'katex';
  import { v4 as uuid } from 'uuid';   // Oder eigene ID-Generierung
  import type { Cell, CodeCell, ExerciseCell, QuizCell, WidgetCell,
    HintCell, InfoCell, MarkdownCell } from '$lib/types/cells';
  import { parseQuiz } from './quiz-parser';
  import { parseFrontmatter } from './frontmatter';

  // Markdown-It Instanz konfigurieren
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  // KaTeX Plugin für Matheformeln
  md.use(texmath, {
    engine: katex,
    delimiters: 'dollars',    // $inline$ und $$block$$
    katexOptions: {
      throwOnError: false,
      displayMode: false,
    },
  });

  // Einfache ID-Generierung (ohne uuid dependency)
  function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  /**
   * Parst eine Lektions-Datei (Markdown + Frontmatter) in Zellen.
   *
   * Unterstützte Blöcke:
   *   ```python                     → Nur-Lese Code (Syntax-Highlighted)
   *   ```python {interactive}       → Ausführbare Code-Zelle
   *   ```python {exercise, solution="..."}  → Übungsaufgabe
   *   ::quiz ... ::                 → Multiple-Choice Quiz
   *   ::widget{type="..."} ... ::   → Interaktives Widget
   *   :::hint{title="..."} ... :::  → Aufklappbarer Hinweis
   *   :::info ... :::               → Info-Box
   *   :::warning ... :::            → Warnung-Box
   *   :::tip ... :::                → Tipp-Box
   */
  export function parseLesson(rawContent: string): Cell[] {
    const { content } = parseFrontmatter(rawContent);
    const cells: Cell[] = [];
    let order = 0;

    // Schritt 1: Content in Segmente aufteilen
    const segments = splitIntoSegments(content);

    for (const segment of segments) {
      order++;

      switch (segment.type) {
        case 'markdown':
          cells.push(createMarkdownCell(segment.content, order));
          break;

        case 'code-interactive':
          cells.push(createCodeCell(segment.content, order, true));
          break;

        case 'code-readonly':
          // Read-only Code wird als Markdown mit Syntax-Highlighting gerendert
          cells.push(createMarkdownCell(
            '```python\n' + segment.content + '\n```',
            order
          ));
          break;

        case 'exercise':
          cells.push(createExerciseCell(
            segment.content,
            segment.meta || {},
            order
          ));
          break;

        case 'quiz':
          cells.push(createQuizCell(segment.content, order));
          break;

        case 'widget':
          cells.push(createWidgetCell(segment.content, segment.meta || {}, order));
          break;

        case 'hint':
          cells.push(createHintCell(segment.content, segment.meta || {}, order));
          break;

        case 'info':
        case 'warning':
        case 'tip':
        case 'important':
          cells.push(createInfoCell(segment.content, segment.type, segment.meta || {}, order));
          break;
      }
    }

    return cells;
  }

  type SegmentType = 'markdown' | 'code-interactive' | 'code-readonly'
    | 'exercise' | 'quiz' | 'widget' | 'hint' | 'info' | 'warning' | 'tip' | 'important';

  interface Segment {
    type: SegmentType;
    content: string;
    meta?: Record<string, string>;
  }

  function splitIntoSegments(content: string): Segment[] {
    const segments: Segment[] = [];
    const lines = content.split('\n');
    let currentMarkdown = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // === Code-Block erkennen ===
      const codeMatch = line.match(/^```python\s*(\{.*\})?\s*$/);
      if (codeMatch) {
        // Vorheriges Markdown speichern
        if (currentMarkdown.trim()) {
          segments.push({ type: 'markdown', content: currentMarkdown.trim() });
          currentMarkdown = '';
        }

        const flags = codeMatch[1] || '';
        const codeLines: string[] = [];
        i++;

        while (i < lines.length && lines[i] !== '```') {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // Schließendes ``` überspringen

        const code = codeLines.join('\n');
        const meta = parseFlags(flags);

        if (flags.includes('exercise')) {
          segments.push({ type: 'exercise', content: code, meta });
        } else if (flags.includes('interactive') || flags.includes('run')) {
          segments.push({ type: 'code-interactive', content: code });
        } else {
          segments.push({ type: 'code-readonly', content: code });
        }

        continue;
      }

      // === Quiz-Block erkennen ===
      if (line.trim() === '::quiz') {
        if (currentMarkdown.trim()) {
          segments.push({ type: 'markdown', content: currentMarkdown.trim() });
          currentMarkdown = '';
        }

        const quizLines: string[] = [];
        i++;

        while (i < lines.length && lines[i].trim() !== '::') {
          quizLines.push(lines[i]);
          i++;
        }
        i++; // Schließendes :: überspringen

        segments.push({ type: 'quiz', content: quizLines.join('\n') });
        continue;
      }

      // === Widget-Block erkennen ===
      const widgetMatch = line.match(/^::widget\{(.+)\}\s*$/);
      if (widgetMatch) {
        if (currentMarkdown.trim()) {
          segments.push({ type: 'markdown', content: currentMarkdown.trim() });
          currentMarkdown = '';
        }

        const meta = parseFlags(`{${widgetMatch[1]}}`);
        const widgetLines: string[] = [];
        i++;

        while (i < lines.length && lines[i].trim() !== '::') {
          widgetLines.push(lines[i]);
          i++;
        }
        i++;

        segments.push({ type: 'widget', content: widgetLines.join('\n'), meta });
        continue;
      }

      // === Container-Blöcke (:::hint, :::info, :::warning, :::tip) ===
      const containerMatch = line.match(/^:::(hint|info|warning|tip|important)\s*(\{.*\})?\s*$/);
      if (containerMatch) {
        if (currentMarkdown.trim()) {
          segments.push({ type: 'markdown', content: currentMarkdown.trim() });
          currentMarkdown = '';
        }

        const containerType = containerMatch[1] as SegmentType;
        const meta = containerMatch[2] ? parseFlags(containerMatch[2]) : {};
        const containerLines: string[] = [];
        i++;

        while (i < lines.length && lines[i].trim() !== ':::') {
          containerLines.push(lines[i]);
          i++;
        }
        i++;

        segments.push({
          type: containerType,
          content: containerLines.join('\n'),
          meta,
        });
        continue;
      }

      // === Normales Markdown ===
      currentMarkdown += line + '\n';
      i++;
    }

    // Letztes Markdown-Segment
    if (currentMarkdown.trim()) {
      segments.push({ type: 'markdown', content: currentMarkdown.trim() });
    }

    return segments;
  }

  function parseFlags(flagStr: string): Record<string, string> {
    const meta: Record<string, string> = {};
    // {key="value", key2="value2"} parsen
    const matches = flagStr.matchAll(/(\w+)="([^"]*)"/g);
    for (const match of matches) {
      meta[match[1]] = match[2];
    }
    // Einfache Flags ohne Wert: {interactive, exercise}
    const simpleFlags = flagStr.matchAll(/\b(\w+)\b(?!=)/g);
    for (const match of simpleFlags) {
      if (!meta[match[1]]) {
        meta[match[1]] = 'true';
      }
    }
    return meta;
  }

  function createMarkdownCell(content: string, order: number): MarkdownCell {
    return {
      id: generateId(),
      type: 'markdown',
      order,
      rawMarkdown: content,
      content: md.render(content),
    };
  }

  function createCodeCell(code: string, order: number, editable: boolean): CodeCell {
    return {
      id: generateId(),
      type: 'code',
      order,
      code,
      editable,
      autoRun: false,
    };
  }

  function createExerciseCell(
    code: string,
    meta: Record<string, string>,
    order: number
  ): ExerciseCell {
    return {
      id: generateId(),
      type: 'exercise',
      order,
      instruction: '',
      starterCode: code,
      solution: meta.solution || '',
      hints: meta.hints ? meta.hints.split('|') : [],
      validationType: (meta.validation as any) || 'approx',
      tolerance: meta.tolerance ? parseFloat(meta.tolerance) : 0.001,
      completed: false,
    };
  }

  function createQuizCell(content: string, order: number): QuizCell {
    return {
      id: generateId(),
      type: 'quiz',
      order,
      ...parseQuiz(content),
      answered: false,
      correct: false,
    };
  }

  function createWidgetCell(
    content: string,
    meta: Record<string, string>,
    order: number
  ): WidgetCell {
    return {
      id: generateId(),
      type: 'widget',
      order,
      widgetType: (meta.type as any) || 'custom',
      parameters: parseWidgetParameters(content),
      code: extractWidgetCode(content),
    };
  }

  function createHintCell(
    content: string,
    meta: Record<string, string>,
    order: number
  ): HintCell {
    return {
      id: generateId(),
      type: 'hint',
      order,
      title: meta.title || '💡 Hinweis',
      content: md.render(content),
      expanded: false,
    };
  }

  function createInfoCell(
    content: string,
    variant: string,
    meta: Record<string, string>,
    order: number
  ): InfoCell {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      tip: '💡',
      important: '❗',
    };
    return {
      id: generateId(),
      type: 'info',
      order,
      variant: variant as any,
      title: meta.title || `${icons[variant] || ''} ${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
      content: md.render(content),
    };
  }

  function parseWidgetParameters(content: string): WidgetParameter[] {
    // Parameter aus YAML-ähnlichem Block parsen
    // Beispiel:
    // ---params
    // mu: {type: slider, min: 50, max: 150, value: 100, label: "Mittelwert"}
    // sigma: {type: slider, min: 1, max: 50, value: 15, label: "Standardabweichung"}
    // ---
    const params: WidgetParameter[] = [];
    const paramMatch = content.match(/---params\n([\s\S]*?)\n---/);

    if (paramMatch) {
      const lines = paramMatch[1].split('\n');
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*\{(.+)\}\s*$/);
        if (match) {
          const name = match[1];
          const props = parseFlags(`{${match[2]}}`);
          params.push({
            name,
            label: props.label || name,
            type: (props.type as any) || 'slider',
            min: props.min ? parseFloat(props.min) : 0,
            max: props.max ? parseFloat(props.max) : 100,
            step: props.step ? parseFloat(props.step) : 1,
            value: props.value ? parseFloat(props.value) : 50,
          });
        }
      }
    }

    return params;
  }

  function extractWidgetCode(content: string): string {
    // Code nach ---params ... --- Block extrahieren
    const withoutParams = content.replace(/---params\n[\s\S]*?\n---\n?/, '');
    return withoutParams.trim();
  }


  DATEI: src/lib/parser/quiz-parser.ts
  ──────────────────────────────────────────────────────

  import type { QuizOption } from '$lib/types/cells';

  interface ParsedQuiz {
    question: string;
    options: QuizOption[];
    explanation: string;
    multiSelect: boolean;
  }

  /**
   * Parst Quiz-Content im Format:
   *
   * question: "Was ist der Mittelwert von [1,2,3,4,5]?"
   * options:
   *   - "2"
   *   - "3" ✅
   *   - "4"
   *   - "2.5"
   * explanation: "Der Mittelwert ist (1+2+3+4+5)/5 = 15/5 = 3"
   */
  export function parseQuiz(content: string): ParsedQuiz {
    const lines = content.split('\n');
    let question = '';
    let explanation = '';
    const options: QuizOption[] = [];
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('question:')) {
        currentSection = 'question';
        question = trimmed.replace(/^question:\s*"?/, '').replace(/"?\s*$/, '');
        continue;
      }

      if (trimmed === 'options:') {
        currentSection = 'options';
        continue;
      }

      if (trimmed.startsWith('explanation:')) {
        currentSection = 'explanation';
        explanation = trimmed.replace(/^explanation:\s*"?/, '').replace(/"?\s*$/, '');
        continue;
      }

      if (currentSection === 'options' && trimmed.startsWith('- ')) {
        const optionText = trimmed.replace(/^-\s*"?/, '').replace(/"?\s*$/, '');
        const isCorrect = optionText.includes('✅');
        options.push({
          text: optionText.replace('✅', '').trim(),
          correct: isCorrect,
          selected: false,
        });
      }

      if (currentSection === 'explanation' && trimmed && !trimmed.startsWith('explanation:')) {
        explanation += ' ' + trimmed.replace(/^"?/, '').replace(/"?\s*$/, '');
      }
    }

    const correctCount = options.filter((o) => o.correct).length;

    return {
      question,
      options,
      explanation: explanation.trim(),
      multiSelect: correctCount > 1,
    };
  }


  DATEI: src/lib/parser/frontmatter.ts
  ──────────────────────────────────────────────────────

  import yaml from 'yaml';

  export interface LessonFrontmatter {
    title: string;
    chapter?: number;
    lesson?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedMinutes?: number;
    prerequisites?: string[];
    tags?: string[];
    datasets?: string[];      // Benötigte Datensätze
  }

  export function parseFrontmatter(content: string): {
    frontmatter: LessonFrontmatter;
    content: string;
  } {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
      return {
        frontmatter: { title: 'Unbenannt' },
        content,
      };
    }

    const frontmatter = yaml.parse(match[1]) as LessonFrontmatter;
    const body = match[2];

    return { frontmatter, content: body };
  }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. PHASE 4 — CODE-EDITOR (CODEMIRROR 6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DATEI: src/lib/components/editor/PythonEditor.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { EditorState, type Extension } from '@codemirror/state';
    import { EditorView, keymap, lineNumbers, highlightActiveLine,
             highlightActiveLineGutter, drawSelection,
             rectangularSelection } from '@codemirror/view';
    import { python } from '@codemirror/lang-python';
    import { oneDark } from '@codemirror/theme-one-dark';
    import { defaultKeymap, history, historyKeymap,
             indentWithTab } from '@codemirror/commands';
    import { autocompletion, closeBrackets,
             closeBracketsKeymap } from '@codemirror/autocomplete';
    import { indentOnInput, bracketMatching, foldGutter,
             foldKeymap, syntaxHighlighting,
             defaultHighlightStyle } from '@codemirror/language';
    import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
    import { settingsStore } from '$lib/stores/settings.store';

    export let code: string = '';
    export let editable: boolean = true;
    export let minHeight: string = '80px';
    export let maxHeight: string = '500px';

    const dispatch = createEventDispatcher<{
      change: string;
      run: string;
    }>();

    let editorContainer: HTMLDivElement;
    let view: EditorView;

    // Custom Theme passend zur App
    const statistikLabTheme = EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      },
      '.cm-content': {
        padding: '12px 0',
        minHeight: minHeight,
        maxHeight: maxHeight,
      },
      '.cm-gutters': {
        backgroundColor: 'var(--editor-gutter-bg, #f5f5f5)',
        color: 'var(--editor-gutter-color, #999)',
        border: 'none',
        borderRight: '1px solid var(--border-color, #e0e0e0)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'var(--editor-active-gutter, #e8e8e8)',
      },
      '.cm-activeLine': {
        backgroundColor: 'var(--editor-active-line, #f0f4ff)',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: 'var(--accent-color, #4f46e5)',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: 'var(--editor-selection, #c8d2e8)',
      },
      '.cm-scroller': {
        overflow: 'auto',
      },
    });

    // Ctrl+Enter / Cmd+Enter → Code ausführen
    const runKeymap = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          dispatch('run', view.state.doc.toString());
          return true;
        },
      },
      {
        key: 'Shift-Enter',
        run: () => {
          dispatch('run', view.state.doc.toString());
          return true;
        },
      },
    ]);

    // Extensions basierend auf Einstellungen zusammenstellen
    function getExtensions(): Extension[] {
      const extensions: Extension[] = [
        // Basis
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        rectangularSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        foldGutter(),
        highlightSelectionMatches(),
        history(),

        // Keymaps
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          ...foldKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        runKeymap,

        // Python-Sprache
        python(),
        autocompletion(),

        // Theme
        statistikLabTheme,

        // Change-Listener
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            dispatch('change', update.state.doc.toString());
          }
        }),

        // Editierbarkeit
        EditorView.editable.of(editable),
        EditorState.readOnly.of(!editable),
      ];

      // Dark-Mode
      if ($settingsStore.theme === 'dark') {
        extensions.push(oneDark);
      } else {
        extensions.push(syntaxHighlighting(defaultHighlightStyle));
      }

      return extensions;
    }

    onMount(() => {
      const state = EditorState.create({
        doc: code,
        extensions: getExtensions(),
      });

      view = new EditorView({
        state,
        parent: editorContainer,
      });
    });

    onDestroy(() => {
      view?.destroy();
    });

    // Code von außen setzen
    export function setCode(newCode: string) {
      if (view) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: newCode,
          },
        });
      }
    }

    // Aktuellen Code abrufen
    export function getCode(): string {
      return view?.state.doc.toString() ?? code;
    }
  </script>

  <div class="python-editor" bind:this={editorContainer}></div>

  <style>
    .python-editor {
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }

    .python-editor :global(.cm-editor) {
      outline: none;
    }

    .python-editor :global(.cm-editor.cm-focused) {
      outline: 2px solid var(--accent-color, #4f46e5);
      outline-offset: -2px;
    }
  </style>


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. PHASE 5 — UI-KOMPONENTEN (SVELTE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DATEI: src/lib/components/layout/AppShell.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import Sidebar from './Sidebar.svelte';
    import Toolbar from './Toolbar.svelte';
    import StatusBar from './StatusBar.svelte';
    import Resizer from './Resizer.svelte';
    import { uiStore } from '$lib/stores/ui.store';

    let sidebarWidth = 280;
  </script>

  <div class="app-shell" class:sidebar-collapsed={!$uiStore.sidebarOpen}>
    <!-- Toolbar -->
    <Toolbar />

    <div class="app-body">
      <!-- Sidebar -->
      {#if $uiStore.sidebarOpen}
        <aside class="sidebar" style="width: {sidebarWidth}px">
          <Sidebar />
        </aside>
        <Resizer bind:width={sidebarWidth} min={200} max={500} />
      {/if}

      <!-- Main Content -->
      <main class="content">
        <slot />
      </main>
    </div>

    <!-- Status Bar -->
    <StatusBar />
  </div>

  <style>
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      flex-shrink: 0;
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      background: var(--bg-sidebar);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }
  </style>


  DATEI: src/lib/components/layout/Sidebar.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { courseStore } from '$lib/stores/course.store';
    import { progressStore } from '$lib/stores/progress.store';
    import ChapterProgress from '../progress/ChapterProgress.svelte';
    import type { ChapterMeta, LessonMeta } from '$lib/types/course';

    let expandedChapters: Set<string> = new Set();

    function toggleChapter(chapterId: string) {
      if (expandedChapters.has(chapterId)) {
        expandedChapters.delete(chapterId);
      } else {
        expandedChapters.add(chapterId);
      }
      expandedChapters = expandedChapters; // Trigger reactivity
    }

    function navigateToLesson(courseId: string, lessonId: string) {
      courseStore.setActiveLesson(courseId, lessonId);
    }

    function isLessonComplete(lessonId: string): boolean {
      return $progressStore.completedLessons.has(lessonId);
    }

    function isActiveLesson(lessonId: string): boolean {
      return $courseStore.activeLessonId === lessonId;
    }
  </script>

  <div class="sidebar-content">
    <!-- Kurs-Titel -->
    <div class="course-header">
      <h2 class="course-title">{$courseStore.currentCourse?.title ?? 'Kein Kurs'}</h2>
      <div class="overall-progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {$progressStore.overallPercent}%"
          ></div>
        </div>
        <span class="progress-text">{$progressStore.overallPercent}%</span>
      </div>
    </div>

    <!-- Kapitel-Baum -->
    <nav class="chapter-tree">
      {#each $courseStore.currentCourse?.chapters ?? [] as chapter (chapter.id)}
        <div class="chapter">
          <button
            class="chapter-header"
            on:click={() => toggleChapter(chapter.id)}
            aria-expanded={expandedChapters.has(chapter.id)}
          >
            <span class="chapter-icon">
              {expandedChapters.has(chapter.id) ? '▼' : '▶'}
            </span>
            <span class="chapter-title">{chapter.title}</span>
            <ChapterProgress chapterId={chapter.id} compact />
          </button>

          {#if expandedChapters.has(chapter.id)}
            <ul class="lesson-list">
              {#each chapter.lessons as lesson (lesson.id)}
                <li>
                  <button
                    class="lesson-item"
                    class:active={isActiveLesson(lesson.id)}
                    class:completed={isLessonComplete(lesson.id)}
                    on:click={() => navigateToLesson($courseStore.currentCourse!.id, lesson.id)}
                  >
                    <span class="lesson-status">
                      {#if isLessonComplete(lesson.id)}
                        ✅
                      {:else if isActiveLesson(lesson.id)}
                        📖
                      {:else}
                        ○
                      {/if}
                    </span>
                    <span class="lesson-title">{lesson.title}</span>
                    <span class="lesson-time">{lesson.estimatedMinutes}min</span>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </nav>
  </div>

  <style>
    .sidebar-content {
      padding: 16px 0;
    }

    .course-header {
      padding: 0 16px 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .course-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .progress-bar {
      height: 6px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-success, #22c55e);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 4px;
      display: block;
    }

    .chapter-tree {
      padding: 8px 0;
    }

    .chapter-header {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      text-align: left;
    }

    .chapter-header:hover {
      background: var(--bg-hover);
    }

    .chapter-icon {
      font-size: 0.7rem;
      width: 16px;
    }

    .lesson-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .lesson-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 6px 16px 6px 40px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-align: left;
    }

    .lesson-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .lesson-item.active {
      background: var(--bg-active);
      color: var(--accent-color);
      font-weight: 600;
    }

    .lesson-item.completed {
      color: var(--color-success);
    }

    .lesson-status {
      width: 20px;
      text-align: center;
      font-size: 0.8rem;
    }

    .lesson-title {
      flex: 1;
    }

    .lesson-time {
      font-size: 0.7rem;
      color: var(--text-tertiary);
    }
  </style>


  DATEI: src/lib/components/lesson/LessonView.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { onMount } from 'svelte';
    import { lessonStore } from '$lib/stores/lesson.store';
    import { pythonEngine } from '$lib/engine/pyodide-engine';
    import MarkdownCell from './MarkdownCell.svelte';
    import CodeCell from './CodeCell.svelte';
    import ExerciseCell from './ExerciseCell.svelte';
    import QuizCell from './QuizCell.svelte';
    import InteractiveWidget from './InteractiveWidget.svelte';
    import OutputCell from './OutputCell.svelte';

    // Props
    export let lessonId: string;
    export let courseId: string;

    // Reactive: Zellen der aktuellen Lektion
    $: cells = $lessonStore.cells;
    $: isLoading = $lessonStore.isLoading;

    onMount(async () => {
      await lessonStore.load(courseId, lessonId);
    });

    async function runCell(cellId: string, code: string) {
      const result = await pythonEngine.execute(code);
      lessonStore.setCellOutput(cellId, result);
    }
  </script>

  <div class="lesson-view">
    {#if isLoading}
      <div class="loading">
        <Spinner />
        <p>Lektion wird geladen...</p>
      </div>
    {:else}
      <div class="cells-container">
        {#each cells as cell (cell.id)}
          {#if cell.type === 'markdown'}
            <MarkdownCell content={cell.content} />
          {:else if cell.type === 'code'}
            <CodeCell
              {cell}
              onRun={(code) => runCell(cell.id, code)}
            />
            {#if cell.output}
              <OutputCell output={cell.output} />
            {/if}
          {:else if cell.type === 'exercise'}
            <ExerciseCell {cell} />
          {:else if cell.type === 'quiz'}
            <QuizCell {cell} />
          {:else if cell.type === 'interactive'}
            <InteractiveWidget {cell} />
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <style>
    .lesson-view {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      gap: 16px;
      color: var(--text-secondary);
    }

    .cells-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  </style>


????????????????????????????????????????????????????????????????????????????????
11. PHASE 6 � RUST-BACKEND (DATEISYSTEM, SQLITE)
????????????????????????????????????????????????????????????????????????????????

  DATEI: src-tauri/src/db/connection.rs
  ------------------------------------------------------

  use rusqlite::{Connection, Result};
  use std::path::Path;

  pub struct Database {
      conn: Connection,
  }

  impl Database {
      pub fn new(path: &Path) -> Result<Self> {
          let conn = Connection::open(path)?;
          let db = Self { conn };
          db.run_migrations()?;
          Ok(db)
      }

      fn run_migrations(&self) -> Result<()> {
          self.conn.execute_batch(
              "CREATE TABLE IF NOT EXISTS user_progress (
                  id INTEGER PRIMARY KEY,
                  course_id TEXT NOT NULL,
                  lesson_id TEXT NOT NULL,
                  completed INTEGER DEFAULT 0,
                  score INTEGER DEFAULT 0,
                  time_spent INTEGER DEFAULT 0,
                  last_accessed TEXT,
                  code_snapshots TEXT,
                  UNIQUE(course_id, lesson_id)
              );

              CREATE TABLE IF NOT EXISTS achievements (
                  id TEXT PRIMARY KEY,
                  name TEXT NOT NULL,
                  description TEXT,
                  icon TEXT,
                  unlocked_at TEXT,
                  progress INTEGER DEFAULT 0
              );

              CREATE TABLE IF NOT EXISTS settings (
                  key TEXT PRIMARY KEY,
                  value TEXT NOT NULL
              );

              CREATE TABLE IF NOT EXISTS code_history (
                  id INTEGER PRIMARY KEY,
                  lesson_id TEXT NOT NULL,
                  cell_id TEXT NOT NULL,
                  code TEXT NOT NULL,
                  timestamp TEXT NOT NULL
              );

              CREATE INDEX IF NOT EXISTS idx_progress_course 
                  ON user_progress(course_id);
              CREATE INDEX IF NOT EXISTS idx_history_lesson 
                  ON code_history(lesson_id);"
          )
      }

      pub fn connection(&self) -> &Connection {
          &self.conn
      }
  }


  DATEI: src-tauri/src/services/progress_service.rs
  ------------------------------------------------------

  use crate::db::connection::Database;
  use crate::models::progress::{LessonProgress, CourseProgress};
  use rusqlite::params;

  pub struct ProgressService;

  impl ProgressService {
      pub fn get_lesson_progress(
          db: &Database,
          course_id: &str,
          lesson_id: &str,
      ) -> Option<LessonProgress> {
          db.connection()
              .query_row(
                  "SELECT completed, score, time_spent, last_accessed 
                   FROM user_progress 
                   WHERE course_id = ? AND lesson_id = ?",
                  params![course_id, lesson_id],
                  |row| {
                      Ok(LessonProgress {
                          lesson_id: lesson_id.to_string(),
                          completed: row.get(0)?,
                          score: row.get(1)?,
                          time_spent: row.get(2)?,
                          last_accessed: row.get(3)?,
                      })
                  },
              )
              .ok()
      }

      pub fn save_lesson_progress(
          db: &Database,
          course_id: &str,
          progress: &LessonProgress,
      ) -> Result<(), rusqlite::Error> {
          db.connection().execute(
              "INSERT INTO user_progress 
                  (course_id, lesson_id, completed, score, time_spent, last_accessed)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6)
               ON CONFLICT(course_id, lesson_id) DO UPDATE SET
                  completed = ?3, score = ?4, time_spent = ?5, last_accessed = ?6",
              params![
                  course_id,
                  progress.lesson_id,
                  progress.completed,
                  progress.score,
                  progress.time_spent,
                  progress.last_accessed
              ],
          )?;
          Ok(())
      }

      pub fn get_course_progress(
          db: &Database,
          course_id: &str,
      ) -> CourseProgress {
          let mut stmt = db.connection()
              .prepare(
                  "SELECT COUNT(*), SUM(completed), SUM(score), SUM(time_spent) 
                   FROM user_progress WHERE course_id = ?"
              )
              .unwrap();

          stmt.query_row(params![course_id], |row| {
              Ok(CourseProgress {
                  course_id: course_id.to_string(),
                  total_lessons: row.get(0)?,
                  completed_lessons: row.get(1)?,
                  total_score: row.get(2)?,
                  total_time: row.get(3)?,
              })
          })
          .unwrap_or_default()
      }
  }
