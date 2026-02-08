import { writable } from 'svelte/store';

interface ProgressState {
    completedLessons: Set<string>;
    activeStreaks: number;
    lastActiveDate: string | null;
    overallPercent: number;
}

function createProgressStore() {
    const { subscribe, set, update } = writable<ProgressState>({
        completedLessons: new Set(),
        activeStreaks: 0,
        lastActiveDate: null,
        overallPercent: 0,
    });

    return {
        subscribe,
        markComplete: (lessonId: string) => update(s => {
            const completed = new Set(s.completedLessons);
            completed.add(lessonId);
            // Recalculate percent logic would go here
            return { ...s, completedLessons: completed };
        }),
        initProgress: (data: any) => {
            set({
                completedLessons: new Set(data.completed_lessons || []),
                activeStreaks: data.streak || 0,
                lastActiveDate: data.last_date || null,
                overallPercent: data.percent || 0,
            });
        }
    };
}

export const progressStore = createProgressStore();
