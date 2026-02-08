━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13. PHASE 8 — INTERAKTIVE WIDGETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Interaktive Widgets ermöglichen es, Parameter mit Schiebereglern anzupassen
  und sofort die Auswirkungen auf Visualisierungen zu sehen. Ideal für:
  - Normalverteilung (μ, σ ändern)
  - Stichprobengröße variieren
  - Konfidenzintervalle visualisieren
  - Korrelationskoeffizienten erkunden


  WIDGET-TYPEN
  ──────────────────────────────────────────────────────

  1. Slider Widget        — Einzelner Wert (z.B. n = 30)
  2. Range Slider         — Bereich (z.B. α = 0.01 bis 0.10)
  3. Distribution Explorer — Verteilung mit interaktiven Parametern
  4. Regression Explorer   — Datenpunkte verschieben, Regressionslinie sehen


  DATEI: src/lib/components/lesson/InteractiveWidget.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { pythonEngine } from '$lib/engine/pyodide-engine';
    import { debounce } from '$lib/utils/debounce';
    import type { InteractiveCell } from '$lib/types/cells';

    export let cell: InteractiveCell;

    // Parameter-Werte (reaktiv)
    let params: Record<string, number> = {};

    // Output
    let output: string = '';
    let plotData: string | null = null;
    let isRunning = false;
    let error: string | null = null;

    // Parameter initialisieren
    onMount(() => {
      for (const param of cell.parameters) {
        params[param.name] = param.default;
      }
      runCode();
    });

    // Debounced Code-Ausführung
    const debouncedRun = debounce(runCode, 150);

    function handleParamChange(name: string, value: number) {
      params[name] = value;
      params = params; // Trigger reactivity
      debouncedRun();
    }

    async function runCode() {
      if (!pythonEngine.isReady) return;

      isRunning = true;
      error = null;

      try {
        // Parameter in Python-Namespace setzen
        for (const [key, value] of Object.entries(params)) {
          await pythonEngine.setVariable(key, value);
        }

        // Code ausführen
        const result = await pythonEngine.execute(cell.code);

        if (result.error) {
          error = result.error;
        } else {
          output = result.stdout || '';
          plotData = result.plot || null;
        }
      } catch (e) {
        error = String(e);
      } finally {
        isRunning = false;
      }
    }
  </script>

  <div class="interactive-widget">
    <!-- Header -->
    <div class="widget-header">
      <span class="widget-icon">⚡</span>
      <span class="widget-title">{cell.title || 'Interaktiv'}</span>
      {#if isRunning}
        <span class="running-indicator">●</span>
      {/if}
    </div>

    <!-- Parameter Controls -->
    <div class="parameters">
      {#each cell.parameters as param}
        <div class="parameter">
          <label for={param.name}>
            {param.label || param.name}
            <span class="value">{params[param.name]?.toFixed(param.decimals || 0)}</span>
          </label>
          <input
            type="range"
            id={param.name}
            min={param.min}
            max={param.max}
            step={param.step}
            value={params[param.name]}
            on:input={(e) => handleParamChange(param.name, parseFloat(e.target.value))}
          />
          <div class="range-labels">
            <span>{param.min}</span>
            <span>{param.max}</span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Output -->
    <div class="output">
      {#if error}
        <div class="error">{error}</div>
      {:else if plotData}
        <img src={plotData} alt="Plot" class="plot" />
      {:else if output}
        <pre>{output}</pre>
      {/if}
    </div>
  </div>

  <style>
    .interactive-widget {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .widget-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .widget-icon {
      font-size: 1.2rem;
    }

    .widget-title {
      font-weight: 600;
    }

    .running-indicator {
      color: var(--color-warning);
      animation: blink 1s infinite;
    }

    @keyframes blink {
      50% { opacity: 0.3; }
    }

    .parameters {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .parameter label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .parameter .value {
      font-weight: 600;
      color: var(--accent-color);
      min-width: 60px;
      text-align: right;
    }

    .parameter input[type="range"] {
      width: 100%;
      height: 8px;
      -webkit-appearance: none;
      background: var(--bg-tertiary);
      border-radius: 4px;
      outline: none;
    }

    .parameter input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      background: var(--accent-color);
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.1s ease;
    }

    .parameter input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }

    .range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-top: 4px;
    }

    .output {
      padding: 16px;
      min-height: 200px;
    }

    .output img.plot {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    .output pre {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }

    .error {
      color: var(--color-error);
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }
  </style>


  BEISPIEL: WIDGET IN MARKDOWN DEFINIEREN
  ──────────────────────────────────────────────────────

  ```interactive
  title: Normalverteilung erkunden
  parameters:
    - name: mu
      label: Mittelwert (μ)
      min: -5
      max: 5
      default: 0
      step: 0.1
      decimals: 1
    - name: sigma
      label: Standardabweichung (σ)
      min: 0.1
      max: 3
      default: 1
      step: 0.1
      decimals: 1
    - name: n
      label: Stichprobengröße
      min: 10
      max: 1000
      default: 100
      step: 10
      decimals: 0
  ---
  import numpy as np
  import matplotlib.pyplot as plt

  # Parameter werden automatisch gesetzt: mu, sigma, n

  # Stichprobe ziehen
  sample = np.random.normal(mu, sigma, n)

  # Histogramm + Theoretische Verteilung
  fig, ax = plt.subplots(figsize=(8, 4))

  ax.hist(sample, bins=30, density=True, alpha=0.7, color='steelblue')

  x = np.linspace(mu - 4*sigma, mu + 4*sigma, 100)
  pdf = (1 / (sigma * np.sqrt(2*np.pi))) * np.exp(-0.5 * ((x - mu) / sigma)**2)
  ax.plot(x, pdf, 'r-', linewidth=2, label='Theoretische PDF')

  ax.set_xlabel('Wert')
  ax.set_ylabel('Dichte')
  ax.set_title(f'Normalverteilung N({mu}, {sigma}²) mit n={n}')
  ax.legend()

  plt.tight_layout()
  plt.show()
  ```


  DATEI: src/lib/parser/widget-parser.ts
  ──────────────────────────────────────────────────────

  import type { InteractiveCell, WidgetParameter } from '$lib/types/cells';
  import { parse as parseYAML } from 'yaml';

  export function parseInteractiveWidget(content: string): InteractiveCell | null {
    // Format: YAML-Header (bis ---) + Python-Code
    const parts = content.split('---');
    if (parts.length < 2) return null;

    const yamlPart = parts[0].trim();
    const codePart = parts.slice(1).join('---').trim();

    try {
      const config = parseYAML(yamlPart);

      return {
        type: 'interactive',
        id: crypto.randomUUID(),
        title: config.title || 'Interaktive Visualisierung',
        parameters: (config.parameters || []).map((p: any) => ({
          name: p.name,
          label: p.label || p.name,
          min: p.min ?? 0,
          max: p.max ?? 100,
          default: p.default ?? p.min ?? 0,
          step: p.step ?? 1,
          decimals: p.decimals ?? 0,
        })),
        code: codePart,
      };
    } catch (e) {
      console.error('Widget parsing error:', e);
      return null;
    }
  }


  WIDGET-TYPEN INTERFACE
  ──────────────────────────────────────────────────────

  // In src/lib/types/cells.ts

  export interface WidgetParameter {
    name: string;
    label: string;
    min: number;
    max: number;
    default: number;
    step: number;
    decimals: number;
  }

  export interface InteractiveCell {
    type: 'interactive';
    id: string;
    title: string;
    parameters: WidgetParameter[];
    code: string;
  }
