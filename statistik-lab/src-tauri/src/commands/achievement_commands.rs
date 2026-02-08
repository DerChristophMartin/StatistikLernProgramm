use tauri::command;

#[command]
pub fn list_achievements() -> Vec<String> { vec![] }
#[command]
pub fn check_achievements() -> Result<Vec<String>, String> { Ok(vec![]) }
