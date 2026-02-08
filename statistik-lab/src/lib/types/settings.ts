export interface AppSettings {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
    accentColor: string;
    tabSize: number;
    showLineNumbers: boolean;
    autoComplete: boolean;
    wordWrap: boolean;
    autoStartPython: boolean;
    pythonCachePath: string;
    sendCrashReports: boolean;
    sendUsageStats: boolean;
    autoSaveInterval: number;
    backupEnabled: boolean;
    coursesDirectory: string;
    lastOpenedCourse: string | null;
}

export const defaultSettings: AppSettings = {
    theme: 'auto',
    fontSize: 'medium',
    fontFamily: 'Inter',
    accentColor: '#6366F1',
    tabSize: 4,
    showLineNumbers: true,
    autoComplete: true,
    wordWrap: false,
    autoStartPython: true,
    pythonCachePath: '',
    sendCrashReports: false,
    sendUsageStats: false,
    autoSaveInterval: 30,
    backupEnabled: true,
    coursesDirectory: '',
    lastOpenedCourse: null,
};
