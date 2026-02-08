use rusqlite::Connection;

pub const MIGRATIONS: &[(&str, &str)] = &[
    ("001_initial", include_str!("../sql/001_initial.sql")),
];

pub fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id TEXT PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    for (id, sql) in MIGRATIONS {
        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM _migrations WHERE id = ?",
            [id],
            |row| row.get(0),
        )?;

        if count == 0 {
            conn.execute_batch(sql)?;
            conn.execute("INSERT INTO _migrations (id) VALUES (?)", [id])?;
        }
    }

    Ok(())
}
