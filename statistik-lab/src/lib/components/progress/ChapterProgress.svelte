<script lang="ts">
  import { progressStore } from '$lib/stores/progress.store';
  import { courseStore } from '$lib/stores/course.store';
  import type { LessonMeta } from '$lib/types/course';

  export let chapterId: string;
  export let lessons: LessonMeta[] = [];

  function isComplete(id: string) {
    return $progressStore.completedLessons.has(id);
  }

  function isActive(id: string) {
    return $courseStore.activeLessonId === id;
  }
</script>

<div class="lessons-list">
  {#each lessons as lesson (lesson.id)}
    <button 
      class="lesson-item" 
      class:active={isActive(lesson.id)}
      class:complete={isComplete(lesson.id)}
      on:click={() => courseStore.setActiveLesson('current', lesson.id)}
    >
      <div class="status-icon">
        {#if isComplete(lesson.id)}
          <span class="check">✓</span>
        {:else}
          <span class="bullet">•</span>
        {/if}
      </div>
      <div class="lesson-info">
        <span class="title">{lesson.title}</span>
        <span class="meta">{lesson.estimatedMinutes} Min.</span>
      </div>
    </button>
  {/each}
</div>

<style>
  .lessons-list {
    display: flex;
    flex-direction: column;
    padding-left: 12px;
  }

  .lesson-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    border-radius: 6px;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  .lesson-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .lesson-item.active {
    background: var(--accent-light);
    color: var(--accent-color);
    font-weight: 500;
  }

  .status-icon {
    width: 20px;
    display: flex;
    justify-content: center;
    font-weight: bold;
  }

  .complete .check {
    color: var(--color-success, #10b981);
  }

  .lesson-info {
    display: flex;
    flex-direction: column;
  }

  .meta {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }
</style>
