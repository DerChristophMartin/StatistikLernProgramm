<script lang="ts">
  import type { HintCell } from '$lib/types/cells';

  export let cell: HintCell;
</script>

<details class="hint-cell" open={cell.expanded}>
  <summary>
    <span class="icon">💡</span>
    <span class="title">{cell.title || 'Hinweis'}</span>
    <span class="toggle-icon">▼</span>
  </summary>
  <div class="content">
    {@html cell.content}
  </div>
</details>

<style>
  .hint-cell {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 24px;
    overflow: hidden;
  }

  summary {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    user-select: none;
    list-style: none;
  }

  summary::-webkit-details-marker { display: none; }

  .icon { font-size: 1.1rem; }
  .title { flex: 1; font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
  
  .toggle-icon { 
    font-size: 0.7rem; 
    transition: transform 0.2s; 
    opacity: 0.5;
  }

  .hint-cell[open] .toggle-icon { transform: rotate(180deg); }

  .content {
    padding: 0 16px 16px 44px;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }
</style>
