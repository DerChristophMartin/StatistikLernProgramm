export type CellType = 'markdown' | 'code' | 'exercise' | 'quiz' | 'widget' | 'hint' | 'info';

export interface BaseCell {
    id: string;
    type: CellType;
    order: number;
}

export interface MarkdownCell extends BaseCell {
    type: 'markdown';
    content: string; // HTML-Content
}

export interface CodeCell extends BaseCell {
    type: 'code';
    code: string;
    language: string;
    interactive: boolean;
    output?: ExecutionOutput;
}

export interface ExerciseCell extends BaseCell {
    type: 'exercise';
    instruction: string;
    templateCode: string;
    solutionCode: string;
    hint?: string;
    completed: boolean;
    output?: ExecutionOutput;
}

export interface QuizCell extends BaseCell {
    type: 'quiz';
    question: string;
    options: QuizOption[];
    explanation: string;
    multiSelect: boolean;
    answered: boolean;
    correct: boolean;
}

export interface QuizOption {
    text: string;
    correct: boolean;
    selected: boolean;
}

export interface WidgetCell extends BaseCell {
    type: 'widget';
    widgetType: 'normal-distribution' | 'regression' | 'histogram' | 'custom';
    parameters: WidgetParameter[];
    code: string; // Python-Code mit Platzhaltern
}

export interface WidgetParameter {
    name: string;
    label: string;
    type: 'slider' | 'select' | 'number';
    min?: number;
    max?: number;
    step?: number;
    value: number | string;
    options?: string[];
}

export interface HintCell extends BaseCell {
    type: 'hint';
    title: string;
    content: string; // HTML
    expanded: boolean;
}

export interface InfoCell extends BaseCell {
    type: 'info';
    variant: 'info' | 'warning' | 'tip' | 'important';
    title: string;
    content: string; // HTML
}

export interface ExecutionOutput {
    stdout: string;
    stderr: string;
    result: string | null;
    plots: string[];
    executionTime: number;
    timestamp: number;
}

export type Cell = MarkdownCell | CodeCell | ExerciseCell | QuizCell | WidgetCell | HintCell | InfoCell;

export interface OutputSegment {
    type: 'text' | 'error' | 'plot';
    content: string;
}
