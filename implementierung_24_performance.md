━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
24. PERFORMANCE-OPTIMIERUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  PERFORMANCE-ZIELE
  ──────────────────────────────────────────────────────

  ┌─────────────────────────────────┬────────────────────────────────────────┐
  │ Metrik                          │ Ziel                                   │
  ├─────────────────────────────────┼────────────────────────────────────────┤
  │ App-Start (Cold Start)          │ < 2 Sekunden                          │
  │ Lektion laden                   │ < 500ms                                │
  │ Python-Engine bereit            │ < 5 Sekunden (erstes Mal)             │
  │ Python-Engine bereit (Cached)   │ < 2 Sekunden                          │
  │ Code-Ausführung (einfach)       │ < 100ms                                │
  │ Plot-Rendering                  │ < 500ms                                │
  │ Memory Usage (Idle)             │ < 300 MB                               │
  │ Memory Usage (mit Python)       │ < 800 MB                               │
  └─────────────────────────────────┴────────────────────────────────────────┘


  PYODIDE-OPTIMIERUNGEN
  ──────────────────────────────────────────────────────

  1. LAZY LOADING
     - Pyodide erst laden wenn erste Code-Zelle sichtbar wird
     - Loading-Indicator zeigen während Initialisierung

  2. PACKAGE PRE-LOADING
     - Häufige Pakete (numpy, pandas, matplotlib) vorladen
     - Im Hintergrund während User Markdown liest

  3. OFFLINE CACHING
     - Pyodide-Core und Pakete in static/ bündeln
     - Service Worker für Caching (optional)

  // src/lib/engine/pyodide-engine.ts

  class PyodideEngine {
    private pyodide: any = null;
    private loadPromise: Promise<void> | null = null;
    private packagesLoaded = new Set<string>();

    // Lazy Loading
    async ensureLoaded(): Promise<void> {
      if (this.pyodide) return;
      
      if (!this.loadPromise) {
        this.loadPromise = this.initialize();
      }
      
      return this.loadPromise;
    }

    private async initialize() {
      // Lokale Pyodide-Dateien verwenden
      const pyodide = await loadPyodide({
        indexURL: '/pyodide/',
      });

      // Basis-Setup
      await pyodide.runPythonAsync(`
        import sys
        sys.stdout = sys.stderr = type('StdCapture', (), {
          'write': lambda self, s: __captured__.append(s),
          'flush': lambda self: None
        })()
        __captured__ = []
      `);

      this.pyodide = pyodide;

      // Pakete im Hintergrund laden
      this.preloadPackages();
    }

    private async preloadPackages() {
      const essentialPackages = ['numpy', 'pandas'];
      const secondaryPackages = ['scipy', 'matplotlib', 'scikit-learn'];

      // Essentielle zuerst
      for (const pkg of essentialPackages) {
        await this.loadPackage(pkg);
      }

      // Sekundäre im Hintergrund
      for (const pkg of secondaryPackages) {
        requestIdleCallback(() => this.loadPackage(pkg));
      }
    }

    async loadPackage(name: string) {
      if (this.packagesLoaded.has(name)) return;
      
      await this.pyodide.loadPackage(name);
      this.packagesLoaded.add(name);
    }
  }


  WEB WORKER FÜR PYTHON
  ──────────────────────────────────────────────────────

  Python-Code in einem Web Worker ausführen, um den UI-Thread
  nicht zu blockieren:

  // src/lib/engine/pyodide-worker.ts

  let pyodide: any = null;

  self.onmessage = async (event) => {
    const { type, id, code, packages } = event.data;

    if (type === 'init') {
      pyodide = await loadPyodide({ indexURL: event.data.indexURL });
      self.postMessage({ type: 'ready' });
      return;
    }

    if (type === 'loadPackages') {
      await pyodide.loadPackage(packages);
      self.postMessage({ type: 'packagesLoaded', id });
      return;
    }

    if (type === 'execute') {
      try {
        // Setup für Output-Capture
        pyodide.runPython(`
          import io, sys
          _stdout = io.StringIO()
          sys.stdout = _stdout
        `);

        // Code ausführen
        const result = await pyodide.runPythonAsync(code);

        // Output sammeln
        const stdout = pyodide.runPython('_stdout.getvalue()');

        // Plot extrahieren falls vorhanden
        let plot = null;
        try {
          plot = pyodide.runPython(`
            import base64
            from io import BytesIO
            import matplotlib.pyplot as plt
            if plt.get_fignums():
              buf = BytesIO()
              plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
              buf.seek(0)
              plt.close('all')
              'data:image/png;base64,' + base64.b64encode(buf.read()).decode()
            else:
              None
          `);
        } catch {}

        self.postMessage({
          type: 'result',
          id,
          result: {
            stdout,
            plot,
            returnValue: result?.toJs?.() ?? result,
          },
        });
      } catch (error) {
        self.postMessage({
          type: 'error',
          id,
          error: String(error),
        });
      }
    }
  };


  FRONTEND-OPTIMIERUNGEN
  ──────────────────────────────────────────────────────

  1. CODE SPLITTING
     - Separate Chunks für Pyodide, CodeMirror, und Plotly
     - Lädt nur was gebraucht wird

  // vite.config.ts
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            pyodide: ['pyodide'],
            codemirror: [
              '@codemirror/state',
              '@codemirror/view',
              '@codemirror/lang-python',
              '@codemirror/theme-one-dark',
            ],
            plotly: ['plotly.js-dist-min'],
            katex: ['katex'],
          },
        },
      },
    },
  });


  2. VIRTUALISIERUNG (für lange Lektionen)
     - Nur sichtbare Zellen rendern
     - Intersection Observer für Lazy Rendering

  // src/lib/components/lesson/VirtualizedCells.svelte
  <script>
    import { onMount } from 'svelte';

    export let cells = [];

    let visibleRange = { start: 0, end: 10 };
    let container: HTMLElement;

    onMount(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          // Sichtbare Zellen tracken und Range erweitern
        },
        { root: container, rootMargin: '200px' }
      );

      // Placeholder-Elemente beobachten
    });
  </script>


  3. DEBOUNCING & THROTTLING
     - Code-Ausführung nach Eingabe verzögern
     - Interaktive Widgets: max 60fps Updates

  // src/lib/utils/debounce.ts
  export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }


  RUST/BACKEND-OPTIMIERUNGEN
  ──────────────────────────────────────────────────────

  1. KURS-CACHING
     - Kursstruktur in SQLite cachen
     - Nur neu laden wenn Dateien geändert

  pub fn load_course_cached(path: &Path, db: &Database) -> Result<Course> {
      let hash = calculate_dir_hash(path)?;
      
      // Cache-Hit prüfen
      if let Some(cached) = db.get_course_cache(path) {
          if cached.hash == hash {
              return Ok(serde_json::from_str(&cached.structure)?);
          }
      }
      
      // Cache-Miss: Neu laden und speichern
      let course = load_course(path)?;
      db.set_course_cache(path, &hash, &serde_json::to_string(&course)?)?;
      
      Ok(course)
  }


  2. ASYNC DATENBANKOPERATIONEN
     - Nicht-blockierende DB-Zugriffe
     - Fortschritt im Hintergrund speichern

  #[tauri::command]
  pub async fn save_progress_async(
      state: State<'_, AppState>,
      course_id: String,
      progress: LessonProgress,
  ) -> Result<(), String> {
      // In separatem Thread ausführen
      tauri::async_runtime::spawn_blocking(move || {
          let db = state.db.lock().unwrap();
          ProgressService::save_lesson_progress(&db, &course_id, &progress)
      })
      .await
      .map_err(|e| e.to_string())?
  }


  3. SQLITE-OPTIMIERUNGEN
     - WAL-Modus für parallele Lese/Schreibzugriffe
     - Prepared Statements wiederverwenden

  pub fn new(path: &Path) -> Result<Self> {
      let conn = Connection::open(path)?;
      
      // Performance-Optimierungen
      conn.execute_batch("
          PRAGMA journal_mode = WAL;
          PRAGMA synchronous = NORMAL;
          PRAGMA cache_size = -64000;  -- 64MB Cache
          PRAGMA temp_store = MEMORY;
      ")?;
      
      Ok(Self { conn })
  }


  MEMORY MANAGEMENT
  ──────────────────────────────────────────────────────

  1. PLOT-CLEANUP
     - Matplotlib-Figures nach Rendering freigeben
     - Memory-Leak bei vielen Plots vermeiden

  await pyodide.runPythonAsync(`
    import matplotlib.pyplot as plt
    plt.close('all')
    import gc
    gc.collect()
  `);


  2. HISTORY BEGRENZEN
     - Maximal N Code-Snapshots pro Lektion
     - Alte Einträge automatisch löschen

  const MAX_HISTORY_PER_LESSON = 50;

  async function trimHistory(lessonId: string) {
    await invoke('trim_code_history', { 
      lessonId, 
      keepLast: MAX_HISTORY_PER_LESSON 
    });
  }
