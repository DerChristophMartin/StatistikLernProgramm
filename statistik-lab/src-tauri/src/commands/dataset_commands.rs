use tauri::command;

#[command]
pub fn list_datasets() -> Vec<String> { vec![] }
#[command]
pub fn load_dataset(_name: String) -> Result<String, String> { Ok(String::new()) }
