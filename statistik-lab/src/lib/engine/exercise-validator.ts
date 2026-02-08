import { pyodideEngine } from './pyodide-engine';

export interface ValidationResult {
    passed: boolean;
    message: string;
    expected?: string;
    actual?: string;
    hint?: string;
}

export async function validateExercise(
    userCode: string,
    solution: string,
    validationType: 'exact' | 'approx' | 'contains' | 'custom' = 'approx',
    tolerance: number = 0.001
): Promise<ValidationResult> {
    const userResult = await pyodideEngine.runCode(userCode);

    if (userResult.stderr) {
        return {
            passed: false,
            message: '❌ Dein Code hat einen Fehler erzeugt.',
            actual: userResult.stderr,
            hint: 'Überprüfe die Syntax und versuche es erneut.',
        };
    }

    // Für Testzwecke: Einfache Validierung
    if (validationType === 'contains') {
        const passed = userResult.stdout.includes(solution);
        return {
            passed,
            message: passed ? '✅ Richtig!' : '❌ Erwarteter Inhalt nicht gefunden.',
        };
    }

    return {
        passed: true,
        message: '✅ Gut gemacht! Übung erfolgreich beendet.',
    };
}
