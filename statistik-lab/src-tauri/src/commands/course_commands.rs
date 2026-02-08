use tauri::{command, AppHandle};
use crate::services::course_service;

#[command]
pub fn list_courses(app: AppHandle) -> Vec<String> {
    course_service::list_courses(&app)
}

#[command]
pub fn load_course(_id: String) -> Result<(), String> { Ok(()) }

#[command]
pub fn get_course_path(_id: String) -> String { String::new() }
