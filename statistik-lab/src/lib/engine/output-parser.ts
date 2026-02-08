export interface ParsedOutput {
    segments: OutputSegment[];
}

export type OutputSegment =
    | { type: 'text'; content: string }
    | { type: 'html'; content: string }
    | { type: 'plot'; src: string }
    | { type: 'error'; content: string };

export function parseOutput(
    stdout: string,
    stderr: string,
    plots: string[],
    error: string | null = null
): ParsedOutput {
    const segments: OutputSegment[] = [];

    if (error) {
        segments.push({
            type: 'error',
            content: error,
        });
        return { segments };
    }

    if (stdout) {
        // Pandas HTML Tabellen Erkennung (einfach)
        if (stdout.includes('<table')) {
            segments.push({ type: 'html', content: stdout });
        } else {
            segments.push({ type: 'text', content: stdout });
        }
    }

    for (const plotB64 of plots) {
        segments.push({
            type: 'plot',
            src: `data:image/png;base64,${plotB64}`,
        });
    }

    if (stderr) {
        segments.push({
            type: 'error',
            content: stderr,
        });
    }

    return { segments };
}
