import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import type { Cell, CodeCell, ExerciseCell, QuizCell, WidgetCell, HintCell, InfoCell, MarkdownCell } from '../types/cells';
import { parseQuiz } from './quiz-parser';
import { parseFrontmatter } from './frontmatter';

// Markdown-It Instanz konfigurieren
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

// KaTeX Plugin für Matheformeln
md.use(texmath, {
    engine: katex,
    delimiters: 'dollars',
    katexOptions: {
        throwOnError: false,
        displayMode: false,
    },
});

// Einfache ID-Generierung
function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

/**
 * Parst eine Lektions-Datei (Markdown + Frontmatter) in Zellen.
 */
export function parseLesson(rawContent: string): Cell[] {
    const { content } = parseFrontmatter(rawContent);
    const segments = splitIntoSegments(content);
    const cells: Cell[] = [];
    let order = 0;

    for (const segment of segments) {
        order++;
        switch (segment.type) {
            case 'markdown':
                cells.push(createMarkdownCell(segment.content, order));
                break;
            case 'code-interactive':
                cells.push(createCodeCell(segment.content, order, true));
                break;
            case 'code-readonly':
                cells.push(createMarkdownCell('```python\n' + segment.content + '\n```', order));
                break;
            case 'exercise':
                cells.push(createExerciseCell(segment.content, segment.meta || {}, order));
                break;
            case 'quiz':
                cells.push(createQuizCell(segment.content, order));
                break;
            case 'widget':
                cells.push(createWidgetCell(segment.content, segment.meta || {}, order));
                break;
            case 'hint':
                cells.push(createHintCell(segment.content, segment.meta || {}, order));
                break;
            case 'info':
            case 'warning':
            case 'tip':
            case 'important':
                cells.push(createInfoCell(segment.content, segment.type, segment.meta || {}, order));
                break;
        }
    }

    return cells;
}

type SegmentType = 'markdown' | 'code-interactive' | 'code-readonly' | 'exercise' | 'quiz' | 'widget' | 'hint' | 'info' | 'warning' | 'tip' | 'important';

interface Segment {
    type: SegmentType;
    content: string;
    meta?: Record<string, string>;
}

function splitIntoSegments(content: string): Segment[] {
    const segments: Segment[] = [];
    const lines = content.split('\n');
    let currentMarkdown = '';
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Code-Block
        const codeMatch = line.match(/^```python\s*(\{.*\})?\s*$/);
        if (codeMatch) {
            if (currentMarkdown.trim()) {
                segments.push({ type: 'markdown', content: currentMarkdown.trim() });
                currentMarkdown = '';
            }
            const flags = codeMatch[1] || '';
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && lines[i].trim() !== '```') {
                codeLines.push(lines[i]);
                i++;
            }
            i++;
            const code = codeLines.join('\n');
            const meta = parseFlags(flags);
            if (flags.includes('exercise')) {
                segments.push({ type: 'exercise', content: code, meta });
            } else if (flags.includes('interactive') || flags.includes('run')) {
                segments.push({ type: 'code-interactive', content: code });
            } else {
                segments.push({ type: 'code-readonly', content: code });
            }
            continue;
        }

        // Quiz
        if (line.trim() === '::quiz') {
            if (currentMarkdown.trim()) {
                segments.push({ type: 'markdown', content: currentMarkdown.trim() });
                currentMarkdown = '';
            }
            const quizLines: string[] = [];
            i++;
            while (i < lines.length && lines[i].trim() !== '::') {
                quizLines.push(lines[i]);
                i++;
            }
            i++;
            segments.push({ type: 'quiz', content: quizLines.join('\n') });
            continue;
        }

        // Widget
        const widgetMatch = line.match(/^::widget\{(.+)\}\s*$/);
        if (widgetMatch) {
            if (currentMarkdown.trim()) {
                segments.push({ type: 'markdown', content: currentMarkdown.trim() });
                currentMarkdown = '';
            }
            const meta = parseFlags(`{${widgetMatch[1]}}`);
            const widgetLines: string[] = [];
            i++;
            while (i < lines.length && lines[i].trim() !== '::') {
                widgetLines.push(lines[i]);
                i++;
            }
            i++;
            segments.push({ type: 'widget', content: widgetLines.join('\n'), meta });
            continue;
        }

        // Containers
        const containerMatch = line.match(/^:::(hint|info|warning|tip|important)\s*(\{.*\})?\s*$/);
        if (containerMatch) {
            if (currentMarkdown.trim()) {
                segments.push({ type: 'markdown', content: currentMarkdown.trim() });
                currentMarkdown = '';
            }
            const containerType = containerMatch[1] as SegmentType;
            const meta = containerMatch[2] ? parseFlags(containerMatch[2]) : {};
            const containerLines: string[] = [];
            i++;
            while (i < lines.length && lines[i].trim() !== ':::') {
                containerLines.push(lines[i]);
                i++;
            }
            i++;
            segments.push({ type: containerType, content: containerLines.join('\n'), meta });
            continue;
        }

        currentMarkdown += line + '\n';
        i++;
    }

    if (currentMarkdown.trim()) {
        segments.push({ type: 'markdown', content: currentMarkdown.trim() });
    }
    return segments;
}

function parseFlags(flagStr: string): Record<string, string> {
    const meta: Record<string, string> = {};
    const matches = flagStr.matchAll(/(\w+)="([^"]*)"/g);
    for (const match of matches) {
        meta[match[1]] = match[2];
    }
    const simpleFlags = flagStr.matchAll(/\b(\w+)\b(?!=)/g);
    for (const match of simpleFlags) {
        if (!meta[match[1]]) {
            meta[match[1]] = 'true';
        }
    }
    return meta;
}

function createMarkdownCell(content: string, order: number): MarkdownCell {
    return {
        id: generateId(),
        type: 'markdown',
        order,
        content: md.render(content),
    };
}

function createCodeCell(code: string, order: number, interactive: boolean): CodeCell {
    return {
        id: generateId(),
        type: 'code',
        order,
        code,
        language: 'python',
        interactive,
    };
}

function createExerciseCell(code: string, meta: Record<string, string>, order: number): ExerciseCell {
    return {
        id: generateId(),
        type: 'exercise',
        order,
        instruction: meta.instruction || '',
        templateCode: code,
        solutionCode: meta.solution || '',
        completed: false,
    };
}

function createQuizCell(content: string, order: number): QuizCell {
    return parseQuiz(content, generateId(), order);
}

function createWidgetCell(content: string, meta: Record<string, string>, order: number): WidgetCell {
    return {
        id: generateId(),
        type: 'widget',
        widgetType: (meta.type as any) || 'custom',
        parameters: [], // Needs more complex parsing if defined in blocks
        code: content,
    };
}

function createHintCell(content: string, meta: Record<string, string>, order: number): HintCell {
    return {
        id: generateId(),
        type: 'hint',
        order,
        title: meta.title || 'Hinweis',
        content: md.render(content),
        expanded: false,
    };
}

function createCreateInfoCell(content: string, type: SegmentType, meta: Record<string, string>, order: number): InfoCell {
    return {
        id: generateId(),
        type: 'info',
        order,
        variant: type as any,
        title: meta.title || '',
        content: md.render(content),
    };
}

// Fixed function name to match usage in parseLesson
const createInfoCell = createCreateInfoCell;
