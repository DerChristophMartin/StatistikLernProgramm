import type { Cell } from './cells';

export interface CourseMeta {
    id: string;
    title: string;
    description: string;
    author: string;
    version: string;
    language: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    estimatedHours: number;
    coverImage?: string;
    chapters: ChapterMeta[];
}

export interface ChapterMeta {
    id: string;
    title: string;
    description: string;
    order: number;
    icon?: string;
    lessons: LessonMeta[];
}

export interface LessonMeta {
    id: string;
    title: string;
    order: number;
    estimatedMinutes: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    filePath: string;
    prerequisites?: string[];
}

export interface Lesson {
    meta: LessonMeta;
    cells: Cell[];
    rawContent: string;
}
