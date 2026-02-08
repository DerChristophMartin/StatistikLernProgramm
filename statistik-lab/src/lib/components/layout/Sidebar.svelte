<script lang="ts">
  import { courseStore } from '$lib/stores/course.store';
  import { progressStore } from '$lib/stores/progress.store';
  import { uiStore } from '$lib/stores/ui.store';
  import ChapterProgress from '../progress/ChapterProgress.svelte';

  let expandedChapters: Set<string> = new Set();

  function toggleChapter(chapterId: string) {
    if (expandedChapters.has(chapterId)) {
      expandedChapters.delete(chapterId);
    } else {
      expandedChapters.add(chapterId);
    }
    expandedChapters = expandedChapters; // Trigger reactivity
  }

  $: currentCourse = $courseStore.currentCourse;
</script>

<div class="sidebar-wrapper">
  <div class="sidebar-header">
    <h2 class="sidebar-title">{currentCourse?.title ?? 'Katalog'}</h2>
    <div class="progress-info">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {$progressStore.overallPercent}%"></div>
      </div>
      <span class="percent">{$progressStore.overallPercent}%</span>
    </div>
  </div>

  <nav class="course-nav">
    {#if currentCourse}
      {#each currentCourse.chapters as chapter (chapter.id)}
        <div class="chapter-item">
          <button class="chapter-toggle" on:click={() => toggleChapter(chapter.id)}>
            <span class="icon">{expandedChapters.has(chapter.id) ? '▼' : '▶'}</span>
            <span class="chapter-name">{chapter.title}</span>
          </button>
          
          {#if expandedChapters.has(chapter.id)}
            <ChapterProgress chapterId={chapter.id} lessons={chapter.lessons} />
          {/if}
        </div>
      {/each}
    {:else}
      <div class="empty-state">Lade Kurse...</div>
    {/if}
  </nav>
</div>

<style>
  .sidebar-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .sidebar-title {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .progress-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .progress-bar {
    flex: 1;
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent-color);
    transition: width 0.3s ease;
  }

  .percent {
    font-size: 0.8rem;
    color: var(--text-secondary);
    min-width: 30px;
  }

  .course-nav {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
  }

  .chapter-item {
    margin-bottom: 4px;
  }

  .chapter-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: var(--text-primary);
    font-weight: 500;
  }

  .chapter-toggle:hover {
    background: var(--bg-hover);
  }

  .icon {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    width: 12px;
  }

  .empty-state {
    padding: 20px;
    color: var(--text-tertiary);
    text-align: center;
  }
</style>
