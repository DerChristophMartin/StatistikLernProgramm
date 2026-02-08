import { writable } from 'svelte/store';
import type { Cell, ExecutionOutput } from '../types/cells';
import { parseLesson } from '../parser/markdown-parser';
import { invoke } from '@tauri-apps/api/core';

interface LessonState {
    lessonId: string | null;
    cells: Cell[];
    isLoading: boolean;
    error: string | null;
}

function createLessonStore() {
    const { subscribe, set, update } = writable<LessonState>({
        lessonId: null,
        cells: [],
        isLoading: false,
        error: null,
    });

    return {
        subscribe,
        async load(courseId: string, lessonId: string) {
            update(s => ({ ...s, isLoading: true, error: null }));
            try {
                // In einer echten App würde hier Tauri aufgerufen werden
                // const rawContent = await invoke<string>('get_lesson', { courseId, lessonId });

                // Mocking for now to allow UI development
                const mockContent = `---
title: Einführung in Python
description: Lerne die Grundlagen von Python für die Statistik.
---
# Willkommen zum StatistikLab

In dieser Lektion lernst du die ersten Schritte.

\`\`\`python {interactive}
print("Hallo StatistikLab!")
x = 5 + 10
print(f"Ergebnis: {x}")
\`\`\`

Und hier ist ein Quiz:

::quiz
? Was ist der Durchschnitt von [1, 2, 3]?
- [ ] 1
- [ ] 2.5
- [x] 2
! Der Durchschnitt ist (1+2+3)/3 = 6/3 = 2.
::
`;
                const cells = parseLesson(mockContent);

                setTimeout(() => {
                    set({
                        lessonId,
                        cells,
                        isLoading: false,
                        error: null,
                    });
                }, 500);
            } catch (e: any) {
                update(s => ({ ...s, isLoading: false, error: e.message || 'Lektion laden fehlgeschlagen' }));
            }
        },
        setCellOutput(cellId: string, output: ExecutionOutput) {
            update(s => ({
                ...s,
                cells: s.cells.map(c => c.id === cellId && (c.type === 'code' || c.type === 'exercise') ? { ...c, output } : c)
            }));
        }
    };
}

export const lessonStore = createLessonStore();
