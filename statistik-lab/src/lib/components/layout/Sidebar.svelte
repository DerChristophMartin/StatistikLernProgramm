<script lang="ts">
  import { uiStore } from '$lib/stores/ui.store';
  import { courseStore } from '$lib/stores/course.store';
  import Spinner from '../common/Spinner.svelte';

  $: chapters = $courseStore.currentChapters;
  $: isLoading = $courseStore.isLoading;
  $: currentCourse = $courseStore.currentCourse;
</script>

<aside class="sidebar" class:collapsed={!$uiStore.sidebarOpen}>
  <div class="sidebar-header">
    <div class="logo-area">
      <span class="icon">📊</span>
      <span class="app-name">StatistikLab</span>
    </div>
  </div>

  <div class="sidebar-content">
    {#if isLoading}
      <div class="loading-state">
        <Spinner />
      </div>
    {:else if currentCourse}
      <div class="course-info">
        <h3>{currentCourse.title}</h3>
        <p class="description">{currentCourse.description}</p>
      </div>

      <nav class="course-nav">
        {#each chapters as chapter}
          <div class="chapter-group">
            <h4 class="chapter-title">{chapter.title}</h4>
            <ul class="lesson-list">
              {#each chapter.lessons as lesson}
                <li>
                  <button class="lesson-btn">
                    <span class="status-icon">○</span>
                    {lesson.title}
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </nav>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 280px;
    height: 100%;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 0;
    border-right: none;
  }

  .sidebar-header {
    padding: 24px;
    border-bottom: 1px solid var(--border-color);
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon { font-size: 1.5rem; }
  .app-name { font-weight: 700; font-size: 1.25rem; color: var(--text-primary); }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 0;
  }

  .course-info {
    padding: 0 24px 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .course-info h3 { margin: 0 0 8px; font-size: 1rem; color: var(--text-primary); }
  .course-info .description { margin: 0; font-size: 0.85rem; color: var(--text-tertiary); line-height: 1.4; }

  .course-nav { padding: 20px 12px; }

  .chapter-group { margin-bottom: 24px; }
  .chapter-title { 
    margin: 0 0 8px 12px; 
    font-size: 0.75rem; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    color: var(--text-tertiary); 
  }

  .lesson-list { list-style: none; padding: 0; margin: 0; }
  .lesson-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }

  .lesson-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  
  .status-icon { font-size: 1rem; opacity: 0.5; }

  .loading-state { display: flex; justify-content: center; padding: 40px; }
</style>
