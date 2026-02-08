━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
20. DATENBANK-SCHEMA (VOLLSTÄNDIG)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ENTITY-RELATIONSHIP-DIAGRAMM
  ──────────────────────────────────────────────────────

  ┌─────────────────┐       ┌─────────────────┐
  │  user_progress  │       │   achievements  │
  ├─────────────────┤       ├─────────────────┤
  │ id (PK)         │       │ id (PK)         │
  │ course_id       │       │ name            │
  │ lesson_id       │       │ description     │
  │ completed       │       │ icon            │
  │ score           │       │ progress        │
  │ time_spent      │       │ unlocked_at     │
  │ last_accessed   │       └─────────────────┘
  │ code_snapshots  │
  └─────────────────┘
          │
          │ course_id
          │
  ┌───────▼─────────┐       ┌─────────────────┐
  │  course_cache   │       │    settings     │
  ├─────────────────┤       ├─────────────────┤
  │ id (PK)         │       │ key (PK)        │
  │ course_id       │       │ value           │
  │ last_modified   │       └─────────────────┘
  │ structure_json  │
  └─────────────────┘
          │
          │ lesson_id
          │
  ┌───────▼─────────┐
  │  code_history   │
  ├─────────────────┤
  │ id (PK)         │
  │ lesson_id       │
  │ cell_id         │
  │ code            │
  │ timestamp       │
  └─────────────────┘


  VOLLSTÄNDIGES SQL-SCHEMA
  ──────────────────────────────────────────────────────

  -- =============================================
  -- TABELLE: user_progress
  -- Speichert den Fortschritt pro Lektion
  -- =============================================
  CREATE TABLE IF NOT EXISTS user_progress (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id       TEXT NOT NULL,
      lesson_id       TEXT NOT NULL,
      completed       INTEGER DEFAULT 0,      -- Boolean: 0 oder 1
      score           INTEGER DEFAULT 0,
      time_spent      INTEGER DEFAULT 0,      -- Sekunden
      last_accessed   TEXT,                   -- ISO-8601 Datetime
      code_snapshots  TEXT,                   -- JSON-Array der Code-Zellen
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now')),

      UNIQUE(course_id, lesson_id)
  );

  CREATE INDEX idx_progress_course ON user_progress(course_id);
  CREATE INDEX idx_progress_accessed ON user_progress(last_accessed);


  -- =============================================
  -- TABELLE: achievements
  -- Gamification: Abzeichen und Erfolge
  -- =============================================
  CREATE TABLE IF NOT EXISTS achievements (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      description     TEXT,
      icon            TEXT,                   -- Dateiname des Icons
      category        TEXT,                   -- milestone, streak, skill, etc.
      requirement     INTEGER DEFAULT 1,
      progress        INTEGER DEFAULT 0,
      unlocked_at     TEXT,                   -- NULL wenn noch nicht freigeschaltet
      created_at      TEXT DEFAULT (datetime('now'))
  );


  -- =============================================
  -- TABELLE: settings
  -- Key-Value Store für App-Einstellungen
  -- =============================================
  CREATE TABLE IF NOT EXISTS settings (
      key             TEXT PRIMARY KEY,
      value           TEXT NOT NULL,
      updated_at      TEXT DEFAULT (datetime('now'))
  );

  -- Standard-Einstellungen einfügen
  INSERT OR IGNORE INTO settings (key, value) VALUES
      ('theme', 'auto'),
      ('fontSize', 'medium'),
      ('autoStartPython', 'true'),
      ('current_streak', '0'),
      ('last_learn_date', NULL);


  -- =============================================
  -- TABELLE: code_history
  -- Versionierung von Code-Eingaben
  -- =============================================
  CREATE TABLE IF NOT EXISTS code_history (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id       TEXT NOT NULL,
      cell_id         TEXT NOT NULL,
      code            TEXT NOT NULL,
      output          TEXT,
      execution_time  INTEGER,                -- Millisekunden
      timestamp       TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX idx_history_lesson ON code_history(lesson_id);
  CREATE INDEX idx_history_cell ON code_history(lesson_id, cell_id);


  -- =============================================
  -- TABELLE: course_cache
  -- Cached Kursstruktur für schnelleres Laden
  -- =============================================
  CREATE TABLE IF NOT EXISTS course_cache (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id       TEXT UNIQUE NOT NULL,
      course_path     TEXT NOT NULL,
      structure_json  TEXT NOT NULL,          -- Serialisierte Kursstruktur
      file_hash       TEXT,                    -- Hash zur Invalidierung
      last_modified   TEXT DEFAULT (datetime('now'))
  );


  -- =============================================
  -- TABELLE: bookmarks
  -- Benutzer-Lesezeichen in Lektionen
  -- =============================================
  CREATE TABLE IF NOT EXISTS bookmarks (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id       TEXT NOT NULL,
      lesson_id       TEXT NOT NULL,
      position        INTEGER,                -- Scroll-Position oder Zellen-Index
      note            TEXT,
      created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX idx_bookmarks_course ON bookmarks(course_id);


  -- =============================================
  -- TABELLE: datasets
  -- Importierte Benutzer-Datensätze
  -- =============================================
  CREATE TABLE IF NOT EXISTS datasets (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT NOT NULL,
      file_path       TEXT NOT NULL,
      file_size       INTEGER,
      row_count       INTEGER,
      column_count    INTEGER,
      columns_json    TEXT,                   -- Spaltennamen und -typen
      preview_json    TEXT,                   -- Erste paar Zeilen
      imported_at     TEXT DEFAULT (datetime('now'))
  );


  MIGRATIONS-STRATEGIE
  ──────────────────────────────────────────────────────

  // src-tauri/src/db/migrations.rs

  pub const MIGRATIONS: &[(&str, &str)] = &[
      ("001_initial", include_str!("../sql/001_initial.sql")),
      ("002_bookmarks", include_str!("../sql/002_bookmarks.sql")),
      ("003_datasets", include_str!("../sql/003_datasets.sql")),
  ];

  pub fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
      // Migrations-Tabelle erstellen
      conn.execute(
          "CREATE TABLE IF NOT EXISTS _migrations (
              name TEXT PRIMARY KEY,
              applied_at TEXT DEFAULT (datetime('now'))
          )",
          [],
      )?;

      for (name, sql) in MIGRATIONS {
          let already_applied: bool = conn.query_row(
              "SELECT 1 FROM _migrations WHERE name = ?",
              params![name],
              |_| Ok(true),
          ).unwrap_or(false);

          if !already_applied {
              conn.execute_batch(sql)?;
              conn.execute(
                  "INSERT INTO _migrations (name) VALUES (?)",
                  params![name],
              )?;
              log::info!("Migration angewendet: {}", name);
          }
      }

      Ok(())
  }
