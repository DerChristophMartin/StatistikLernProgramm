<script lang="ts">
  import { pyodideEngine } from '$lib/engine/pyodide-engine';
  
  $: engineStatus = $pyodideEngine;
</script>

<footer class="status-bar">
  <div class="left">
    <div class="status-item" class:ready={engineStatus === 'idle' || engineStatus === 'ready'}>
      <span class="dot"></span>
      Python: {engineStatus === 'ready' ? 'Bereit' : (engineStatus === 'loading' ? 'Lädt...' : (engineStatus === 'running' ? 'Beschäftigt' : 'Verbunden'))}
    </div>
  </div>

  <div class="right">
    <div class="status-item">UTF-8</div>
    <div class="status-item">Svelte 5</div>
  </div>
</footer>

<style>
  .status-bar {
    height: 28px;
    background: var(--accent-color);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .left, .right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
  }

  .ready .dot {
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
  }
</style>
