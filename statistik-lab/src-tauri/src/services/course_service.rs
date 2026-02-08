use tauri::AppHandle;
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
