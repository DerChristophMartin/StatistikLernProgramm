<script lang="ts">
  import type { QuizCell } from '$lib/types/cells';

  export let cell: QuizCell;

  function toggleOption(index: number) {
    if (cell.answered) return;
    
    if (cell.multiSelect) {
      cell.options[index].selected = !cell.options[index].selected;
    } else {
      cell.options.forEach((opt, i) => opt.selected = i === index);
    }
    cell = cell; // Trigger reactivity
  }

  function check() {
    cell.answered = true;
    cell.correct = cell.options.every(opt => opt.selected === opt.correct);
    cell = cell;
  }
</script>

<div class="quiz-cell" class:correct={cell.answered && cell.correct} class:incorrect={cell.answered && !cell.correct}>
  <h3 class="question">{cell.question}</h3>
  
  <div class="options">
    {#each cell.options as option, i}
      <button 
        class="option-item" 
        class:selected={option.selected}
        class:correct-hint={cell.answered && option.correct}
        class:incorrect-hint={cell.answered && option.selected && !option.correct}
        on:click={() => toggleOption(i)}
      >
        <div class="checkbox" class:radio={!cell.multiSelect}>
          {#if option.selected}
            <span class="dot"></span>
          {{/if}
        </div>
        <span class="text">{option.text}</span>
      </button>
    {/each}
  </div>

  {#if !cell.answered}
    <button class="check-btn" on:click={check} disabled={!cell.options.some(o => o.selected)}>
      Prüfen
    </button>
  {/if}

  {#if cell.answered}
    <div class="feedback">
      <div class="status">
        {cell.correct ? '🎉 Richtig!' : '❌ Nicht ganz richtig.'}
      </div>
      <p class="explanation">{cell.explanation}</p>
    </div>
  {/if}
</div>

<style>
  .quiz-cell {
    padding: 24px;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .quiz-cell.correct { border-color: var(--color-success); }
  .quiz-cell.incorrect { border-color: var(--color-error); }

  .question {
    margin: 0 0 20px 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .option-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }

  .option-item:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--accent-color);
  }

  .option-item.selected {
    border-color: var(--accent-color);
    background: var(--accent-light);
  }

  .option-item.correct-hint { background: #dcfce7; border-color: #10b981; }
  .option-item.incorrect-hint { background: #fee2e2; border-color: #ef4444; }

  .checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .checkbox.radio { border-radius: 50%; }

  .dot {
    width: 10px;
    height: 10px;
    background: var(--accent-color);
    border-radius: 2px;
  }

  .radio .dot { border-radius: 50%; }

  .check-btn {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .check-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .feedback {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }

  .status {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 8px;
  }

  .explanation {
    color: var(--text-secondary);
    line-height: 1.5;
  }
</style>
