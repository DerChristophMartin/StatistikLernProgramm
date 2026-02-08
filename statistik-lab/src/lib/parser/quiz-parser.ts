import type { QuizCell, QuizOption } from '../types/cells';

export function parseQuiz(content: string, id: string, order: number): QuizCell {
    const lines = content.split('\n');
    let question = '';
    const options: QuizOption[] = [];
    let explanation = '';

    let inExplanation = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('? ')) {
            question = trimmed.substring(2);
        } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
            const correct = trimmed.startsWith('- [x] ');
            options.push({
                text: trimmed.substring(6),
                correct,
                selected: false
            });
        } else if (trimmed.startsWith('! ')) {
            explanation = trimmed.substring(2);
            inExplanation = true;
        } else if (inExplanation) {
            explanation += ' ' + trimmed;
        }
    }

    return {
        id,
        type: 'quiz',
        order,
        question,
        options,
        explanation,
        multiSelect: options.filter(o => o.correct).length > 1,
        answered: false,
        correct: false
    };
}
