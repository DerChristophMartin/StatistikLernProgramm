<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ExerciseCell } from '$lib/types/cells';
  import CodeEditor from '../editor/CodeEditor.svelte';
  import OutputCell from './OutputCell.svelte';

  export let cell: ExerciseCell;

  const dispatch = createEventDispatcher();
  let editor: CodeEditor;

  function handleRun() {
    dispatch('run', editor.getCode());
  }
</script>

<div class="exercise-cell" class:solved={cell.solved}>
  <div class="card-header">
    <div class="title-group">
      <span class="badge">Aufgabe</span>
      <h3 class="title">Bringen Sie es in die Praxis</h3>
    </div>
    {#if cell.solved}
      <span class="status-solved">✓ Gelöst!</span>
    {/if}
  </div>

  {#if cell.description}
    <div class="description">{@html cell.description}</div>
  {/if}

  <div class="editor-section">
    <div class="editor-toolbar">
      <span class="lang-label">Python Scaffolding</span>
      <div class="actions">
        <button class="run-btn" on:click={handleRun}>▶ Ausführen</button>
      </div>
    </div>
    <CodeEditor 
      bind:this={editor}
      code={cell.initialCode} 
      editable={true} 
      on:run={(e) => dispatch('run', e.detail)}
    />
  </div>

  {#if cell.output}
    <OutputCell output={cell.output} />
  {/if}

  {#if cell.hint}
    <details class="hint-details">
      <summary>Tipp anzeigen</summary>
      <div class="hint-content">{@html cell.hint}</div>
    </details>
  {/if}
</div>

<style>
  .exercise-cell {
    background: var(--bg-secondary);
    border: 2px solid var(--accent-light, #3b82f644);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);
  }

  .exercise-cell.solved {
    border-color: var(--color-success, #10b981);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }

  .title-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .badge {
    background: var(--accent-color);
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .title { margin: 0; font-size: 1.1rem; color: var(--text-primary); }

  .status-solved {
    color: var(--color-success);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .description {
    padding: 20px;
    line-height: 1.6;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .editor-section {
    background: var(--bg-primary);
  }

  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }

  .lang-label { 
    font-size: 0.7rem; 
    color: var(--text-tertiary); 
    font-family: var(--font-mono); 
    text-transform: uppercase;
  }

  .run-btn {
    background: var(--color-success, #10b981);
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .run-btn:hover { background: #059669; }

  .hint-details {
    margin: 16px 20px;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border-radius: 8px;
    font-size: 0.9rem;
  }

  summary { 
    cursor: pointer; 
    color: var(--accent-color); 
    font-weight: 600;
    user-select: none;
  }
  
  .hint-content { 
    padding-top: 10px; 
    color: var(--text-secondary); 
    line-height: 1.5;
  }
</style>
