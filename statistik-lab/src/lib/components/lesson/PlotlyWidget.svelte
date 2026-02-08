<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Plotly from 'plotly.js-dist-min';

  export let data: any[] = [];
  export let layout: any = {};
  export let divId: string = 'plot-' + Math.random().toString(36).substr(2, 9);

  let plotDiv: HTMLElement;

  onMount(() => {
    Plotly.newPlot(plotDiv, data, {
      ...layout,
      autosize: true,
      margin: { t: 40, r: 30, l: 50, b: 50 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Inter, sans-serif' }
    }, { 
      responsive: true,
      displayModeBar: false,
      staticPlot: false
    });
  });

  onDestroy(() => {
    if (plotDiv) Plotly.purge(plotDiv);
  });

  $: if (plotDiv && data) {
    Plotly.react(plotDiv, data, layout);
  }
</script>

<div bind:this={plotDiv} id={divId} class="plotly-chart"></div>

<style>
  .plotly-chart {
    width: 100%;
    min-height: 350px;
    background: var(--bg-primary);
    border-radius: 8px;
  }
</style>
