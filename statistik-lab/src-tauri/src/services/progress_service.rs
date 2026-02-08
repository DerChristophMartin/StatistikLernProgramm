use crate::db::connection::Database;
use crate::models::progress::{LessonProgress, CourseProgress};
use rusqlite::params;

pub struct ProgressService;

impl ProgressService {
    pub fn get_course_progress(db: &Database, course_id: &str) -> CourseProgress {
        let conn = db.connection();
        let mut stmt = conn
            .prepare("SELECT COUNT(*), SUM(completed), SUM(score), SUM(time_spent) FROM user_progress WHERE course_id = ?")
            .unwrap();

        stmt.query_row(params![course_id], |row| {
            Ok(CourseProgress {
                course_id: course_id.to_string(),
                total_lessons: row.get(0).unwrap_or(0),
                completed_lessons: row.get::<_, Option<i32>>(1).unwrap_or(Some(0)).unwrap_or(0),
                total_score: row.get::<_, Option<i32>>(2).unwrap_or(Some(0)).unwrap_or(0),
                total_time: row.get::<_, Option<i32>>(3).unwrap_or(Some(0)).unwrap_or(0),
            })
        })
        .unwrap_or_else(|_| CourseProgress {
            course_id: course_id.to_string(),
            ..Default::default()
        })
    }
}
