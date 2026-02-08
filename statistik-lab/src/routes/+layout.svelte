<script lang="ts">
  import AppShell from '$lib/components/layout/AppShell.svelte';
  import '../../src/app.css';
</script>

<AppShell>
  <slot />
</AppShell>

<style>
  :global(:root) {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --bg-hover: #475569;
    --bg-active: #1e293b;
    
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    
    --accent-color: #3b82f6;
    --accent-light: rgba(59, 130, 246, 0.1);
    
    --border-color: #334155;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    
    --color-success: #10b981;
    --color-error: #ef4444;
    
    --font-sans: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-sans);
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  :global(*) {
    box-sizing: border-box;
  }
</style>
