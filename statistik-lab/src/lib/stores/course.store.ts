import { writable } from 'svelte/store';
import type { CourseMeta, Lesson } from '../types/course';

interface CourseState {
    currentCourse: CourseMeta | null;
    activeLessonId: string | null;
    activeLesson: Lesson | null;
    loading: boolean;
    error: string | null;
}

function createCourseStore() {
    const { subscribe, set, update } = writable<CourseState>({
        currentCourse: null,
        activeLessonId: null,
        activeLesson: null,
        loading: false,
        error: null,
    });

    return {
        subscribe,
        setCourse: (course: CourseMeta) => update(s => ({ ...s, currentCourse: course })),
        setActiveLesson: (courseId: string, lessonId: string) => {
            update(s => ({ ...s, activeLessonId: lessonId, loading: true }));
            // Logic to load lesson content would go here
        },
        setLoading: (loading: boolean) => update(s => ({ ...s, loading })),
        setError: (error: string | null) => update(s => ({ ...s, error })),
    };
}

export const courseStore = createCourseStore();
