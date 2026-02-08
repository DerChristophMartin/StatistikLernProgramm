use std::sync::Mutex;
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
