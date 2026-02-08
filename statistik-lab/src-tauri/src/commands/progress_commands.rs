use tauri::{command, State};
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
