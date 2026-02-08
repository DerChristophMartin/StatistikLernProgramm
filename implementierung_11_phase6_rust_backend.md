━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. PHASE 6 — RUST-BACKEND (DATEISYSTEM, SQLITE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Das Rust-Backend stellt die Brücke zwischen Frontend und Betriebssystem dar.
  Es verwaltet: Dateisystem-Operationen, SQLite-Datenbank, Kurse laden/parsen.


  DATEI: src-tauri/src/db/connection.rs
  ──────────────────────────────────────────────────────

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


  DATEI: src-tauri/src/models/progress.rs
  ──────────────────────────────────────────────────────

  use serde::{Deserialize, Serialize};

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct LessonProgress {
      pub lesson_id: String,
      pub completed: bool,
      pub score: i32,
      pub time_spent: i64,  // Sekunden
      pub last_accessed: Option<String>,
  }

  #[derive(Debug, Clone, Serialize, Deserialize, Default)]
  pub struct CourseProgress {
      pub course_id: String,
      pub total_lessons: i32,
      pub completed_lessons: i32,
      pub total_score: i32,
      pub total_time: i64,
  }

  impl CourseProgress {
      pub fn completion_percentage(&self) -> f32 {
          if self.total_lessons == 0 {
              0.0
          } else {
              (self.completed_lessons as f32 / self.total_lessons as f32) * 100.0
          }
      }
  }


  DATEI: src-tauri/src/services/progress_service.rs
  ──────────────────────────────────────────────────────

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

      pub fn get_course_progress(db: &Database, course_id: &str) -> CourseProgress {
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


  DATEI: src-tauri/src/services/course_service.rs
  ──────────────────────────────────────────────────────

  use crate::models::course::{Course, Chapter, Lesson, CourseMeta};
  use std::path::Path;
  use walkdir::WalkDir;

  pub struct CourseService;

  impl CourseService {
      /// Lädt die Kursstruktur aus dem Dateisystem
      pub fn load_course(path: &Path) -> Result<Course, String> {
          let kurs_yaml = path.join("kurs.yaml");
          if !kurs_yaml.exists() {
              return Err("Keine kurs.yaml gefunden".to_string());
          }

          let content = std::fs::read_to_string(&kurs_yaml)
              .map_err(|e| format!("Fehler beim Lesen: {}", e))?;

          let meta: CourseMeta = serde_yaml::from_str(&content)
              .map_err(|e| format!("YAML-Fehler: {}", e))?;

          let chapters = Self::load_chapters(path)?;

          Ok(Course {
              id: meta.id.clone(),
              meta,
              chapters,
              path: path.to_path_buf(),
          })
      }

      fn load_chapters(course_path: &Path) -> Result<Vec<Chapter>, String> {
          let mut chapters = Vec::new();

          for entry in WalkDir::new(course_path)
              .min_depth(1)
              .max_depth(1)
              .sort_by_file_name()
          {
              let entry = entry.map_err(|e| e.to_string())?;
              let path = entry.path();

              if path.is_dir() {
                  if let Some(chapter) = Self::load_chapter(path)? {
                      chapters.push(chapter);
                  }
              }
          }

          Ok(chapters)
      }

      fn load_chapter(path: &Path) -> Result<Option<Chapter>, String> {
          let kapitel_yaml = path.join("kapitel.yaml");
          if !kapitel_yaml.exists() {
              return Ok(None);
          }

          let content = std::fs::read_to_string(&kapitel_yaml)
              .map_err(|e| format!("Fehler: {}", e))?;

          let mut chapter: Chapter = serde_yaml::from_str(&content)
              .map_err(|e| format!("YAML-Fehler: {}", e))?;

          chapter.lessons = Self::load_lessons(path)?;
          chapter.path = path.to_path_buf();

          Ok(Some(chapter))
      }

      fn load_lessons(chapter_path: &Path) -> Result<Vec<Lesson>, String> {
          let mut lessons = Vec::new();

          for entry in std::fs::read_dir(chapter_path)
              .map_err(|e| e.to_string())?
          {
              let entry = entry.map_err(|e| e.to_string())?;
              let path = entry.path();

              if path.extension().map_or(false, |ext| ext == "md") {
                  let lesson = Self::parse_lesson_frontmatter(&path)?;
                  lessons.push(lesson);
              }
          }

          // Nach Dateiname sortieren (01-xxx.md, 02-xxx.md, ...)
          lessons.sort_by(|a, b| a.order.cmp(&b.order));

          Ok(lessons)
      }

      fn parse_lesson_frontmatter(path: &Path) -> Result<Lesson, String> {
          let content = std::fs::read_to_string(path)
              .map_err(|e| format!("Fehler: {}", e))?;

          // Frontmatter extrahieren (zwischen ---)
          let parts: Vec<&str> = content.splitn(3, "---").collect();
          if parts.len() < 3 {
              // Kein Frontmatter, Standard-Werte nutzen
              let filename = path.file_stem()
                  .and_then(|s| s.to_str())
                  .unwrap_or("Unbenannt");

              return Ok(Lesson {
                  id: filename.to_string(),
                  title: filename.to_string(),
                  order: 0,
                  estimated_time: 10,
                  path: path.to_path_buf(),
              });
          }

          let yaml_content = parts[1];
          let lesson: Lesson = serde_yaml::from_str(yaml_content)
              .map_err(|e| format!("Frontmatter-Fehler: {}", e))?;

          Ok(Lesson {
              path: path.to_path_buf(),
              ..lesson
          })
      }

      /// Listet alle verfügbaren Kurse auf
      pub fn list_courses(courses_dir: &Path) -> Vec<CourseMeta> {
          let mut courses = Vec::new();

          if let Ok(entries) = std::fs::read_dir(courses_dir) {
              for entry in entries.flatten() {
                  let path = entry.path();
                  if path.is_dir() {
                      if let Ok(course) = Self::load_course(&path) {
                          courses.push(course.meta);
                      }
                  }
              }
          }

          courses
      }
  }


  DATEI: src-tauri/src/models/course.rs
  ──────────────────────────────────────────────────────

  use serde::{Deserialize, Serialize};
  use std::path::PathBuf;

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct CourseMeta {
      pub id: String,
      pub title: String,
      pub description: String,
      pub author: Option<String>,
      pub version: Option<String>,
      pub language: Option<String>,
      pub difficulty: Option<String>,  // "beginner", "intermediate", "advanced"
      pub tags: Option<Vec<String>>,
      pub cover_image: Option<String>,
  }

  #[derive(Debug, Clone, Serialize)]
  pub struct Course {
      pub id: String,
      pub meta: CourseMeta,
      pub chapters: Vec<Chapter>,
      #[serde(skip)]
      pub path: PathBuf,
  }

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct Chapter {
      pub id: String,
      pub title: String,
      pub description: Option<String>,
      pub order: i32,
      #[serde(default)]
      pub lessons: Vec<Lesson>,
      #[serde(skip)]
      pub path: PathBuf,
  }

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct Lesson {
      pub id: String,
      pub title: String,
      pub order: i32,
      #[serde(default = "default_time")]
      pub estimated_time: i32,  // Minuten
      #[serde(skip)]
      pub path: PathBuf,
  }

  fn default_time() -> i32 { 10 }


  DATEI: src-tauri/src/commands/course_commands.rs
  ──────────────────────────────────────────────────────

  use crate::models::course::{Course, CourseMeta};
  use crate::services::course_service::CourseService;
  use crate::AppState;
  use std::path::PathBuf;
  use tauri::State;

  #[tauri::command]
  pub fn list_courses(state: State<AppState>) -> Vec<CourseMeta> {
      let courses_dir = state.courses_dir.clone();
      CourseService::list_courses(&courses_dir)
  }

  #[tauri::command]
  pub fn load_course(path: String) -> Result<Course, String> {
      let path = PathBuf::from(path);
      CourseService::load_course(&path)
  }

  #[tauri::command]
  pub fn get_lesson_content(
      course_path: String,
      lesson_id: String,
  ) -> Result<String, String> {
      let course = CourseService::load_course(&PathBuf::from(&course_path))?;

      for chapter in &course.chapters {
          for lesson in &chapter.lessons {
              if lesson.id == lesson_id {
                  return std::fs::read_to_string(&lesson.path)
                      .map_err(|e| format!("Fehler: {}", e));
              }
          }
      }

      Err("Lektion nicht gefunden".to_string())
  }


  DATEI: src-tauri/src/commands/progress_commands.rs
  ──────────────────────────────────────────────────────

  use crate::models::progress::{LessonProgress, CourseProgress};
  use crate::services::progress_service::ProgressService;
  use crate::AppState;
  use tauri::State;

  #[tauri::command]
  pub fn get_progress(
      state: State<AppState>,
      course_id: String,
  ) -> CourseProgress {
      let db = state.db.lock().unwrap();
      ProgressService::get_course_progress(&db, &course_id)
  }

  #[tauri::command]
  pub fn save_progress(
      state: State<AppState>,
      course_id: String,
      progress: LessonProgress,
  ) -> Result<(), String> {
      let db = state.db.lock().unwrap();
      ProgressService::save_lesson_progress(&db, &course_id, &progress)
          .map_err(|e| e.to_string())
  }

  #[tauri::command]
  pub fn get_lesson_progress(
      state: State<AppState>,
      course_id: String,
      lesson_id: String,
  ) -> Option<LessonProgress> {
      let db = state.db.lock().unwrap();
      ProgressService::get_lesson_progress(&db, &course_id, &lesson_id)
  }
