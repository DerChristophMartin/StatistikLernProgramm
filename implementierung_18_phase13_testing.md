━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18. PHASE 13 — TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TEST-STRATEGIE
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬─────────────────────────────────────────────────────┐
  │ Test-Typ            │ Werkzeug & Fokus                                     │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ Unit Tests (FE)     │ Vitest — Stores, Parser, Utils                       │
  │ Unit Tests (BE)     │ cargo test — Rust Services, DB-Logik                │
  │ Component Tests     │ Vitest + @testing-library/svelte                    │
  │ E2E Tests           │ Playwright — Komplette User-Flows                   │
  │ Visual Regression   │ Playwright Screenshots                               │
  └─────────────────────┴─────────────────────────────────────────────────────┘


  RUST UNIT TESTS
  ──────────────────────────────────────────────────────

  # Datei: src-tauri/src/services/progress_service.rs

  #[cfg(test)]
  mod tests {
      use super::*;
      use tempfile::tempdir;

      fn setup_test_db() -> Database {
          let dir = tempdir().unwrap();
          let db_path = dir.path().join("test.db");
          Database::new(&db_path).unwrap()
      }

      #[test]
      fn test_save_and_load_progress() {
          let db = setup_test_db();

          let progress = LessonProgress {
              lesson_id: "lesson-1".to_string(),
              completed: true,
              score: 100,
              time_spent: 600,
              last_accessed: Some("2025-01-01".to_string()),
          };

          ProgressService::save_lesson_progress(&db, "course-1", &progress).unwrap();

          let loaded = ProgressService::get_lesson_progress(&db, "course-1", "lesson-1");

          assert!(loaded.is_some());
          let loaded = loaded.unwrap();
          assert!(loaded.completed);
          assert_eq!(loaded.score, 100);
      }

      #[test]
      fn test_course_progress_aggregation() {
          let db = setup_test_db();

          // 3 Lektionen speichern
          for i in 1..=3 {
              let progress = LessonProgress {
                  lesson_id: format!("lesson-{}", i),
                  completed: i < 3,  // Nur 2 abgeschlossen
                  score: i * 10,
                  time_spent: 300,
                  last_accessed: None,
              };
              ProgressService::save_lesson_progress(&db, "course-1", &progress).unwrap();
          }

          let course_progress = ProgressService::get_course_progress(&db, "course-1");

          assert_eq!(course_progress.total_lessons, 3);
          assert_eq!(course_progress.completed_lessons, 2);
          assert_eq!(course_progress.total_score, 60);
      }
  }


  FRONTEND UNIT TESTS (VITEST)
  ──────────────────────────────────────────────────────

  // Datei: src/lib/parser/markdown-parser.test.ts

  import { describe, it, expect } from 'vitest';
  import { parseMarkdown } from './markdown-parser';

  describe('Markdown Parser', () => {
    it('should parse simple markdown', () => {
      const content = '# Titel\n\nEin Paragraph.';
      const cells = parseMarkdown(content);

      expect(cells.length).toBe(1);
      expect(cells[0].type).toBe('markdown');
    });

    it('should extract code cells', () => {
      const content = `
# Test

\`\`\`python
print("Hello")
\`\`\`
`;
      const cells = parseMarkdown(content);

      expect(cells.length).toBe(2);
      expect(cells[0].type).toBe('markdown');
      expect(cells[1].type).toBe('code');
      expect(cells[1].content).toContain('print("Hello")');
    });

    it('should parse quiz blocks', () => {
      const content = `
\`\`\`quiz
type: multiple-choice
question: Was ist 2+2?
options:
  - text: "3"
    correct: false
  - text: "4"
    correct: true
\`\`\`
`;
      const cells = parseMarkdown(content);

      expect(cells.length).toBe(1);
      expect(cells[0].type).toBe('quiz');
      expect(cells[0].question).toBe('Was ist 2+2?');
    });
  });


  // Datei: src/lib/stores/progress.store.test.ts

  import { describe, it, expect, vi, beforeEach } from 'vitest';
  import { get } from 'svelte/store';

  // Mock Tauri invoke
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn(),
  }));

  import { invoke } from '@tauri-apps/api/core';
  import { progressStore } from './progress.store';

  describe('Progress Store', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should load progress from backend', async () => {
      const mockProgress = {
        courseId: 'test-course',
        totalLessons: 10,
        completedLessons: 5,
        totalScore: 500,
        totalTime: 3600,
      };

      (invoke as any).mockResolvedValue(mockProgress);

      await progressStore.loadCourseProgress('test-course');

      const state = get(progressStore);
      expect(state.courseProgress.completedLessons).toBe(5);
      expect(invoke).toHaveBeenCalledWith('get_progress', { courseId: 'test-course' });
    });
  });


  E2E TESTS (PLAYWRIGHT)
  ──────────────────────────────────────────────────────

  // Datei: tests/e2e/lesson-flow.spec.ts

  import { test, expect } from '@playwright/test';

  test.describe('Lesson Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173');
    });

    test('should navigate to a lesson', async ({ page }) => {
      // Kurs auswählen
      await page.click('[data-testid="course-card"]');

      // Erstes Kapitel aufklappen
      await page.click('[data-testid="chapter-1"]');

      // Erste Lektion anklicken
      await page.click('[data-testid="lesson-1-1"]');

      // Lektionsinhalt sollte sichtbar sein
      await expect(page.locator('.lesson-view')).toBeVisible();
    });

    test('should run code cell and show output', async ({ page }) => {
      await page.goto('http://localhost:5173/course/statistik/01-grundlagen');

      // Warten bis Python geladen
      await page.waitForSelector('[data-testid="python-ready"]', { timeout: 30000 });

      // Code-Zelle finden und Run-Button klicken
      await page.click('[data-testid="code-cell-1"] [data-testid="run-button"]');

      // Output sollte erscheinen
      await expect(page.locator('[data-testid="code-cell-1"] .output')).toBeVisible();
    });

    test('should complete quiz and update progress', async ({ page }) => {
      await page.goto('http://localhost:5173/course/statistik/quiz-test');

      // Quiz beantworten
      await page.click('[data-testid="quiz-option-b"]');
      await page.click('[data-testid="submit-quiz"]');

      // Erfolg-Feedback prüfen
      await expect(page.locator('.result-correct')).toBeVisible();

      // Fortschrittsbalken sollte sich aktualisieren
      await expect(page.locator('.progress-bar')).toHaveAttribute('aria-valuenow', /.+/);
    });
  });


  // Datei: tests/e2e/python-engine.spec.ts

  import { test, expect } from '@playwright/test';

  test.describe('Python Engine', () => {
    test('should load Pyodide and basic packages', async ({ page }) => {
      await page.goto('http://localhost:5173/course/test/code');

      // Warten auf Pyodide-Initialisierung
      await page.waitForSelector('[data-testid="python-status-ready"]', { 
        timeout: 60000 
      });

      // numpy importieren und testen
      await page.fill('.code-editor textarea', 'import numpy as np\nprint(np.__version__)');
      await page.click('[data-testid="run-button"]');

      // Output sollte numpy Version enthalten
      await expect(page.locator('.output')).toContainText(/\d+\.\d+/);
    });

    test('should display matplotlib plots', async ({ page }) => {
      await page.goto('http://localhost:5173/course/test/plot');
      await page.waitForSelector('[data-testid="python-ready"]', { timeout: 60000 });

      const code = `
import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [1, 4, 9])
plt.show()
`;

      await page.fill('.code-editor textarea', code);
      await page.click('[data-testid="run-button"]');

      // Plot-Image sollte erscheinen
      await expect(page.locator('.output img')).toBeVisible();
    });
  });


  TEST-KONFIGURATION
  ──────────────────────────────────────────────────────

  # vitest.config.ts

  import { defineConfig } from 'vitest/config';
  import { svelte } from '@sveltejs/vite-plugin-svelte';

  export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,ts}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/lib/**/*.ts'],
      },
    },
  });


  # playwright.config.ts

  import { defineConfig } from '@playwright/test';

  export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
      baseURL: 'http://localhost:5173',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  });


  NPM SCRIPTS
  ──────────────────────────────────────────────────────

  # package.json (Auszug)

  {
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest",
      "test:coverage": "vitest run --coverage",
      "test:e2e": "playwright test",
      "test:e2e:ui": "playwright test --ui",
      "test:rust": "cd src-tauri && cargo test",
      "test:all": "npm run test && npm run test:rust && npm run test:e2e"
    }
  }


  CI PIPELINE
  ──────────────────────────────────────────────────────

  # .github/workflows/ci.yml

  name: CI

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    test:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'

        - name: Setup Rust
          uses: dtolnay/rust-toolchain@stable

        - name: Install dependencies
          run: npm ci

        - name: Run Frontend tests
          run: npm run test

        - name: Run Rust tests
          run: npm run test:rust

        - name: Install Playwright
          run: npx playwright install --with-deps

        - name: Run E2E tests
          run: npm run test:e2e

        - name: Upload test results
          uses: actions/upload-artifact@v4
          if: always()
          with:
            name: test-results
            path: playwright-report/
