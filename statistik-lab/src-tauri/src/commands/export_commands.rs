use tauri::command;

#[command]
pub fn export_results(_format: String, _data: String) -> Result<(), String> { Ok(()) }
