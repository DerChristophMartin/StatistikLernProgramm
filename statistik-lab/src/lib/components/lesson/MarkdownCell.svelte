<script lang="ts">
  export let content = '';
</script>

<div class="markdown-content">
  {@html content}
</div>

<style>
  .markdown-content {
    line-height: 1.6;
    color: var(--text-primary);
    font-size: 1.05rem;
  }

  .markdown-content :global(h1), 
  .markdown-content :global(h2), 
  .markdown-content :global(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }

  .markdown-content :global(h1) { font-size: 2rem; }
  .markdown-content :global(h2) { font-size: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
  .markdown-content :global(h3) { font-size: 1.25rem; }

  .markdown-content :global(p) {
    margin-bottom: 1em;
  }

  .markdown-content :global(ul), 
  .markdown-content :global(ol) {
    margin-bottom: 1em;
    padding-left: 2em;
  }

  .markdown-content :global(li) {
    margin-bottom: 0.5em;
  }

  .markdown-content :global(code:not(pre code)) {
    background: var(--bg-tertiary);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.9em;
  }
</style>
