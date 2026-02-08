━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. PHASE 7 — FORTSCHRITT & GAMIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Gamification-Features motivieren Lernende durch sichtbaren Fortschritt,
  Achievements und Streaks. Das System ist bewusst ermutigend (nicht bestrafend).


  ACHIEVEMENT-TYPEN
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬───────────────────────────────────────────────────┐
  │ Typ                 │ Beispiele                                          │
  ├─────────────────────┼───────────────────────────────────────────────────┤
  │ Meilenstein         │ Erste Codezeile, Erstes Kapitel, Kurs abgeschlossen│
  │ Streak              │ 3 Tage, 7 Tage, 30 Tage am Stück gelernt          │
  │ Skill               │ 10 Aufgaben gelöst, 100 Codezeilen geschrieben    │
  │ Exploration         │ Alle Kapitel besucht, Datensatz importiert         │
  │ Perfektion          │ Quiz ohne Fehler, Alle Bonusaufgaben              │
  └─────────────────────┴───────────────────────────────────────────────────┘


  DATEI: src-tauri/src/models/achievement.rs
  ──────────────────────────────────────────────────────

  use serde::{Deserialize, Serialize};

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct Achievement {
      pub id: String,
      pub name: String,
      pub description: String,
      pub icon: String,           // SVG-Dateiname
      pub category: AchievementCategory,
      pub requirement: i32,       // Anzahl für Freischaltung
      pub current_progress: i32,  // Aktueller Fortschritt
      pub unlocked: bool,
      pub unlocked_at: Option<String>,
  }

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub enum AchievementCategory {
      Milestone,
      Streak,
      Skill,
      Exploration,
      Perfection,
  }

  // Vordefinierte Achievements
  pub fn get_default_achievements() -> Vec<Achievement> {
      vec![
          Achievement {
              id: "first_run".into(),
              name: "Erste Schritte".into(),
              description: "Führe deinen ersten Python-Code aus".into(),
              icon: "first-run.svg".into(),
              category: AchievementCategory::Milestone,
              requirement: 1,
              current_progress: 0,
              unlocked: false,
              unlocked_at: None,
          },
          Achievement {
              id: "chapter_complete".into(),
              name: "Kapitelmeister".into(),
              description: "Schließe ein ganzes Kapitel ab".into(),
              icon: "chapter-complete.svg".into(),
              category: AchievementCategory::Milestone,
              requirement: 1,
              current_progress: 0,
              unlocked: false,
              unlocked_at: None,
          },
          Achievement {
              id: "streak_7".into(),
              name: "Eine Woche dabei!".into(),
              description: "Lerne 7 Tage am Stück".into(),
              icon: "streak-7.svg".into(),
              category: AchievementCategory::Streak,
              requirement: 7,
              current_progress: 0,
              unlocked: false,
              unlocked_at: None,
          },
          Achievement {
              id: "code_100".into(),
              name: "Coder".into(),
              description: "Führe 100 Code-Zellen aus".into(),
              icon: "code-100.svg".into(),
              category: AchievementCategory::Skill,
              requirement: 100,
              current_progress: 0,
              unlocked: false,
              unlocked_at: None,
          },
          Achievement {
              id: "quiz_perfect".into(),
              name: "Perfektionist".into(),
              description: "Beantworte ein Quiz fehlerfrei".into(),
              icon: "quiz-perfect.svg".into(),
              category: AchievementCategory::Perfection,
              requirement: 1,
              current_progress: 0,
              unlocked: false,
              unlocked_at: None,
          },
      ]
  }


  DATEI: src-tauri/src/services/achievement_service.rs
  ──────────────────────────────────────────────────────

  use crate::db::connection::Database;
  use crate::models::achievement::{Achievement, get_default_achievements};
  use chrono::Utc;
  use rusqlite::params;

  pub struct AchievementService;

  impl AchievementService {
      /// Lädt alle Achievements (mit aktuellem Fortschritt)
      pub fn get_all(db: &Database) -> Vec<Achievement> {
          let defaults = get_default_achievements();
          let mut result = Vec::new();

          for default in defaults {
              let achievement = db.connection()
                  .query_row(
                      "SELECT progress, unlocked_at FROM achievements WHERE id = ?",
                      params![default.id],
                      |row| {
                          let progress: i32 = row.get(0)?;
                          let unlocked_at: Option<String> = row.get(1)?;
                          Ok((progress, unlocked_at))
                      },
                  )
                  .map(|(progress, unlocked_at)| {
                      Achievement {
                          current_progress: progress,
                          unlocked: unlocked_at.is_some(),
                          unlocked_at,
                          ..default.clone()
                      }
                  })
                  .unwrap_or(default);

              result.push(achievement);
          }

          result
      }

      /// Erhöht den Fortschritt eines Achievements
      pub fn increment_progress(
          db: &Database,
          achievement_id: &str,
          amount: i32,
      ) -> Option<Achievement> {
          let defaults = get_default_achievements();
          let default = defaults.iter().find(|a| a.id == achievement_id)?;

          // Aktuellen Fortschritt laden oder 0
          let current: i32 = db.connection()
              .query_row(
                  "SELECT progress FROM achievements WHERE id = ?",
                  params![achievement_id],
                  |row| row.get(0),
              )
              .unwrap_or(0);

          let new_progress = current + amount;
          let now_unlocked = new_progress >= default.requirement;

          let unlocked_at = if now_unlocked {
              Some(Utc::now().to_rfc3339())
          } else {
              None
          };

          db.connection().execute(
              "INSERT INTO achievements (id, name, progress, unlocked_at)
               VALUES (?1, ?2, ?3, ?4)
               ON CONFLICT(id) DO UPDATE SET 
                  progress = ?3,
                  unlocked_at = COALESCE(unlocked_at, ?4)",
              params![
                  achievement_id,
                  default.name,
                  new_progress,
                  unlocked_at
              ],
          ).ok()?;

          // Rückgabe wenn gerade freigeschaltet
          if now_unlocked && current < default.requirement {
              Some(Achievement {
                  current_progress: new_progress,
                  unlocked: true,
                  unlocked_at,
                  ..default.clone()
              })
          } else {
              None
          }
      }

      /// Aktualisiert den Streak
      pub fn update_streak(db: &Database) -> i32 {
          // Letzten Lernzeitpunkt lesen
          let last_date: Option<String> = db.connection()
              .query_row(
                  "SELECT value FROM settings WHERE key = 'last_learn_date'",
                  [],
                  |row| row.get(0),
              )
              .ok();

          let today = Utc::now().format("%Y-%m-%d").to_string();

          let current_streak: i32 = db.connection()
              .query_row(
                  "SELECT value FROM settings WHERE key = 'current_streak'",
                  [],
                  |row| {
                      let val: String = row.get(0)?;
                      Ok(val.parse().unwrap_or(0))
                  },
              )
              .unwrap_or(0);

          let new_streak = match last_date {
              Some(date) if date == today => current_streak, // Schon heute gelernt
              Some(date) => {
                  // Prüfen ob gestern
                  let yesterday = (Utc::now() - chrono::Duration::days(1))
                      .format("%Y-%m-%d").to_string();
                  if date == yesterday {
                      current_streak + 1
                  } else {
                      1 // Streak unterbrochen
                  }
              }
              None => 1, // Erster Tag
          };

          // Speichern
          db.connection().execute(
              "INSERT OR REPLACE INTO settings (key, value) VALUES ('last_learn_date', ?)",
              params![today],
          ).ok();

          db.connection().execute(
              "INSERT OR REPLACE INTO settings (key, value) VALUES ('current_streak', ?)",
              params![new_streak.to_string()],
          ).ok();

          // Streak-Achievements prüfen
          if new_streak >= 7 {
              Self::increment_progress(db, "streak_7", 0);
          }

          new_streak
      }
  }


  DATEI: src/lib/components/progress/AchievementBadge.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import type { Achievement } from '$lib/types/progress';

    export let achievement: Achievement;
    export let size: 'sm' | 'md' | 'lg' = 'md';

    $: sizeClass = {
      sm: 'w-10 h-10',
      md: 'w-16 h-16',
      lg: 'w-24 h-24',
    }[size];

    $: progressPercent = Math.min(
      100,
      (achievement.current_progress / achievement.requirement) * 100
    );
  </script>

  <div
    class="achievement-badge {sizeClass}"
    class:unlocked={achievement.unlocked}
    class:locked={!achievement.unlocked}
  >
    <!-- Icon -->
    <div class="icon-container">
      <img
        src="/images/achievements/{achievement.icon}"
        alt={achievement.name}
        class:grayscale={!achievement.unlocked}
      />

      {#if !achievement.unlocked}
        <!-- Progress Ring -->
        <svg class="progress-ring" viewBox="0 0 36 36">
          <path
            class="progress-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="progress-fill"
            stroke-dasharray="{progressPercent}, 100"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      {/if}
    </div>

    <!-- Tooltip -->
    <div class="tooltip">
      <strong>{achievement.name}</strong>
      <p>{achievement.description}</p>
      {#if !achievement.unlocked}
        <span class="progress-text">
          {achievement.current_progress}/{achievement.requirement}
        </span>
      {:else}
        <span class="unlocked-text">✓ Freigeschaltet</span>
      {/if}
    </div>
  </div>

  <style>
    .achievement-badge {
      position: relative;
      cursor: pointer;
    }

    .icon-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .icon-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: filter 0.3s ease;
    }

    .icon-container img.grayscale {
      filter: grayscale(100%) opacity(0.5);
    }

    .unlocked .icon-container img {
      filter: drop-shadow(0 0 8px var(--color-gold));
    }

    .progress-ring {
      position: absolute;
      top: -4px;
      left: -4px;
      width: calc(100% + 8px);
      height: calc(100% + 8px);
      transform: rotate(-90deg);
    }

    .progress-bg {
      fill: none;
      stroke: var(--bg-tertiary);
      stroke-width: 2;
    }

    .progress-fill {
      fill: none;
      stroke: var(--accent-color);
      stroke-width: 2;
      stroke-linecap: round;
      transition: stroke-dasharray 0.5s ease;
    }

    .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-8px);
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
      z-index: 100;
      text-align: center;
    }

    .achievement-badge:hover .tooltip {
      opacity: 1;
      visibility: visible;
    }

    .tooltip strong {
      display: block;
      margin-bottom: 4px;
    }

    .tooltip p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 8px 0;
    }

    .progress-text {
      color: var(--text-tertiary);
      font-size: 0.75rem;
    }

    .unlocked-text {
      color: var(--color-success);
      font-size: 0.75rem;
    }
  </style>


  DATEI: src/lib/components/progress/StreakCounter.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { onMount } from 'svelte';
    import { progressStore } from '$lib/stores/progress.store';

    $: streak = $progressStore.currentStreak;

    // Animation bei Streak-Erhöhung
    let animate = false;

    $: if (streak > 0) {
      animate = true;
      setTimeout(() => animate = false, 500);
    }
  </script>

  <div class="streak-counter" class:animate>
    <span class="fire-icon">🔥</span>
    <span class="streak-number">{streak}</span>
    <span class="streak-label">
      {streak === 1 ? 'Tag' : 'Tage'}
    </span>
  </div>

  <style>
    .streak-counter {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: linear-gradient(135deg, #ff6b35, #ff8c42);
      border-radius: 20px;
      color: white;
      font-weight: 600;
    }

    .streak-counter.animate {
      animation: pulse 0.5s ease;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .fire-icon {
      font-size: 1.2rem;
    }

    .streak-number {
      font-size: 1.1rem;
    }

    .streak-label {
      font-size: 0.75rem;
      opacity: 0.9;
    }
  </style>


  DATEI: src/lib/components/progress/Dashboard.svelte
  ──────────────────────────────────────────────────────

  <script lang="ts">
    import { progressStore } from '$lib/stores/progress.store';
    import AchievementBadge from './AchievementBadge.svelte';
    import StreakCounter from './StreakCounter.svelte';
    import ProgressBar from './ProgressBar.svelte';

    $: courseProgress = $progressStore.courseProgress;
    $: achievements = $progressStore.achievements;
    $: recentAchievements = achievements
      .filter(a => a.unlocked)
      .slice(0, 5);
    $: inProgressAchievements = achievements
      .filter(a => !a.unlocked && a.current_progress > 0)
      .slice(0, 3);
  </script>

  <div class="dashboard">
    <!-- Header mit Streak -->
    <header class="dashboard-header">
      <h1>Dein Fortschritt</h1>
      <StreakCounter />
    </header>

    <!-- Kursfortschritt -->
    <section class="progress-section">
      <h2>Kursfortschritt</h2>
      <div class="progress-card">
        <ProgressBar 
          value={courseProgress.completedLessons}
          max={courseProgress.totalLessons}
          showLabel
        />
        <div class="progress-stats">
          <div class="stat">
            <span class="stat-value">{courseProgress.completedLessons}</span>
            <span class="stat-label">Lektionen</span>
          </div>
          <div class="stat">
            <span class="stat-value">{Math.round(courseProgress.totalTime / 60)}h</span>
            <span class="stat-label">Lernzeit</span>
          </div>
          <div class="stat">
            <span class="stat-value">{courseProgress.totalScore}</span>
            <span class="stat-label">Punkte</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievements -->
    <section class="achievements-section">
      <h2>Errungenschaften</h2>

      {#if recentAchievements.length > 0}
        <div class="achievement-group">
          <h3>Freigeschaltet</h3>
          <div class="achievement-grid">
            {#each recentAchievements as achievement}
              <AchievementBadge {achievement} />
            {/each}
          </div>
        </div>
      {/if}

      {#if inProgressAchievements.length > 0}
        <div class="achievement-group">
          <h3>Fast geschafft</h3>
          <div class="achievement-grid">
            {#each inProgressAchievements as achievement}
              <AchievementBadge {achievement} />
            {/each}
          </div>
        </div>
      {/if}
    </section>
  </div>

  <style>
    .dashboard {
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      margin: 0;
    }

    section {
      margin-bottom: 32px;
    }

    section h2 {
      margin-bottom: 16px;
      font-size: 1.2rem;
    }

    .progress-card {
      background: var(--bg-secondary);
      border-radius: 12px;
      padding: 24px;
    }

    .progress-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 24px;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-color);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .achievement-group {
      margin-bottom: 24px;
    }

    .achievement-group h3 {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .achievement-grid {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  </style>
