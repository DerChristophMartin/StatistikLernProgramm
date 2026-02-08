━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
22. API-REFERENZ (RUST ↔ FRONTEND)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Alle Kommunikation zwischen Frontend (Svelte) und Backend (Rust)
  erfolgt über Tauri Commands. Diese werden via `invoke()` aufgerufen.


  COMMAND-KATEGORIEN
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬─────────────────────────────────────────────────────┐
  │ Kategorie           │ Commands                                             │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ Kurse               │ list_courses, load_course, get_lesson_content       │
  │ Fortschritt         │ get_progress, save_progress, get_lesson_progress    │
  │ Achievements        │ get_achievements, unlock_achievement                │
  │ Einstellungen       │ get_settings, save_settings                         │
  │ Export              │ export_pdf, export_html                             │
  │ Datensätze          │ import_dataset, list_datasets, delete_dataset       │
  │ Editor              │ create_course, create_chapter, create_lesson, save  │
  │ System              │ get_app_data_dir, check_updates, restart            │
  └─────────────────────┴─────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════
  KURS-COMMANDS
  ═══════════════════════════════════════════════════════

  ▸ list_courses()
  ──────────────────────────────────────────────────────
  Listet alle verfügbaren Kurse auf.

  Request:  (keine Parameter)
  Response: CourseMeta[]

  interface CourseMeta {
    id: string;
    title: string;
    description: string;
    author?: string;
    version?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    cover_image?: string;
    path: string;
  }

  Beispiel:
    const courses = await invoke<CourseMeta[]>('list_courses');


  ▸ load_course(path: string)
  ──────────────────────────────────────────────────────
  Lädt die vollständige Kursstruktur.

  Request:  { path: "/path/to/course" }
  Response: Course

  interface Course {
    id: string;
    meta: CourseMeta;
    chapters: Chapter[];
  }

  interface Chapter {
    id: string;
    title: string;
    description?: string;
    order: number;
    lessons: Lesson[];
  }

  interface Lesson {
    id: string;
    title: string;
    order: number;
    estimated_time: number;
    path: string;
  }


  ▸ get_lesson_content(coursePath: string, lessonId: string)
  ──────────────────────────────────────────────────────
  Lädt den Markdown-Inhalt einer Lektion.

  Request:  { coursePath: string, lessonId: string }
  Response: string (Markdown-Inhalt)


  ═══════════════════════════════════════════════════════
  FORTSCHRITT-COMMANDS
  ═══════════════════════════════════════════════════════

  ▸ get_progress(courseId: string)
  ──────────────────────────────────────────────────────
  Holt den aggregierten Kursfortschritt.

  Request:  { courseId: string }
  Response: CourseProgress

  interface CourseProgress {
    courseId: string;
    totalLessons: number;
    completedLessons: number;
    totalScore: number;
    totalTime: number;  // Sekunden
  }


  ▸ get_lesson_progress(courseId: string, lessonId: string)
  ──────────────────────────────────────────────────────
  Holt den Fortschritt einer einzelnen Lektion.

  Request:  { courseId: string, lessonId: string }
  Response: LessonProgress | null

  interface LessonProgress {
    lessonId: string;
    completed: boolean;
    score: number;
    timeSpent: number;
    lastAccessed?: string;
  }


  ▸ save_progress(courseId: string, progress: LessonProgress)
  ──────────────────────────────────────────────────────
  Speichert den Fortschritt einer Lektion.

  Request:  { courseId: string, progress: LessonProgress }
  Response: void


  ═══════════════════════════════════════════════════════
  ACHIEVEMENT-COMMANDS
  ═══════════════════════════════════════════════════════

  ▸ get_achievements()
  ──────────────────────────────────────────────────────
  Holt alle Achievements mit aktuellem Fortschritt.

  Response: Achievement[]

  interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'milestone' | 'streak' | 'skill' | 'exploration' | 'perfection';
    requirement: number;
    currentProgress: number;
    unlocked: boolean;
    unlockedAt?: string;
  }


  ▸ increment_achievement(id: string, amount: number)
  ──────────────────────────────────────────────────────
  Erhöht den Fortschritt eines Achievements.
  Gibt das Achievement zurück falls es gerade freigeschaltet wurde.

  Request:  { id: string, amount: number }
  Response: Achievement | null


  ═══════════════════════════════════════════════════════
  EINSTELLUNGEN-COMMANDS
  ═══════════════════════════════════════════════════════

  ▸ get_settings()
  ──────────────────────────────────────────────────────
  Lädt alle App-Einstellungen.

  Response: AppSettings

  interface AppSettings {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    accentColor: string;
    showLineNumbers: boolean;
    autoComplete: boolean;
    tabSize: number;
    autoStartPython: boolean;
    autoSaveInterval: number;
    coursesDirectory: string;
    // ... weitere
  }


  ▸ save_settings(settings: Partial<AppSettings>)
  ──────────────────────────────────────────────────────
  Speichert (Teil-)Einstellungen.

  Request:  { settings: Partial<AppSettings> }
  Response: void


  ═══════════════════════════════════════════════════════
  EXPORT-COMMANDS
  ═══════════════════════════════════════════════════════

  ▸ export_lesson(lessonPath: string, options: ExportOptions)
  ──────────────────────────────────────────────────────
  Exportiert eine Lektion als PDF oder HTML.

  interface ExportOptions {
    format: 'Pdf' | 'Html';
    theme: 'light' | 'dark' | 'print';
    includeCode: boolean;
    includeOutput: boolean;
    includeSolutions: boolean;
    pageSize: 'A4' | 'Letter';
    generateToc: boolean;
  }

  Response: string (Pfad zur exportierten Datei)


  ═══════════════════════════════════════════════════════
  DATENSATZ-COMMANDS
  ═══════════════════════════════════════════════════════

  ▸ import_dataset(filePath: string)
  ──────────────────────────────────────────────────────
  Importiert einen Datensatz (CSV, JSON, Excel).

  Request:  { filePath: string }
  Response: Dataset

  interface Dataset {
    id: number;
    name: string;
    filePath: string;
    fileSize: number;
    rowCount: number;
    columnCount: number;
    columns: ColumnInfo[];
    preview: Record<string, any>[];
  }

  interface ColumnInfo {
    name: string;
    dtype: 'int' | 'float' | 'string' | 'bool' | 'datetime';
  }


  ▸ list_datasets()
  ──────────────────────────────────────────────────────
  Response: Dataset[]


  ▸ delete_dataset(id: number)
  ──────────────────────────────────────────────────────
  Response: void


  ═══════════════════════════════════════════════════════
  SYSTEM-COMMANDS
  ═══════════════════════════════════════════════════════

  ▸ get_app_data_dir()
  ──────────────────────────────────────────────────────
  Gibt den App-Datenordner zurück.

  Response: string  (z.B. "C:\Users\X\AppData\Local\StatistikLab")


  ▸ get_courses_dir()
  ──────────────────────────────────────────────────────
  Response: string  (Standard-Kursverzeichnis)


  ═══════════════════════════════════════════════════════
  FRONTEND WRAPPER (TypeScript)
  ═══════════════════════════════════════════════════════

  // src/lib/tauri/commands.ts

  import { invoke } from '@tauri-apps/api/core';
  import type { 
    CourseMeta, Course, LessonProgress, CourseProgress,
    Achievement, AppSettings, ExportOptions, Dataset 
  } from '$lib/types';

  export const api = {
    // Kurse
    listCourses: () => 
      invoke<CourseMeta[]>('list_courses'),

    loadCourse: (path: string) => 
      invoke<Course>('load_course', { path }),

    getLessonContent: (coursePath: string, lessonId: string) =>
      invoke<string>('get_lesson_content', { coursePath, lessonId }),

    // Fortschritt
    getProgress: (courseId: string) =>
      invoke<CourseProgress>('get_progress', { courseId }),

    getLessonProgress: (courseId: string, lessonId: string) =>
      invoke<LessonProgress | null>('get_lesson_progress', { courseId, lessonId }),

    saveProgress: (courseId: string, progress: LessonProgress) =>
      invoke('save_progress', { courseId, progress }),

    // Achievements
    getAchievements: () =>
      invoke<Achievement[]>('get_achievements'),

    incrementAchievement: (id: string, amount = 1) =>
      invoke<Achievement | null>('increment_achievement', { id, amount }),

    // Settings
    getSettings: () =>
      invoke<AppSettings>('get_settings'),

    saveSettings: (settings: Partial<AppSettings>) =>
      invoke('save_settings', { settings }),

    // Export
    exportLesson: (lessonPath: string, options: ExportOptions) =>
      invoke<string>('export_lesson', { lessonPath, options }),

    // Datasets
    importDataset: (filePath: string) =>
      invoke<Dataset>('import_dataset', { filePath }),

    listDatasets: () =>
      invoke<Dataset[]>('list_datasets'),

    deleteDataset: (id: number) =>
      invoke('delete_dataset', { id }),

    // System
    getAppDataDir: () =>
      invoke<string>('get_app_data_dir'),
  };
