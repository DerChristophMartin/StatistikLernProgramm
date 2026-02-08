<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Toolbar from './Toolbar.svelte';
  import StatusBar from './StatusBar.svelte';
  import { uiStore } from '$lib/stores/ui.store';

  let sidebarWidth = 280;
</script>

<div class="app-shell">
  <!-- Toolbar -->
  <header class="toolbar">
    <Toolbar />
  </header>

  <div class="app-body">
    <!-- Sidebar -->
    {#if $uiStore.sidebarOpen}
      <aside class="sidebar" style="width: {sidebarWidth}px">
        <Sidebar />
      </aside>
    {/if}

    <!-- Main Content -->
    <main class="content">
      <slot />
    </main>
  </div>

  <!-- Status Bar -->
  <footer class="status-bar">
    <StatusBar />
  </footer>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
  }

  .app-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    flex-shrink: 0;
    border-right: 1px solid var(--border-color);
    overflow-y: auto;
    background: var(--bg-secondary);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    background: var(--bg-primary);
  }

  .toolbar {
    height: 48px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .status-bar {
    height: 28px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }
</style>
