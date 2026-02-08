<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { lessonStore } from '$lib/stores/lesson.store';
  import { pyodideEngine } from '$lib/engine/pyodide-engine';
  import MarkdownCell from './MarkdownCell.svelte';
  import CodeCell from './CodeCell.svelte';
  import ExerciseCell from './ExerciseCell.svelte';
  import QuizCell from './QuizCell.svelte';
  import OutputCell from './OutputCell.svelte';

  export let lessonId: string;
  export let courseId: string;

  $: cells = $lessonStore.cells;
  $: isLoading = $lessonStore.isLoading;

  const dispatch = createEventDispatcher();

  onMount(async () => {
    await lessonStore.load(courseId, lessonId);
  });

  async function runCell(cellId: string, code: string) {
    try {
      const result = await pyodideEngine.runCode(code);
      lessonStore.setCellOutput(cellId, {
        stdout: result.stdout,
        stderr: result.stderr,
        result: result.result,
        plots: result.plots,
        executionTime: result.executionTime,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('Execution failed:', error);
    }
  }
</script>

<div class="lesson-view">
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Lektion wird geladen...</p>
    </div>
  {:else if $lessonStore.error}
    <div class="error-state">
      <h3>Fehler beim Laden</h3>
      <p>{$lessonStore.error}</p>
      <button on:click={() => lessonStore.load(courseId, lessonId)}>Erneut versuchen</button>
    </div>
  {:else}
    <div class="cells-container">
      {#each cells as cell (cell.id)}
        <div class="cell-wrapper" id="cell-{cell.id}">
          {#if cell.type === 'markdown'}
            <MarkdownCell content={cell.content} />
          {:else if cell.type === 'code'}
            <CodeCell
              code={cell.code}
              editable={cell.interactive}
              on:run={(e) => runCell(cell.id, e.detail)}
            />
            {#if cell.output}
              <OutputCell output={cell.output} />
            {/if}
          {:else if cell.type === 'exercise'}
            <ExerciseCell 
              {cell}
              on:run={(e) => runCell(cell.id, e.detail)}
            />
          {:else if cell.type === 'quiz'}
            <QuizCell {cell} />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lesson-view {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .loading, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 16px;
    color: var(--text-secondary);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--bg-tertiary);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .cells-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .cell-wrapper {
    width: 100%;
  }

  button {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
