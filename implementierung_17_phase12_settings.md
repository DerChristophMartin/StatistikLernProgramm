━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
17. PHASE 12 — EINSTELLUNGEN & THEMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  EINSTELLUNGS-KATEGORIEN
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬─────────────────────────────────────────────────────┐
  │ Kategorie           │ Optionen                                             │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ Erscheinung         │ Theme (hell/dunkel/auto), Schriftgröße, Schriftart  │
  │ Editor              │ Tab-Größe, Zeilennummern, Autovervollständigung     │
  │ Python              │ Automatisch starten, Paket-Cache                    │
  │ Datenschutz         │ Telemetrie (optional), Crash-Reports                │
  │ Speicherung         │ Backup-Intervall, Speicherort                       │
  │ Kurse               │ Standard-Kursverzeichnis                            │
  └─────────────────────┴─────────────────────────────────────────────────────┘


  DATEI: src/lib/types/settings.ts
  ──────────────────────────────────────────────────────

  export interface AppSettings {
    // Erscheinung
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
    accentColor: string;

    // Editor
    tabSize: number;
    showLineNumbers: boolean;
    autoComplete: boolean;
    wordWrap: boolean;

    // Python
    autoStartPython: boolean;
    pythonCachePath: string;

    // Datenschutz
    sendCrashReports: boolean;
    sendUsageStats: boolean;

    // Speicherung
    autoSaveInterval: number;  // Sekunden
    backupEnabled: boolean;

    // Kurse
    coursesDirectory: string;
    lastOpenedCourse: string | null;
  }

  export const defaultSettings: AppSettings = {
    theme: 'auto',
    fontSize: 'medium',
    fontFamily: 'Inter',
    accentColor: '#6366F1',
    tabSize: 4,
    showLineNumbers: true,
    autoComplete: true,
    wordWrap: false,
    autoStartPython: true,
    pythonCachePath: '',
    sendCrashReports: false,
    sendUsageStats: false,
    autoSaveInterval: 30,
    backupEnabled: true,
    coursesDirectory: '',
    lastOpenedCourse: null,
  };


  DATEI: src/lib/stores/settings.store.ts
  ──────────────────────────────────────────────────────

  import { writable, derived } from 'svelte/store';
  import { invoke } from '@tauri-apps/api/core';
  import type { AppSettings } from '$lib/types/settings';
  import { defaultSettings } from '$lib/types/settings';

  function createSettingsStore() {
    const { subscribe, set, update } = writable<AppSettings>(defaultSettings);

    return {
      subscribe,

      async load() {
        try {
          const settings = await invoke<AppSettings>('get_settings');
          set({ ...defaultSettings, ...settings });
          applyTheme(settings.theme);
        } catch (e) {
          console.error('Einstellungen laden fehlgeschlagen:', e);
        }
      },

      async save(newSettings: Partial<AppSettings>) {
        update(current => {
          const merged = { ...current, ...newSettings };
          invoke('save_settings', { settings: merged });
          applyTheme(merged.theme);
          return merged;
        });
      },

      updateSingle<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
        update(current => {
          const updated = { ...current, [key]: value };
          invoke('save_settings', { settings: updated });
          if (key === 'theme') applyTheme(value as string);
          return updated;
        });
      },
    };
  }

  function applyTheme(theme: string) {
    const root = document.documentElement;

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  export const settingsStore = createSettingsStore();


  DATEI: src/app.css (Theme-Variablen)
  ──────────────────────────────────────────────────────

  :root {
    /* Font */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

    /* Sizes */
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
  }

  /* Light Theme */
  [data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-tertiary: #f3f4f6;
    --bg-hover: #e5e7eb;
    --bg-active: #d1d5db;
    --bg-elevated: #ffffff;

    --text-primary: #111827;
    --text-secondary: #4b5563;
    --text-tertiary: #9ca3af;

    --border-color: #e5e7eb;
    --border-strong: #d1d5db;

    --accent-color: #6366f1;
    --accent-hover: #4f46e5;
    --accent-light: #eef2ff;

    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #3b82f6;
    --color-gold: #fbbf24;

    --code-bg: #f8fafc;
    --code-border: #e2e8f0;
  }

  /* Dark Theme */
  [data-theme="dark"] {
    --bg-primary: #0f0f0f;
    --bg-secondary: #171717;
    --bg-tertiary: #1f1f1f;
    --bg-hover: #262626;
    --bg-active: #333333;
    --bg-elevated: #1a1a1a;

    --text-primary: #f5f5f5;
    --text-secondary: #a3a3a3;
    --text-tertiary: #737373;

    --border-color: #2a2a2a;
    --border-strong: #404040;

    --accent-color: #818cf8;
    --accent-hover: #a5b4fc;
    --accent-light: #1e1b4b;

    --color-success: #34d399;
    --color-warning: #fbbf24;
    --color-error: #f87171;
    --color-info: #60a5fa;
    --color-gold: #fcd34d;

    --code-bg: #1e1e1e;
    --code-border: #2d2d2d;
  }

  /* Font Size Modifiers */
  [data-font-size="small"] {
    --font-size-base: 0.875rem;
  }

  [data-font-size="large"] {
    --font-size-base: 1.125rem;
  }


  DATEI: src/lib/components/settings/SettingsModal.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import Modal from '../common/Modal.svelte';
    import ThemePicker from './ThemePicker.svelte';
    import FontSizePicker from './FontSizePicker.svelte';
    import { settingsStore } from '$lib/stores/settings.store';

    export let isOpen = false;

    let activeTab = 'appearance';

    const tabs = [
      { id: 'appearance', label: 'Erscheinung', icon: '🎨' },
      { id: 'editor', label: 'Editor', icon: '✏️' },
      { id: 'python', label: 'Python', icon: '🐍' },
      { id: 'storage', label: 'Speicherung', icon: '💾' },
      { id: 'about', label: 'Über', icon: 'ℹ️' },
    ];

    $: settings = $settingsStore;
  </script>

  <Modal bind:isOpen title="Einstellungen" size="large">
    <div class="settings-layout">
      <!-- Tab Navigation -->
      <nav class="settings-nav">
        {#each tabs as tab}
          <button
            class="nav-item"
            class:active={activeTab === tab.id}
            on:click={() => activeTab = tab.id}
          >
            <span class="icon">{tab.icon}</span>
            <span class="label">{tab.label}</span>
          </button>
        {/each}
      </nav>

      <!-- Tab Content -->
      <div class="settings-content">
        {#if activeTab === 'appearance'}
          <section>
            <h3>Theme</h3>
            <ThemePicker
              value={settings.theme}
              on:change={(e) => settingsStore.updateSingle('theme', e.detail)}
            />

            <h3>Schriftgröße</h3>
            <FontSizePicker
              value={settings.fontSize}
              on:change={(e) => settingsStore.updateSingle('fontSize', e.detail)}
            />

            <h3>Akzentfarbe</h3>
            <div class="color-options">
              {#each ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'] as color}
                <button
                  class="color-option"
                  class:selected={settings.accentColor === color}
                  style="--color: {color}"
                  on:click={() => settingsStore.updateSingle('accentColor', color)}
                />
              {/each}
            </div>
          </section>

        {:else if activeTab === 'editor'}
          <section>
            <h3>Code-Editor</h3>

            <label class="setting-row">
              <span>Zeilennummern anzeigen</span>
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                on:change={(e) => settingsStore.updateSingle('showLineNumbers', e.target.checked)}
              />
            </label>

            <label class="setting-row">
              <span>Autovervollständigung</span>
              <input
                type="checkbox"
                checked={settings.autoComplete}
                on:change={(e) => settingsStore.updateSingle('autoComplete', e.target.checked)}
              />
            </label>

            <label class="setting-row">
              <span>Tab-Größe</span>
              <select
                value={settings.tabSize}
                on:change={(e) => settingsStore.updateSingle('tabSize', parseInt(e.target.value))}
              >
                <option value={2}>2 Leerzeichen</option>
                <option value={4}>4 Leerzeichen</option>
              </select>
            </label>
          </section>

        {:else if activeTab === 'python'}
          <section>
            <h3>Python-Engine</h3>

            <label class="setting-row">
              <span>Python automatisch starten</span>
              <input
                type="checkbox"
                checked={settings.autoStartPython}
                on:change={(e) => settingsStore.updateSingle('autoStartPython', e.target.checked)}
              />
            </label>

            <p class="setting-hint">
              Die Python-Engine (Pyodide) benötigt beim ersten Start ca. 20 MB Download.
              Danach werden die Dateien lokal gecacht.
            </p>
          </section>

        {:else if activeTab === 'storage'}
          <section>
            <h3>Automatische Speicherung</h3>

            <label class="setting-row">
              <span>Auto-Save Intervall</span>
              <select
                value={settings.autoSaveInterval}
                on:change={(e) => settingsStore.updateSingle('autoSaveInterval', parseInt(e.target.value))}
              >
                <option value={10}>Alle 10 Sekunden</option>
                <option value={30}>Alle 30 Sekunden</option>
                <option value={60}>Jede Minute</option>
                <option value={0}>Deaktiviert</option>
              </select>
            </label>

            <label class="setting-row">
              <span>Backups aktivieren</span>
              <input
                type="checkbox"
                checked={settings.backupEnabled}
                on:change={(e) => settingsStore.updateSingle('backupEnabled', e.target.checked)}
              />
            </label>
          </section>

        {:else if activeTab === 'about'}
          <section class="about-section">
            <h3>StatistikLab</h3>
            <p>Version 1.0.0</p>
            <p>Interaktiv Statistik lernen mit Python</p>

            <h4>Entwickelt mit</h4>
            <ul>
              <li>Tauri 2.0 (Rust)</li>
              <li>Svelte 5</li>
              <li>Pyodide (Python im Browser)</li>
            </ul>

            <a href="https://github.com/statistiklab/statistiklab" target="_blank">
              GitHub Repository
            </a>
          </section>
        {/if}
      </div>
    </div>
  </Modal>

  <style>
    .settings-layout {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 24px;
      min-height: 400px;
    }

    .settings-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-right: 1px solid var(--border-color);
      padding-right: 24px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--accent-light);
      color: var(--accent-color);
      font-weight: 600;
    }

    .settings-content {
      padding: 0 8px;
    }

    section h3 {
      margin: 0 0 16px 0;
      font-size: 1rem;
      color: var(--text-primary);
    }

    section h3:not(:first-child) {
      margin-top: 24px;
    }

    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .setting-hint {
      margin-top: 12px;
      font-size: 0.85rem;
      color: var(--text-tertiary);
    }

    .color-options {
      display: flex;
      gap: 12px;
    }

    .color-option {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid transparent;
      background: var(--color);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .color-option:hover {
      transform: scale(1.1);
    }

    .color-option.selected {
      border-color: var(--text-primary);
    }

    .about-section {
      text-align: center;
    }

    .about-section ul {
      list-style: none;
      padding: 0;
    }

    .about-section a {
      color: var(--accent-color);
    }
  </style>
