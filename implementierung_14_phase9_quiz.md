━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14. PHASE 9 — QUIZ-SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Das Quiz-System bietet verschiedene Fragetypen zur Wissensüberprüfung.
  Alle Quizzes werden in Markdown definiert und automatisch geparst.


  QUIZ-TYPEN
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬───────────────────────────────────────────────────┐
  │ Typ                 │ Beschreibung                                       │
  ├─────────────────────┼───────────────────────────────────────────────────┤
  │ multiple-choice     │ Eine richtige Antwort aus mehreren Optionen       │
  │ multiple-select     │ Mehrere richtige Antworten möglich                │
  │ true-false          │ Wahr/Falsch-Aussagen                               │
  │ fill-blank          │ Lückentext mit Validierung                        │
  │ numeric             │ Numerische Antwort mit Toleranz                   │
  │ code-output         │ Was gibt dieser Code aus?                          │
  └─────────────────────┴───────────────────────────────────────────────────┘


  MARKDOWN QUIZ-SYNTAX
  ──────────────────────────────────────────────────────

  ```quiz
  type: multiple-choice
  question: Welches Maß ist robust gegenüber Ausreißern?
  points: 10
  options:
    - text: Mittelwert
      correct: false
      feedback: Der Mittelwert wird stark von Ausreißern beeinflusst.
    - text: Median
      correct: true
      feedback: Richtig! Der Median ignoriert extreme Werte.
    - text: Varianz
      correct: false
      feedback: Die Varianz reagiert ebenfalls sensitiv auf Ausreißer.
  hint: Denke daran, wie jedes Maß berechnet wird.
  ```


  DATEI: src/lib/types/quiz.ts
  ──────────────────────────────────────────────────────

  export type QuizType = 
    | 'multiple-choice'
    | 'multiple-select'
    | 'true-false'
    | 'fill-blank'
    | 'numeric'
    | 'code-output';

  export interface QuizOption {
    text: string;
    correct: boolean;
    feedback?: string;
  }

  export interface QuizCell {
    type: 'quiz';
    id: string;
    quizType: QuizType;
    question: string;
    points: number;
    options?: QuizOption[];
    correctAnswer?: string | number;  // für fill-blank, numeric
    tolerance?: number;  // für numeric
    hint?: string;
    explanation?: string;
    // State
    answered: boolean;
    selectedOptions: number[];
    userAnswer?: string;
    isCorrect?: boolean;
    attempts: number;
  }


  DATEI: src/lib/components/lesson/QuizCell.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { QuizCell } from '$lib/types/quiz';

    export let cell: QuizCell;

    const dispatch = createEventDispatcher();

    let showHint = false;
    let showExplanation = false;

    function selectOption(index: number) {
      if (cell.answered) return;

      if (cell.quizType === 'multiple-select') {
        // Toggle selection
        const idx = cell.selectedOptions.indexOf(index);
        if (idx > -1) {
          cell.selectedOptions.splice(idx, 1);
        } else {
          cell.selectedOptions.push(index);
        }
        cell.selectedOptions = [...cell.selectedOptions];
      } else {
        cell.selectedOptions = [index];
      }
    }

    function submitAnswer() {
      cell.attempts++;

      if (cell.quizType === 'multiple-choice' || cell.quizType === 'true-false') {
        const selected = cell.selectedOptions[0];
        cell.isCorrect = cell.options![selected]?.correct === true;
      } else if (cell.quizType === 'multiple-select') {
        const correctIndices = cell.options!
          .map((opt, i) => opt.correct ? i : -1)
          .filter(i => i >= 0);
        const selected = [...cell.selectedOptions].sort();
        cell.isCorrect = JSON.stringify(selected) === JSON.stringify(correctIndices.sort());
      } else if (cell.quizType === 'numeric') {
        const userVal = parseFloat(cell.userAnswer || '');
        const correct = cell.correctAnswer as number;
        const tolerance = cell.tolerance || 0;
        cell.isCorrect = Math.abs(userVal - correct) <= tolerance;
      } else if (cell.quizType === 'fill-blank') {
        cell.isCorrect = cell.userAnswer?.toLowerCase().trim() === 
          (cell.correctAnswer as string).toLowerCase().trim();
      }

      cell.answered = true;
      showExplanation = true;

      dispatch('answered', {
        quizId: cell.id,
        correct: cell.isCorrect,
        points: cell.isCorrect ? cell.points : 0,
        attempts: cell.attempts,
      });
    }

    function retry() {
      cell.answered = false;
      cell.selectedOptions = [];
      cell.userAnswer = undefined;
      showExplanation = false;
    }
  </script>

  <div class="quiz-cell" class:correct={cell.answered && cell.isCorrect} 
       class:incorrect={cell.answered && !cell.isCorrect}>
    
    <!-- Question -->
    <div class="question">
      <span class="quiz-icon">❓</span>
      <span class="question-text">{@html cell.question}</span>
      <span class="points">{cell.points} Pkt.</span>
    </div>

    <!-- Options (für multiple-choice, multiple-select, true-false) -->
    {#if cell.options}
      <div class="options">
        {#each cell.options as option, index}
          <button
            class="option"
            class:selected={cell.selectedOptions.includes(index)}
            class:correct={cell.answered && option.correct}
            class:incorrect={cell.answered && cell.selectedOptions.includes(index) && !option.correct}
            disabled={cell.answered}
            on:click={() => selectOption(index)}
          >
            <span class="option-marker">
              {cell.quizType === 'multiple-select' ? '☐' : '○'}
            </span>
            <span class="option-text">{option.text}</span>
            {#if cell.answered && cell.selectedOptions.includes(index) && option.feedback}
              <span class="feedback">{option.feedback}</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    <!-- Numeric/Fill-blank Input -->
    {#if cell.quizType === 'numeric' || cell.quizType === 'fill-blank'}
      <div class="input-container">
        <input
          type={cell.quizType === 'numeric' ? 'number' : 'text'}
          bind:value={cell.userAnswer}
          placeholder={cell.quizType === 'numeric' ? 'Deine Antwort...' : 'Antwort eingeben...'}
          disabled={cell.answered}
        />
      </div>
    {/if}

    <!-- Actions -->
    <div class="actions">
      {#if !cell.answered}
        {#if cell.hint && !showHint}
          <button class="hint-btn" on:click={() => showHint = true}>
            💡 Hinweis
          </button>
        {/if}
        <button 
          class="submit-btn" 
          on:click={submitAnswer}
          disabled={cell.selectedOptions.length === 0 && !cell.userAnswer}
        >
          Antwort prüfen
        </button>
      {:else}
        {#if !cell.isCorrect}
          <button class="retry-btn" on:click={retry}>
            🔄 Nochmal versuchen
          </button>
        {/if}
      {/if}
    </div>

    <!-- Hint -->
    {#if showHint && cell.hint}
      <div class="hint-box">
        💡 {cell.hint}
      </div>
    {/if}

    <!-- Result & Explanation -->
    {#if cell.answered && showExplanation}
      <div class="result">
        {#if cell.isCorrect}
          <div class="result-correct">
            ✓ Richtig! +{cell.points} Punkte
          </div>
        {:else}
          <div class="result-incorrect">
            ✗ Leider falsch
          </div>
        {/if}
        {#if cell.explanation}
          <div class="explanation">
            {cell.explanation}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <style>
    .quiz-cell {
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      transition: border-color 0.3s ease;
    }

    .quiz-cell.correct {
      border-color: var(--color-success);
      background: color-mix(in srgb, var(--color-success) 5%, var(--bg-secondary));
    }

    .quiz-cell.incorrect {
      border-color: var(--color-error);
    }

    .question {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }

    .quiz-icon {
      font-size: 1.4rem;
    }

    .question-text {
      flex: 1;
      font-size: 1.05rem;
      line-height: 1.5;
    }

    .points {
      font-size: 0.85rem;
      color: var(--accent-color);
      font-weight: 600;
      white-space: nowrap;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .option {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
    }

    .option:hover:not(:disabled) {
      border-color: var(--accent-color);
      background: var(--bg-hover);
    }

    .option.selected {
      border-color: var(--accent-color);
      background: color-mix(in srgb, var(--accent-color) 10%, var(--bg-primary));
    }

    .option.correct {
      border-color: var(--color-success);
      background: color-mix(in srgb, var(--color-success) 10%, var(--bg-primary));
    }

    .option.incorrect {
      border-color: var(--color-error);
      background: color-mix(in srgb, var(--color-error) 10%, var(--bg-primary));
    }

    .option:disabled {
      cursor: default;
    }

    .option-marker {
      font-size: 1.2rem;
    }

    .option.selected .option-marker {
      color: var(--accent-color);
    }

    .option-text {
      flex: 1;
    }

    .feedback {
      display: block;
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 8px;
      font-style: italic;
    }

    .input-container {
      margin-bottom: 16px;
    }

    .input-container input {
      width: 100%;
      padding: 12px 16px;
      font-size: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .input-container input:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .submit-btn {
      padding: 10px 24px;
      background: var(--accent-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      opacity: 0.9;
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .hint-btn, .retry-btn {
      padding: 10px 16px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
    }

    .hint-box {
      margin-top: 16px;
      padding: 12px 16px;
      background: color-mix(in srgb, var(--color-warning) 10%, var(--bg-secondary));
      border-left: 3px solid var(--color-warning);
      border-radius: 0 8px 8px 0;
      font-size: 0.9rem;
    }

    .result {
      margin-top: 16px;
      padding: 16px;
      border-radius: 8px;
    }

    .result-correct {
      color: var(--color-success);
      font-weight: 600;
      font-size: 1.1rem;
    }

    .result-incorrect {
      color: var(--color-error);
      font-weight: 600;
    }

    .explanation {
      margin-top: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  </style>


  DATEI: src/lib/parser/quiz-parser.ts
  ──────────────────────────────────────────────────────

  import type { QuizCell, QuizOption, QuizType } from '$lib/types/quiz';
  import { parse as parseYAML } from 'yaml';

  export function parseQuiz(content: string): QuizCell | null {
    try {
      const config = parseYAML(content);

      const options: QuizOption[] | undefined = config.options?.map((opt: any) => ({
        text: opt.text,
        correct: opt.correct === true,
        feedback: opt.feedback,
      }));

      return {
        type: 'quiz',
        id: crypto.randomUUID(),
        quizType: config.type as QuizType,
        question: config.question,
        points: config.points ?? 10,
        options,
        correctAnswer: config.answer,
        tolerance: config.tolerance,
        hint: config.hint,
        explanation: config.explanation,
        answered: false,
        selectedOptions: [],
        attempts: 0,
      };
    } catch (e) {
      console.error('Quiz parsing error:', e);
      return null;
    }
  }


  WEITERE QUIZ-BEISPIELE
  ──────────────────────────────────────────────────────

  # True/False Quiz
  ```quiz
  type: true-false
  question: Der p-Wert gibt die Wahrscheinlichkeit an, dass die Nullhypothese wahr ist.
  points: 5
  options:
    - text: Wahr
      correct: false
      feedback: Das ist ein häufiges Missverständnis!
    - text: Falsch
      correct: true
      feedback: Richtig! Der p-Wert gibt die Wahrscheinlichkeit der Daten unter H0 an.
  explanation: |
    Der p-Wert ist P(Daten | H0), nicht P(H0 | Daten).
    Diese Verwechslung wird oft als "p-Wert Fehlinterpretation" bezeichnet.
  ```

  # Numeric Quiz
  ```quiz
  type: numeric
  question: Berechne den z-Wert für x=75 bei μ=70 und σ=5.
  points: 15
  answer: 1
  tolerance: 0.01
  hint: z = (x - μ) / σ
  ```

  # Fill-blank Quiz
  ```quiz
  type: fill-blank
  question: Die Summe aller Wahrscheinlichkeiten muss gleich ___ sein.
  points: 5
  answer: "1"
  ```
