<script lang="ts">
  import { uiStore } from '$lib/stores/ui.store';
</script>

<header class="toolbar">
  <div class="left-section">
    <button class="icon-btn" on:click={() => uiStore.toggleSidebar()} title="Menü umschalten">
      <span class="icon">☰</span>
    </button>
    <div class="breadcrumbs">
      <span class="crumb">Basics</span>
      <span class="separator">/</span>
      <span class="crumb active">Einführung</span>
    </div>
  </div>

  <div class="right-section">
    <button class="icon-btn" title="Nachrichten">
      <span class="icon">🔔</span>
    </button>
    <button class="icon-btn" title="Profil">
      <span class="icon">👤</span>
    </button>
  </div>
</header>

<style>
  .toolbar {
    height: 56px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    z-index: 10;
  }

  .left-section, .right-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 1.25rem;
    padding: 6px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text-tertiary);
  }

  .crumb.active { color: var(--text-primary); font-weight: 600; }
  .separator { font-size: 0.8rem; opacity: 0.5; }
</style>
