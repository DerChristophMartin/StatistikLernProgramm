<script lang="ts">
  import { uiStore } from '$lib/stores/ui.store';
</script>

<div class="toolbar-content">
  <button on:click={() => uiStore.toggleSidebar()}>☰</button>
  <span class="title">StatistikLab</span>
</div>

<style>
  .toolbar-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 1rem;
    height: 100%;
  }
  .title { font-weight: bold; }
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
  }
</style>
