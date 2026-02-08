━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
25. BEKANNTE HERAUSFORDERUNGEN & LÖSUNGEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Dieses Kapitel dokumentiert bekannte Herausforderungen bei der
  Entwicklung und deren Lösungsansätze.


  ═══════════════════════════════════════════════════════
  PYODIDE / PYTHON-ENGINE
  ═══════════════════════════════════════════════════════

  ▸ HERAUSFORDERUNG: Initiale Ladezeit
  ──────────────────────────────────────────────────────
  Problem:    Pyodide + Pakete benötigen 60+ MB Download beim ersten Start.
  
  Lösungen:
  1. Lokales Bündeln der Pyodide-Dateien (kein CDN)
  2. Loading-Screen mit Fortschrittsanzeige
  3. Lazy Loading: Python erst laden wenn Code-Zelle sichtbar
  4. Pakete nacheinander laden, essentielle zuerst
  
  Implementierung:
    - static/pyodide/ enthält alle benötigten Dateien
    - loadPyodide({ indexURL: '/pyodide/' })
    - Python-Status im UI anzeigen


  ▸ HERAUSFORDERUNG: Memory-Verbrauch
  ──────────────────────────────────────────────────────
  Problem:    Pyodide + wissenschaftliche Pakete verbrauchen 400-600 MB RAM.
  
  Lösungen:
  1. Web Worker isoliert Python vom UI-Thread
  2. Matplotlib-Figures nach Plot-Erstellung schließen
  3. Garbage Collection nach großen Berechnungen
  4. Bei Bedarf komplette Python-Instanz neuladen

  Code:
    await pyodide.runPythonAsync(`
      import matplotlib.pyplot as plt
      plt.close('all')
      import gc
      gc.collect()
    `);


  ▸ HERAUSFORDERUNG: Matplotlib Backend
  ──────────────────────────────────────────────────────
  Problem:    plt.show() blockiert und plottet nicht korrekt in WebAssembly.
  
  Lösung:     Spezielles Backend und Plot-Extraction:
  
  // In python-prelude.py (beim Pyodide-Start):
  import matplotlib
  matplotlib.use('Agg')  # Non-interactive Backend
  
  // Plot-Extraktion nach Ausführung:
  import base64
  from io import BytesIO
  
  buf = BytesIO()
  plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
  buf.seek(0)
  plot_data = 'data:image/png;base64,' + base64.b64encode(buf.read()).decode()
  plt.close()


  ▸ HERAUSFORDERUNG: Infinite Loops
  ──────────────────────────────────────────────────────
  Problem:    User-Code mit Endlosschleife blockiert komplett.
  
  Lösungen:
  1. Ausführung in Web Worker (Worker kann terminiert werden)
  2. Timeout-Mechanismus
  3. "Stop"-Button zum Abbrechen

  Code:
    const worker = new Worker('/pyodide-worker.js');
    const TIMEOUT_MS = 30000;
    
    const timeoutId = setTimeout(() => {
      worker.terminate();
      showError('Ausführung abgebrochen (Timeout nach 30s)');
      // Neuen Worker erstellen
      recreateWorker();
    }, TIMEOUT_MS);


  ═══════════════════════════════════════════════════════
  TAURI / DESKTOP-INTEGRATION
  ═══════════════════════════════════════════════════════

  ▸ HERAUSFORDERUNG: CSP für WebAssembly
  ──────────────────────────────────────────────────────
  Problem:    WebAssembly benötigt spezielle CSP-Einstellungen.
  
  Lösung in tauri.conf.json:
    "csp": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; 
            style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; 
            worker-src 'self' blob:"


  ▸ HERAUSFORDERUNG: Dateisystem-Zugriff
  ──────────────────────────────────────────────────────
  Problem:    Standardmäßig hat die App keinen Dateisystem-Zugriff.
  
  Lösung in capabilities/default.json:
    "permissions": [
      "fs:allow-read",
      "fs:allow-write",
      "fs:scope-home",
      "dialog:allow-open",
      "dialog:allow-save"
    ]


  ▸ HERAUSFORDERUNG: Plattformspezifische Pfade
  ──────────────────────────────────────────────────────
  Problem:    Windows, macOS und Linux nutzen unterschiedliche Pfade.
  
  Lösung:     Das `directories` Crate:
  
  use directories::ProjectDirs;
  
  let dirs = ProjectDirs::from("com", "statistiklab", "StatistikLab")
      .expect("Konnte Verzeichnisse nicht bestimmen");
  
  let data_dir = dirs.data_dir();      // App-Daten (DB, Cache)
  let config_dir = dirs.config_dir();  // Einstellungen
  
  // Ergibt:
  // Windows: C:\Users\X\AppData\Local\statistiklab\StatistikLab
  // macOS:   /Users/X/Library/Application Support/com.statistiklab.StatistikLab
  // Linux:   /home/X/.local/share/statistiklab


  ═══════════════════════════════════════════════════════
  UI / RENDERING
  ═══════════════════════════════════════════════════════

  ▸ HERAUSFORDERUNG: LaTeX in Dark Mode
  ──────────────────────────────────────────────────────
  Problem:    KaTeX rendert Formeln schwarz — unsichtbar auf dunklem Hintergrund.
  
  Lösung CSS:
    [data-theme="dark"] .katex {
      color: var(--text-primary);
    }
    
    [data-theme="dark"] .katex .mord,
    [data-theme="dark"] .katex .mbin,
    [data-theme="dark"] .katex .mrel {
      color: inherit;
    }


  ▸ HERAUSFORDERUNG: Code-Editor Performance
  ──────────────────────────────────────────────────────
  Problem:    Große Code-Zellen verursachen Lag bei Eingabe.
  
  Lösungen:
  1. CodeMirror 6 statt 5 (deutlich performanter)
  2. Viewport-basiertes Rendering (aktiviert by default)
  3. Syntax-Highlighting nur für sichtbaren Bereich


  ▸ HERAUSFORDERUNG: Responsive Plots
  ──────────────────────────────────────────────────────
  Problem:    Matplotlib-Plots haben feste Größe, sehen auf kleinen
              Bildschirmen schlecht aus.
  
  Lösung:     Dynamische figsize basierend auf Container-Breite:
  
  // Container-Breite ermitteln und an Python übergeben
  const width = container.offsetWidth;
  const dpi = 100;
  const figWidth = Math.min(width / dpi, 10);  // Max 10 Zoll
  
  await pyodide.setVariable('__fig_width', figWidth);
  
  // Im Python prelude:
  import matplotlib.pyplot as plt
  plt.rcParams['figure.figsize'] = [__fig_width, __fig_width * 0.6]


  ═══════════════════════════════════════════════════════
  DATEN & PERSISTENZ
  ═══════════════════════════════════════════════════════

  ▸ HERAUSFORDERUNG: Datenverlust bei Absturz
  ──────────────────────────────────────────────────────
  Problem:    Nicht gespeicherter Code geht bei App-Absturz verloren.
  
  Lösungen:
  1. Auto-Save alle 30 Sekunden
  2. SQLite WAL-Modus für crash-sichere Schreibvorgänge
  3. Recovery-Mechanismus beim Neustart

  Code:
    // Auto-Save Timer
    setInterval(() => {
      if (hasUnsavedChanges) {
        saveCodeSnapshot();
      }
    }, 30000);
    
    // Bei App-Start: Recovery anbieten
    const unsaved = await invoke('get_unsaved_snapshots');
    if (unsaved.length > 0) {
      showRecoveryDialog(unsaved);
    }


  ▸ HERAUSFORDERUNG: Große Datensätze
  ──────────────────────────────────────────────────────
  Problem:    CSV-Dateien > 100 MB überlasten den Speicher.
  
  Lösungen:
  1. Größenlimit mit Warnung (z.B. 50 MB)
  2. Streaming-Import für große Dateien
  3. Nur Vorschau (erste N Zeilen) im UI


  ═══════════════════════════════════════════════════════
  BUILD & DISTRIBUTION
  ═══════════════════════════════════════════════════════

  ▸ HERAUSFORDERUNG: Große Bundle-Größe
  ──────────────────────────────────────────────────────
  Problem:    Pyodide + Pakete = 60+ MB, ergibt großen Installer.
  
  Lösungen:
  1. Nur essentielle Pakete bündeln
  2. Optionale Pakete on-demand nachladen
  3. Kompression (bz2) für Pyodide-Dateien
  4. Delta-Updates für spätere Versionen

  Erwartete Größen:
    Tauri App (ohne Pyodide): ~8 MB
    Mit Pyodide + Paketen:    ~50 MB


  ▸ HERAUSFORDERUNG: macOS Code-Signing
  ──────────────────────────────────────────────────────
  Problem:    Ohne Signatur zeigt macOS "App beschädigt" Warnung.
  
  Lösung:     Apple Developer Account + Notarization
  
  # In GitHub Actions:
  - name: Import Apple Certificate
    env:
      APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
    run: |
      # Keychain erstellen und Zertifikat importieren
      ...
  
  - name: Build & Notarize
    env:
      APPLE_ID: ${{ secrets.APPLE_ID }}
      APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}


  ▸ HERAUSFORDERUNG: Windows Defender Warnung
  ──────────────────────────────────────────────────────
  Problem:    Unsignierte Apps werden als potenziell gefährlich markiert.
  
  Lösung:     Code-Signing-Zertifikat kaufen und nutzen
  
  Alternative: SmartScreen-Reputation durch Downloads aufbauen
  (wird mit der Zeit besser)
