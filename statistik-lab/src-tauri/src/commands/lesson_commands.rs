use tauri::{command, State};
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
