use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct LessonProgress {
    pub lesson_id: String,
    pub completed: bool,
    pub score: i32,
    pub time_spent: i32,
    pub last_accessed: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct CourseProgress {
    pub course_id: String,
    pub total_lessons: i32,
    pub completed_lessons: i32,
    pub total_score: i32,
    pub total_time: i32,
}
