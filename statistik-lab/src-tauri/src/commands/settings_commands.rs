use tauri::{command, State};
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
