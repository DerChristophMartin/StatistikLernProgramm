-- =============================================
-- TABELLE: user_progress
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id       TEXT NOT NULL,
    lesson_id       TEXT NOT NULL,
    completed       INTEGER DEFAULT 0,
    score           INTEGER DEFAULT 0,
    time_spent      INTEGER DEFAULT 0,
    last_accessed   TEXT,
    code_snapshots  TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now')),

    UNIQUE(course_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_course ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_accessed ON user_progress(last_accessed);

-- =============================================
-- TABELLE: achievements
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    icon            TEXT,
    category        TEXT,
    requirement     INTEGER DEFAULT 1,
    progress        INTEGER DEFAULT 0,
    unlocked_at     TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABELLE: settings
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL,
    updated_at      TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, value) VALUES
    ('theme', 'auto'),
    ('fontSize', 'medium'),
    ('autoStartPython', 'true'),
    ('current_streak', '0'),
    ('last_learn_date', NULL);

-- =============================================
-- TABELLE: code_history
-- =============================================
CREATE TABLE IF NOT EXISTS code_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id       TEXT NOT NULL,
    cell_id         TEXT NOT NULL,
    code            TEXT NOT NULL,
    output          TEXT,
    execution_time  INTEGER,
    timestamp       TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_history_lesson ON code_history(lesson_id);
CREATE INDEX IF NOT EXISTS idx_history_cell ON code_history(lesson_id, cell_id);

-- =============================================
-- TABELLE: course_cache
-- =============================================
CREATE TABLE IF NOT EXISTS course_cache (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id       TEXT UNIQUE NOT NULL,
    course_path     TEXT NOT NULL,
    structure_json  TEXT NOT NULL,
    file_hash       TEXT,
    last_modified   TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABELLE: bookmarks
-- =============================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id       TEXT NOT NULL,
    lesson_id       TEXT NOT NULL,
    position        INTEGER,
    note            TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_course ON bookmarks(course_id);

-- =============================================
-- TABELLE: datasets
-- =============================================
CREATE TABLE IF NOT EXISTS datasets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_size       INTEGER,
    row_count       INTEGER,
    column_count    INTEGER,
    columns_json    TEXT,
    preview_json    TEXT,
    imported_at     TEXT DEFAULT (datetime('now'))
);
