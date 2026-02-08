import os

files = {
    "Cargo.toml": """[package]
name = "statistik-lab"
version = "0.1.0"
edition = "2021"

[lib]
name = "statistik_lab_lib"
crate-type = ["lib", "cdylib", "staticlib"]

[build-dependencies]
tauri-build = "2.0.3"

[dependencies]
tauri = { version = "2.1.1", features = [] }
tauri-plugin-shell = "2.0.1"
tauri-plugin-opener = "2.0.1"
tauri-plugin-dialog = "2.0.1"
tauri-plugin-fs = "2.0.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.31.0", features = ["bundled"] }
log = "0.4"
env_logger = "0.11"
directories = "5.0"
uuid = { version = "1.8", features = ["v4"] }
""",
    "src/lib.rs": """use std::sync::Mutex;
use tauri::Manager;
use crate::db::connection::Database;

pub mod commands;
pub mod db;
pub mod models;
pub mod services;
pub mod utils;

pub struct AppState {
    pub db: Mutex<Database>,
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dirs = directories::ProjectDirs::from("com", "statistiklab", "StatistikLab")
                .expect("Konnte App-Verzeichnisse nicht bestimmen");
            let data_dir = app_dirs.data_dir();
            std::fs::create_dir_all(data_dir).ok();
            
            let db_path = data_dir.join("statistiklab.db");
            let db = Database::new(&db_path).expect("Datenbank-Initialisierung fehlgeschlagen");
            
            app.manage(AppState {
                db: Mutex::new(db),
            });

            // Initialisiere Services
            services::course_service::init_default_courses(app.handle().clone())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::course_commands::list_courses,
            commands::course_commands::load_course,
            commands::course_commands::get_course_path,
            commands::lesson_commands::get_lesson,
            commands::lesson_commands::save_lesson_progress,
            commands::progress_commands::get_user_progress,
            commands::progress_commands::update_user_progress,
            commands::progress_commands::reset_progress,
            commands::settings_commands::get_settings,
            commands::settings_commands::save_settings,
            commands::export_commands::export_results,
            commands::dataset_commands::list_datasets,
            commands::dataset_commands::load_dataset,
            commands::search_commands::search_content,
            commands::achievement_commands::list_achievements,
            commands::achievement_commands::check_achievements,
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten der Tauri-Anwendung");
}
""",
    "src/commands/mod.rs": "pub mod course_commands;\npub mod lesson_commands;\npub mod progress_commands;\npub mod settings_commands;\npub mod export_commands;\npub mod dataset_commands;\npub mod search_commands;\npub mod achievement_commands;\n",
    "src/commands/course_commands.rs": """use tauri::{command, AppHandle};
use crate::services::course_service;

#[command]
pub fn list_courses(app: AppHandle) -> Vec<String> {
    course_service::list_courses(&app)
}

#[command]
pub fn load_course(_id: String) -> Result<(), String> { Ok(()) }

#[command]
pub fn get_course_path(_id: String) -> String { String::new() }
""",
    "src/commands/lesson_commands.rs": """use tauri::{command, State};
use crate::AppState;
use std::fs;

#[command]
pub fn get_lesson(_state: State<AppState>, course_id: String, lesson_id: String) -> Result<String, String> {
    let app_dirs = directories::ProjectDirs::from("com", "statistiklab", "StatistikLab").unwrap();
    let courses_dir = app_dirs.data_dir().join("courses");
    let lesson_path = courses_dir.join(course_id).join(format!("{}.md", lesson_id));
    
    if !lesson_path.exists() {
        return Err("Lektion nicht gefunden".to_string());
    }
    
    fs::read_to_string(lesson_path).map_err(|e| e.to_string())
}

#[command]
pub fn save_lesson_progress(_lesson_id: String, _completed: bool) -> Result<(), String> { Ok(()) }
""",
    "src/commands/progress_commands.rs": """use tauri::{command, State};
use crate::AppState;
use crate::services::progress_service::ProgressService;

#[command]
pub fn get_user_progress(state: State<AppState>, course_id: String) -> Result<String, String> {
    let db = state.db.lock().map_err(|_| "DB Lock failed")?;
    let progress = ProgressService::get_course_progress(&db, &course_id);
    serde_json::to_string(&progress).map_err(|e| e.to_string())
}

#[command]
pub fn update_user_progress(_progress_data: String) -> Result<(), String> { Ok(()) }

#[command]
pub fn reset_progress() -> Result<(), String> { Ok(()) }
""",
    "src/commands/settings_commands.rs": """use tauri::{command, State};
use crate::AppState;

#[command]
pub fn get_settings(state: State<AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|_| "DB Lock failed")?;
    let conn = db.connection();
    let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = 'app_settings'").map_err(|e| e.to_string())?;
    let settings: String = stmt.query_row([], |row| row.get(0)).unwrap_or_else(|_| "{}".to_string());
    Ok(settings)
}

#[command]
pub fn save_settings(state: State<AppState>, settings: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "DB Lock failed")?;
    let conn = db.connection();
    conn.execute(
        "INSERT INTO settings (key, value) VALUES ('app_settings', ?1)
         ON CONFLICT(key) DO UPDATE SET value = ?1",
        [settings],
    ).map_err(|e| e.to_string())?;
    Ok(())
}
""",
    "src/commands/export_commands.rs": "use tauri::command;\n\n#[command]\npub fn export_results(_format: String, _data: String) -> Result<(), String> { Ok(()) }\n",
    "src/commands/dataset_commands.rs": "use tauri::command;\n\n#[command]\npub fn list_datasets() -> Vec<String> { vec![] }\n#[command]\npub fn load_dataset(_name: String) -> Result<String, String> { Ok(String::new()) }\n",
    "src/commands/search_commands.rs": "use tauri::command;\n\n#[command]\npub fn search_content(_query: String) -> Vec<String> { vec![] }\n",
    "src/commands/achievement_commands.rs": "use tauri::command;\n\n#[command]\npub fn list_achievements() -> Vec<String> { vec![] }\n#[command]\npub fn check_achievements() -> Result<Vec<String>, String> { Ok(vec![]) }\n",
    "src/db/mod.rs": "pub mod connection;\npub mod migrations;\n",
    "src/db/connection.rs": """use rusqlite::Connection;
use std::path::Path;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(path: &Path) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(path)?;
        let db = Database { conn };
        db.run_migrations()?;
        Ok(db)
    }

    pub fn connection(&self) -> &Connection {
        &self.conn
    }

    fn run_migrations(&self) -> Result<(), rusqlite::Error> {
        super::migrations::run_migrations(&self.conn)
    }
}
""",
    "src/db/migrations.rs": """use rusqlite::Connection;

pub const MIGRATIONS: &[(&str, &str)] = &[
    ("001_initial", include_str!("../sql/001_initial.sql")),
];

pub fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id TEXT PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    for (id, sql) in MIGRATIONS {
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM _migrations WHERE id = ?",
            [id],
            |row| row.get(0),
        )?;

        if count == 0 {
            conn.execute_batch(sql)?;
            conn.execute("INSERT INTO _migrations (id) VALUES (?)", [id])?;
        }
    }

    Ok(())
}
""",
    "src/models/mod.rs": "pub mod progress;\n",
    "src/models/progress.rs": """use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct LessonProgress {
    pub lesson_id: String,
    pub completed: bool,
    pub score: i32,
    pub time_spent: i32,
    pub last_accessed: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct CourseProgress {
    pub course_id: String,
    pub total_lessons: i32,
    pub completed_lessons: i32,
    pub total_score: i32,
    pub total_time: i32,
}
""",
    "src/services/mod.rs": "pub mod course_service;\npub mod progress_service;\n",
    "src/services/course_service.rs": """use tauri::AppHandle;
use std::fs;

pub fn init_default_courses(_app: AppHandle) -> Result<(), String> {
    let app_dirs = directories::ProjectDirs::from("com", "statistiklab", "StatistikLab")
        .expect("Konnte App-Verzeichnisse nicht bestimmen");
    let data_dir = app_dirs.data_dir();
    let courses_dir = data_dir.join("courses");
    
    if !courses_dir.exists() {
        fs::create_dir_all(&courses_dir).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

pub fn list_courses(_app: &AppHandle) -> Vec<String> {
    let app_dirs = directories::ProjectDirs::from("com", "statistiklab", "StatistikLab").unwrap();
    let courses_dir = app_dirs.data_dir().join("courses");
    
    let mut courses = Vec::new();
    if let Ok(entries) = fs::read_dir(courses_dir) {
        for entry in entries.flatten() {
            if entry.path().is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    courses.push(name.to_string());
                }
            }
        }
    }
    courses
}
""",
    "src/services/progress_service.rs": """use crate::db::connection::Database;
use crate::models::progress::{LessonProgress, CourseProgress};
use rusqlite::params;

pub struct ProgressService;

impl ProgressService {
    pub fn get_course_progress(db: &Database, course_id: &str) -> CourseProgress {
        let conn = db.connection();
        let mut stmt = conn
            .prepare("SELECT COUNT(*), SUM(completed), SUM(score), SUM(time_spent) FROM user_progress WHERE course_id = ?")
            .unwrap();

        stmt.query_row(params![course_id], |row| {
            Ok(CourseProgress {
                course_id: course_id.to_string(),
                total_lessons: row.get(0).unwrap_or(0),
                completed_lessons: row.get::<_, Option<i32>>(1).unwrap_or(Some(0)).unwrap_or(0),
                total_score: row.get::<_, Option<i32>>(2).unwrap_or(Some(0)).unwrap_or(0),
                total_time: row.get::<_, Option<i32>>(3).unwrap_or(Some(0)).unwrap_or(0),
            })
        })
        .unwrap_or_else(|_| CourseProgress {
            course_id: course_id.to_string(),
            ..Default::default()
        })
    }
}
""",
    "src/utils/mod.rs": "// Utils placeholder\n",
}

for path, content in files.items():
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.replace("\\r\\n", "\\n"))
