use tauri::command;

#[command]
pub fn search_content(_query: String) -> Vec<String> { vec![] }
