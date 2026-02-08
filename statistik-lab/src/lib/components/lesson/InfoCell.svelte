<script lang="ts">
  import type { InfoCell } from '$lib/types/cells';

  export let cell: InfoCell;

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    tip: '💡',
    important: '❗'
  };
</script>

<div class="info-block {cell.variant}">
  <div class="icon">{icons[cell.variant] || icons.info}</div>
  <div class="content">
    {#if cell.title}
      <h4 class="title">{cell.title}</h4>
    {/if}
    <div class="body">{@html cell.content}</div>
  </div>
</div>

<style>
  .info-block {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    border-left: 4px solid;
  }

  .info { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }
  .warning { background: rgba(245, 158, 11, 0.1); border-color: #f59e0b; }
  .tip { background: rgba(16, 185, 129, 0.1); border-color: #10b981; }
  .important { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

  .icon { font-size: 1.25rem; flex-shrink: 0; }
  
  .content { flex: 1; }
  .title { margin: 0 0 4px 0; font-size: 0.9rem; font-weight: bold; text-transform: uppercase; }
  .body { font-size: 0.95rem; line-height: 1.5; color: var(--text-primary); }
</style>
