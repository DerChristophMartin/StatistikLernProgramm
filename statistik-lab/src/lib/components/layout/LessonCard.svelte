<script lang="ts">
  import type { LessonMeta } from '$lib/types/course';
  import { progressStore } from '$lib/stores/progress.store';

  export let lesson: LessonMeta;

  $: completed = $progressStore.completedLessons.has(lesson.id);
</script>

<div class="lesson-card" class:completed>
  <div class="card-header">
    <span class="difficultyTag {lesson.difficulty}">{lesson.difficulty}</span>
    {#if completed}
      <span class="completed-label">✓ Abgeschlossen</span>
    {/if}
  </div>
  
  <h3 class="title">{lesson.title}</h3>
  
  <div class="card-footer">
    <span class="time">⏱ {lesson.estimatedMinutes} Min.</span>
    <button class="start-btn" on:click>
      {completed ? 'Wiederholen' : 'Starten'}
    </button>
  </div>
</div>

<style>
  .lesson-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .lesson-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .difficultyTag {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 99px;
    text-transform: capitalize;
  }

  .difficultyTag.beginner { background: #dcfce7; color: #166534; }
  .difficultyTag.intermediate { background: #fef9c3; color: #854d0e; }
  .difficultyTag.advanced { background: #fee2e2; color: #991b1b; }

  .completed-label {
    font-size: 0.75rem;
    color: var(--color-success);
    font-weight: 600;
  }

  .title {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
  }

  .time {
    font-size: 0.85rem;
    color: var(--text-tertiary);
  }

  .start-btn {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }

  .start-btn:hover {
    background: var(--accent-hover);
  }
</style>
