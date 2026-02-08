import { loadPyodide, type PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface | null = null;

interface WorkerMessage {
  id: string;
  type: 'init' | 'run' | 'load-package' | 'set-variable' | 'reset';
  code?: string;
  packages?: string[];
  variable?: { name: string; value: any };
}

interface WorkerResponse {
  id: string;
  type: 'init-done' | 'result' | 'error' | 'stdout' | 'stderr' | 'plot';
  data?: any;
  error?: string;
}

function respond(msg: WorkerResponse) {
  self.postMessage(msg);
}

// === PYTHON PRELUDE ===
// Wird beim Init ausgeführt — konfiguriert matplotlib etc.
const PYTHON_PRELUDE = `
import sys
import io
import base64
import json

# Matplotlib für Inline-Ausgabe konfigurieren
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt

# Seaborn Style setzen
try:
    import seaborn as sns
    sns.set_theme(style="whitegrid")
except:
    pass

# Custom show()-Funktion die Plots als Base64 zurückgibt
_statistiklab_plots = []

def _capture_plot():
    """Aktuellen Plot als Base64-PNG capturen."""
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=120, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close('all')
    _statistiklab_plots.append(img_b64)
    return img_b64

# plt.show() überschreiben
_original_show = plt.show
def _custom_show(*args, **kwargs):
    if plt.get_fignums():
        _capture_plot()
plt.show = _custom_show

# Stdout/Stderr capturing
class _OutputCapture:
    def __init__(self):
        self.stdout_capture = io.StringIO()
        self.stderr_capture = io.StringIO()
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr

    def start(self):
        self.stdout_capture = io.StringIO()
        self.stderr_capture = io.StringIO()
        sys.stdout = self.stdout_capture
        sys.stderr = self.stderr_capture
        global _statistiklab_plots
        _statistiklab_plots = []

    def stop(self):
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr
        return {
            'stdout': self.stdout_capture.getvalue(),
            'stderr': self.stderr_capture.getvalue(),
            'plots': _statistiklab_plots.copy()
        }

_output = _OutputCapture()

# Hilfsfunktionen für Statistik-Lektionen
def show_dataframe(df, max_rows=10):
    """DataFrame als HTML-Tabelle anzeigen."""
    print(df.to_html(max_rows=max_rows, classes='dataframe'))

def describe_data(data, name="Daten"):
    """Schnelle deskriptive Statistik."""
    import numpy as np
    print(f"\\n=== {name} ===")
    print(f"  n     = {len(data)}")
    print(f"  Mean  = {np.mean(data):.4f}")
    print(f"  Median= {np.median(data):.4f}")
    print(f"  Std   = {np.std(data, ddof=1):.4f}")
    print(f"  Min   = {np.min(data):.4f}")
    print(f"  Max   = {np.max(data):.4f}")
    print(f"  Range = {np.ptp(data):.4f}")

print("✅ StatistikLab Python Engine bereit!")
print(f"   Python {sys.version.split()[0]}")
print(f"   NumPy, Pandas, SciPy, Matplotlib geladen")
`;

// === MESSAGE HANDLER ===
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, code, packages, variable } = event.data;

  try {
    switch (type) {
      case 'init': {
        pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
        });

        // Standardpakete laden
        await pyodide.loadPackage([
          'numpy',
          'pandas',
          'scipy',
          'matplotlib',
          'scikit-learn',
        ]);

        // Optionale Pakete (nicht-blockierend)
        try {
          await pyodide.loadPackage(['statsmodels', 'seaborn']);
        } catch {
          console.warn('Optionale Pakete konnten nicht geladen werden');
        }

        // Prelude ausführen
        await pyodide.runPythonAsync(PYTHON_PRELUDE);

        respond({ id, type: 'init-done' });
        break;
      }

      case 'run': {
        if (!pyodide || !code) {
          respond({ id, type: 'error', error: 'Python Engine nicht initialisiert' });
          return;
        }

        // Output-Capturing starten
        pyodide.runPython('_output.start()');

        // Code ausführen
        let result: any;
        try {
          result = await pyodide.runPythonAsync(code);
        } catch (pyError: any) {
          // Python-Fehler abfangen
          pyodide.runPython(`
            sys.stdout = _output._original_stdout
            sys.stderr = _output._original_stderr
          `);
          respond({
            id,
            type: 'error',
            error: pyError.message || String(pyError),
          });
          return;
        }

        // Output einsammeln
        const outputJson = pyodide.runPython(`
          import json
          _result = _output.stop()
          json.dumps(_result)
        `);

        const output = JSON.parse(outputJson);

        // Plots einzeln senden
        for (const plotB64 of output.plots) {
          respond({ id, type: 'plot', data: plotB64 });
        }

        // Ergebnis senden
        respond({
          id,
          type: 'result',
          data: {
            stdout: output.stdout,
            stderr: output.stderr,
            result: result?.toString() ?? null,
            plotCount: output.plots.length,
          },
        });
        break;
      }

      case 'load-package': {
        if (!pyodide || !packages) return;
        await pyodide.loadPackage(packages);
        respond({ id, type: 'result', data: { loaded: packages } });
        break;
      }

      case 'set-variable': {
        if (!pyodide || !variable) return;
        pyodide.globals.set(variable.name, variable.value);
        respond({ id, type: 'result' });
        break;
      }

      case 'reset': {
        if (pyodide) {
          await pyodide.runPythonAsync(`
            for name in list(globals().keys()):
                if not name.startswith('_') and name not in ['sys', 'io', 'base64', 'json', 'matplotlib', 'plt']:
                    del globals()[name]
          `);
          await pyodide.runPythonAsync(PYTHON_PRELUDE);
        }
        respond({ id, type: 'result' });
        break;
      }
    }
  } catch (error: any) {
    respond({
      id,
      type: 'error',
      error: error.message || 'Unbekannter Fehler',
    });
  }
};
