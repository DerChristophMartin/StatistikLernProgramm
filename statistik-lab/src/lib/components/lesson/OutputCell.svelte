<script lang="ts">
  import type { ExecutionOutput } from '$lib/types/cells';

  export let output: ExecutionOutput;
</script>

<div class="output-container">
  {#if output.stdout}
    <div class="output-section stdout">
      <pre>{output.stdout}</pre>
    </div>
  {/if}

  {#if output.stderr}
    <div class="output-section stderr">
      <pre>{output.stderr}</pre>
    </div>
  {/if}

  {#if output.plots && output.plots.length > 0}
    <div class="output-section plots">
      {#each output.plots as plot}
        <img src="data:image/png;base64,{plot}" alt="Python Plot" />
      {/each}
    </div>
  {/if}

  {#if output.result && output.result !== 'None'}
    <div class="output-section result">
      <span class="label">Out:</span>
      <pre>{output.result}</pre>
    </div>
  {/if}

  <div class="execution-meta">
    Ausgeführt in {output.executionTime.toFixed(0)}ms • {new Date(output.timestamp).toLocaleTimeString()}
  </div>
</div>

<style>
  .output-container {
    margin-top: -12px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 8px 8px;
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }

  .output-section {
    margin-bottom: 12px;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .stdout {
    color: var(--text-primary);
  }

  .stderr {
    color: var(--color-error);
  }

  .result {
    display: flex;
    gap: 8px;
    color: var(--accent-color);
    font-weight: 500;
  }

  .label {
    opacity: 0.7;
  }

  .plots img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    background: white;
    padding: 8px;
    margin-bottom: 8px;
  }

  .execution-meta {
    margin-top: 8px;
    font-size: 0.7rem;
    color: var(--text-tertiary);
    text-align: right;
  }
</style>
