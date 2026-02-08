━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
16. PHASE 11 — KURS-EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Der Kurs-Editor erlaubt es Dozenten/Autoren, eigene Kurse zu erstellen.
  Er bietet eine benutzerfreundliche Oberfläche zum:
  - Kurse und Kapitel anlegen
  - Lektionen mit Markdown schreiben
  - Code-Zellen, Quizzes und Widgets einfügen
  - Vorschau der Lektion in Echtzeit


  EDITOR-FEATURES
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬─────────────────────────────────────────────────────┐
  │ Feature             │ Beschreibung                                         │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ Kursstruktur        │ Drag & Drop für Kapitel und Lektionen               │
  │ Split-View          │ Editor links, Live-Vorschau rechts                  │
  │ Snippet-Bibliothek  │ Code-Vorlagen, Quiz-Templates                       │
  │ Autovalidierung     │ Prüft YAML-Syntax, Python-Fehler                    │
  │ Assets              │ Bilder, Datensätze hochladen                        │
  │ Export              │ Kurs als ZIP-Archiv exportieren                     │
  └─────────────────────┴─────────────────────────────────────────────────────┘


  DATEI: src/routes/editor/+page.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { onMount } from 'svelte';
    import { invoke } from '@tauri-apps/api/core';
    import CourseStructure from '$lib/components/editor/CourseStructure.svelte';
    import LessonEditor from '$lib/components/editor/LessonEditor.svelte';
    import LessonPreview from '$lib/components/editor/LessonPreview.svelte';
    import SnippetPanel from '$lib/components/editor/SnippetPanel.svelte';

    let course: any = null;
    let selectedLesson: any = null;
    let editorContent = '';
    let showSnippets = false;

    onMount(async () => {
      // Prüfen ob Kurs zum Bearbeiten übergeben wurde
      const params = new URLSearchParams(window.location.search);
      const coursePath = params.get('course');

      if (coursePath) {
        course = await invoke('load_course', { path: coursePath });
      }
    });

    function handleLessonSelect(lesson: any) {
      selectedLesson = lesson;
      // Lessoninhalt laden
      invoke('get_lesson_content', {
        coursePath: course.path,
        lessonId: lesson.id,
      }).then((content: string) => {
        editorContent = content;
      });
    }

    async function handleSave() {
      if (!selectedLesson) return;

      await invoke('save_lesson_content', {
        lessonPath: selectedLesson.path,
        content: editorContent,
      });
    }

    function insertSnippet(snippet: string) {
      editorContent += '\n' + snippet;
      showSnippets = false;
    }
  </script>

  <div class="editor-layout">
    <!-- Sidebar: Kursstruktur -->
    <aside class="structure-panel">
      <CourseStructure
        {course}
        on:select={(e) => handleLessonSelect(e.detail)}
        on:new-chapter
        on:new-lesson
      />
    </aside>

    <!-- Main: Editor/Preview Split -->
    <main class="editor-area">
      {#if selectedLesson}
        <div class="split-view">
          <!-- Editor -->
          <div class="editor-pane">
            <div class="editor-toolbar">
              <button on:click={() => showSnippets = !showSnippets}>
                📝 Snippets
              </button>
              <button on:click={handleSave}>
                💾 Speichern
              </button>
            </div>
            <LessonEditor bind:content={editorContent} />
          </div>

          <!-- Preview -->
          <div class="preview-pane">
            <LessonPreview content={editorContent} />
          </div>
        </div>
      {:else}
        <div class="no-selection">
          <p>Wähle eine Lektion zum Bearbeiten aus, oder erstelle eine neue.</p>
        </div>
      {/if}
    </main>

    <!-- Snippets Panel -->
    {#if showSnippets}
      <SnippetPanel on:insert={(e) => insertSnippet(e.detail)} />
    {/if}
  </div>

  <style>
    .editor-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      height: 100vh;
    }

    .structure-panel {
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
    }

    .editor-area {
      display: flex;
      flex-direction: column;
    }

    .split-view {
      display: grid;
      grid-template-columns: 1fr 1fr;
      flex: 1;
    }

    .editor-pane {
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border-color);
    }

    .editor-toolbar {
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .editor-toolbar button {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-primary);
      cursor: pointer;
    }

    .preview-pane {
      overflow-y: auto;
      background: var(--bg-primary);
    }

    .no-selection {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
    }
  </style>


  DATEI: src/lib/components/editor/SnippetPanel.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    const snippets = [
      {
        name: 'Code-Zelle',
        icon: '💻',
        template: `
\`\`\`python
# Dein Code hier
import numpy as np

\`\`\`
`,
      },
      {
        name: 'Multiple Choice Quiz',
        icon: '❓',
        template: `
\`\`\`quiz
type: multiple-choice
question: Deine Frage hier?
points: 10
options:
  - text: Option A
    correct: false
  - text: Option B
    correct: true
hint: Ein hilfreicher Hinweis
\`\`\`
`,
      },
      {
        name: 'Interaktives Widget',
        icon: '⚡',
        template: `
\`\`\`interactive
title: Mein Widget
parameters:
  - name: x
    label: X-Wert
    min: 0
    max: 100
    default: 50
---
import matplotlib.pyplot as plt
import numpy as np

# x ist automatisch gesetzt
y = x ** 2
print(f"x = {x}, y = {y}")
\`\`\`
`,
      },
      {
        name: 'Hinweis-Box',
        icon: '💡',
        template: `
:::tip
Dein hilfreicher Hinweis hier.
:::
`,
      },
      {
        name: 'Warnung-Box',
        icon: '⚠️',
        template: `
:::warning
Wichtige Warnung hier.
:::
`,
      },
      {
        name: 'Matheformel (Block)',
        icon: '∑',
        template: `
$$
\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i
$$
`,
      },
      {
        name: 'Übungsaufgabe',
        icon: '✏️',
        template: `
\`\`\`exercise
title: Aufgabe
description: Berechne den Mittelwert des Datensatzes.
starter_code: |
  data = [1, 2, 3, 4, 5]
  # Berechne den Mittelwert
  mean = 
solution: |
  data = [1, 2, 3, 4, 5]
  mean = sum(data) / len(data)
validation: |
  assert abs(mean - 3.0) < 0.001, "Der Mittelwert sollte 3.0 sein"
points: 20
\`\`\`
`,
      },
    ];

    function insertSnippet(template: string) {
      dispatch('insert', template);
    }
  </script>

  <div class="snippet-panel">
    <h3>Snippets einfügen</h3>
    <div class="snippet-list">
      {#each snippets as snippet}
        <button class="snippet-item" on:click={() => insertSnippet(snippet.template)}>
          <span class="snippet-icon">{snippet.icon}</span>
          <span class="snippet-name">{snippet.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <style>
    .snippet-panel {
      position: fixed;
      top: 50px;
      right: 20px;
      width: 280px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 1000;
    }

    h3 {
      margin: 0 0 16px 0;
      font-size: 1rem;
    }

    .snippet-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .snippet-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
    }

    .snippet-item:hover {
      background: var(--bg-hover);
      border-color: var(--accent-color);
    }

    .snippet-icon {
      font-size: 1.3rem;
    }

    .snippet-name {
      font-size: 0.9rem;
    }
  </style>


  DATEI: src-tauri/src/commands/editor_commands.rs
  ──────────────────────────────────────────────────────

  use std::path::PathBuf;
  use std::fs;

  #[tauri::command]
  pub fn create_course(
      courses_dir: String,
      name: String,
      description: String,
  ) -> Result<String, String> {
      let course_dir = PathBuf::from(&courses_dir).join(&name);

      if course_dir.exists() {
          return Err("Kurs existiert bereits".to_string());
      }

      fs::create_dir_all(&course_dir)
          .map_err(|e| format!("Fehler: {}", e))?;

      // kurs.yaml erstellen
      let kurs_yaml = format!(r#"
id: {}
title: "{}"
description: "{}"
author: ""
version: "1.0"
language: "de"
difficulty: "beginner"
"#, 
          name.to_lowercase().replace(' ', "-"),
          name,
          description
      );

      fs::write(course_dir.join("kurs.yaml"), kurs_yaml)
          .map_err(|e| format!("Fehler: {}", e))?;

      Ok(course_dir.to_string_lossy().to_string())
  }

  #[tauri::command]
  pub fn create_chapter(
      course_path: String,
      name: String,
      order: i32,
  ) -> Result<String, String> {
      let chapter_name = format!("{:02}-{}", order, name.to_lowercase().replace(' ', "-"));
      let chapter_dir = PathBuf::from(&course_path).join(&chapter_name);

      fs::create_dir_all(&chapter_dir)
          .map_err(|e| format!("Fehler: {}", e))?;

      let kapitel_yaml = format!(r#"
id: {}
title: "{}"
order: {}
"#, 
          chapter_name,
          name,
          order
      );

      fs::write(chapter_dir.join("kapitel.yaml"), kapitel_yaml)
          .map_err(|e| format!("Fehler: {}", e))?;

      Ok(chapter_dir.to_string_lossy().to_string())
  }

  #[tauri::command]
  pub fn create_lesson(
      chapter_path: String,
      title: String,
      order: i32,
  ) -> Result<String, String> {
      let lesson_name = format!("{:02}-{}.md", order, title.to_lowercase().replace(' ', "-"));
      let lesson_path = PathBuf::from(&chapter_path).join(&lesson_name);

      let content = format!(r#"---
id: {}
title: "{}"
order: {}
estimated_time: 15
---

# {}

Beginne hier mit deinem Inhalt...

"#,
          lesson_name.replace(".md", ""),
          title,
          order,
          title
      );

      fs::write(&lesson_path, content)
          .map_err(|e| format!("Fehler: {}", e))?;

      Ok(lesson_path.to_string_lossy().to_string())
  }

  #[tauri::command]
  pub fn save_lesson_content(
      lesson_path: String,
      content: String,
  ) -> Result<(), String> {
      fs::write(&lesson_path, &content)
          .map_err(|e| format!("Speichern fehlgeschlagen: {}", e))
  }
