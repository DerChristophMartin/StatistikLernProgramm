<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CodeEditor from '../editor/CodeEditor.svelte';

  export let code = '';
  export let editable = true;

  const dispatch = createEventDispatcher();
  let editor: CodeEditor;

  function handleRun() {
    dispatch('run', editor.getCode());
  }
</script>

<div class="code-cell" class:interactive={editable}>
  <div class="editor-header">
    <span class="lang-label">Python</span>
    {#if editable}
      <button class="run-btn" on:click={handleRun}>
        <span class="icon">▶</span> Ausführen
      </button>
    {/if}
  </div>
  
  <CodeEditor 
    bind:this={editor}
    {code} 
    {editable} 
    on:run={(e) => dispatch('run', e.detail)}
  />
</div>

<style>
  .code-cell {
    margin-bottom: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    overflow: hidden;
  }

  .interactive {
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }

  .lang-label {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }

  .run-btn {
    display: flex;
    align-items: center;
    gap: 6px;
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

  .run-btn:hover {
    background: #059669;
  }

  .run-btn .icon {
    font-size: 0.7rem;
  }
</style>
