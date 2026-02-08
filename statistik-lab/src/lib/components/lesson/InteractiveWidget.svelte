<script lang="ts">
  import type { WidgetCell } from '$lib/types/cells';
  import PlotlyWidget from './PlotlyWidget.svelte';

  export let cell: WidgetCell;

  // Mock-Daten für die Demonstration der Stat-Widgets
  const mockData = {
    distribution: [
      {
        x: [1, 2, 2, 3, 3, 3, 4, 4, 5],
        type: 'histogram',
        marker: { color: 'rgba(59, 130, 246, 0.7)' }
      }
    ],
    chart: [
      {
        x: [1, 2, 3, 4, 5],
        y: [10, 15, 13, 17, 21],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: '#3b82f6' }
      }
    ]
  };

  $: activeData = cell.widgetType === 'distribution' ? mockData.distribution : mockData.chart;
  $: activeLayout = {
    title: { text: `Visualisierung: ${cell.widgetType}`, font: { size: 14 } },
    template: 'plotly_white'
  };
</script>

<div class="interactive-widget" id="widget-{cell.id}">
  <div class="widget-header">
    <span class="widget-type">{cell.widgetType}</span>
    <h4 class="widget-title">Lab-Modul</h4>
  </div>
  
  <div class="widget-viewport">
    {#if cell.widgetType === 'distribution' || cell.widgetType === 'chart'}
      <PlotlyWidget data={activeData} layout={activeLayout} />
    {:else}
      <div class="placeholder">
        <p>Interaktives Widget: {cell.widgetType}</p>
        <small>Zukünftiges Modul für Simulationen und Rechner.</small>
      </div>
    {/if}
  </div>
</div>

<style>
  .interactive-widget {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);
  }

  .widget-header {
    padding: 12px 16px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .widget-type {
    font-size: 0.65rem;
    font-weight: 800;
    background: var(--accent-light);
    color: var(--accent-color);
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .widget-title {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 600;
  }

  .widget-viewport {
    min-height: 250px;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
  }

  .placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    text-align: center;
    padding: 20px;
  }

  .placeholder p { margin: 0; font-weight: 600; }
</style>
