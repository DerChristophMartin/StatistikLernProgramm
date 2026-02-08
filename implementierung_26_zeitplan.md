━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
26. ZEITPLAN & MEILENSTEINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Geschätzte Entwicklungszeit: 12-16 Wochen (1 Entwickler, Vollzeit)
  Empfohlene Vorgehensweise: Iterativ mit frühem MVP


  ═══════════════════════════════════════════════════════
  PHASE 1: MVP (MINIMUM VIABLE PRODUCT)
  Dauer: 4-5 Wochen
  ═══════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 1-2: GRUNDGERÜST                                                     │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ Tauri + Svelte Projekt aufsetzen                                         │
  │ □ Basis-Layout (AppShell, Sidebar, Content Area)                          │
  │ □ Markdown-Rendering mit KaTeX                                            │
  │ □ Kursstruktur laden (YAML + Markdown)                                    │
  │ □ Navigation zwischen Lektionen                                            │
  │                                                                             │
  │ MEILENSTEIN: App zeigt statischen Kursinhalt an                           │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 3-4: PYTHON-ENGINE                                                   │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ Pyodide Integration                                                      │
  │ □ Code-Zellen mit CodeMirror                                              │
  │ □ Code ausführen + Output anzeigen                                        │
  │ □ Matplotlib-Plots rendern                                                │
  │ □ Fehlerbehandlung und -anzeige                                           │
  │                                                                             │
  │ MEILENSTEIN: User können Python-Code ausführen                            │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 5: MVP POLISH                                                        │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ SQLite Datenbank einrichten                                             │
  │ □ Basis-Fortschritt speichern (Lektion besucht/abgeschlossen)             │
  │ □ Dark/Light Theme                                                         │
  │ □ Erster Statistik-Kurs (2-3 Lektionen)                                   │
  │ □ Windows/Mac Build testen                                                 │
  │                                                                             │
  │ MEILENSTEIN: ✨ MVP RELEASE (Alpha) ✨                                     │
  │ Benutzer können den Kurs durcharbeiten und Code ausführen                  │
  └─────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════
  PHASE 2: INTERAKTIVITÄT
  Dauer: 3-4 Wochen
  ═══════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 6-7: ÜBUNGEN & QUIZ                                                  │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ Quiz-System (Multiple Choice, True/False)                               │
  │ □ Übungsaufgaben mit Validierung                                          │
  │ □ Hinweis-System                                                           │
  │ □ Punkte-Berechnung                                                        │
  │                                                                             │
  │ MEILENSTEIN: Lernfortschritt wird gamifiziert                             │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 8-9: INTERAKTIVE WIDGETS                                             │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ Slider-Widget-System                                                     │
  │ □ Parameter → Python-Variable Binding                                      │
  │ □ Live-Updates bei Slider-Änderung                                        │
  │ □ 3-5 fertige interaktive Visualisierungen                                │
  │                                                                             │
  │ MEILENSTEIN: ✨ BETA RELEASE ✨                                            │
  │ Voll funktionale Lernapp mit Interaktivität                               │
  └─────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════
  PHASE 3: ERWEITERTE FEATURES
  Dauer: 3-4 Wochen
  ═══════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 10-11: GAMIFICATION & POLISH                                         │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ Achievement-System                                                       │
  │ □ Streak-Tracking                                                          │
  │ □ Progress-Dashboard                                                       │
  │ □ Einstellungen (Schriftgröße, Editor-Optionen)                           │
  │ □ Keyboard-Shortcuts                                                       │
  │ □ Suche (Cmd+K)                                                            │
  │                                                                             │
  │ MEILENSTEIN: Premium-Feel und Motivation                                  │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 12-13: EXPORT & EDITOR                                               │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ PDF-Export                                                               │
  │ □ HTML-Export                                                              │
  │ □ Basis Kurs-Editor (optional, kann später kommen)                        │
  │ □ Datensatz-Import (CSV)                                                   │
  │                                                                             │
  │ MEILENSTEIN: Content-Erstellung möglich                                   │
  └─────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════
  PHASE 4: PRODUCTION READY
  Dauer: 2-3 Wochen
  ═══════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 14-15: TESTING & STABILISIERUNG                                      │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ Unit Tests (Frontend + Backend)                                         │
  │ □ E2E Tests mit Playwright                                                │
  │ □ Performance-Optimierung                                                  │
  │ □ Memory-Leak-Hunting                                                      │
  │ □ Cross-Platform Testing                                                   │
  │                                                                             │
  │ MEILENSTEIN: Stabile, getestete Codebase                                  │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ WOCHE 16: RELEASE                                                          │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ □ CI/CD Pipeline fertigstellen                                            │
  │ □ Code-Signing (macOS, Windows)                                           │
  │ □ Auto-Updater einrichten                                                  │
  │ □ Landing Page / Download-Seite                                           │
  │ □ Dokumentation                                                            │
  │ □ GitHub Releases                                                          │
  │                                                                             │
  │ MEILENSTEIN: ✨ VERSION 1.0 RELEASE ✨                                     │
  └─────────────────────────────────────────────────────────────────────────────┘


  ═══════════════════════════════════════════════════════
  GANTT-ÜBERSICHT
  ═══════════════════════════════════════════════════════

  Woche   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16
          │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
  Setup   ████████                                                      
  UI          ████████                                                  
  Python          ████████                                              
  MVP                   ████                                            
          ─────────────────────────────   MVP RELEASE ▲
  Quiz                      ████████                                    
  Widgets                         ████████                              
          ─────────────────────────────────────────────   BETA ▲
  Gamify                                  ████████                      
  Export                                        ████████                
  Testing                                             ████████          
  Release                                                   ████        
          ─────────────────────────────────────────────────────────   1.0 ▲


  ═══════════════════════════════════════════════════════
  PRIORISIERUNGS-MATRIX
  ═══════════════════════════════════════════════════════

  MÜSSEN (MVP):
  ├── Kursnavigation
  ├── Markdown + LaTeX Rendering
  ├── Python-Code ausführen
  ├── Plots anzeigen
  └── Basis-Fortschritt

  SOLLTEN (Beta):
  ├── Quiz-System
  ├── Interaktive Widgets
  ├── Dark/Light Theme
  └── Einstellungen

  KÖNNEN (v1.0):
  ├── Gamification (Achievements, Streaks)
  ├── PDF/HTML Export
  ├── Suche
  └── Keyboard-Shortcuts

  SPÄTER (Post-Launch):
  ├── Kurs-Editor
  ├── Cloud Sync
  ├── Community-Kurse
  └── Mobile App (Flutter?)


  ═══════════════════════════════════════════════════════
  RISIKEN & MITIGATION
  ═══════════════════════════════════════════════════════

  ┌─────────────────────────┬───────────┬────────────────────────────────────┐
  │ Risiko                  │ Impact    │ Mitigation                         │
  ├─────────────────────────┼───────────┼────────────────────────────────────┤
  │ Pyodide-Bugs            │ Hoch      │ Früh testen, Fallback vorbereiten  │
  │ Performance-Probleme    │ Mittel    │ Web Worker, Profiling              │
  │ Cross-Platform-Issues   │ Mittel    │ Früh auf allen OS testen           │
  │ Scope Creep             │ Hoch      │ MVP-Fokus, strenge Priorisierung   │
  │ Content-Erstellung      │ Mittel    │ Parallel zum Development starten   │
  └─────────────────────────┴───────────┴────────────────────────────────────┘


  ═══════════════════════════════════════════════════════
  ERFOLGSKRITERIEN v1.0
  ═══════════════════════════════════════════════════════

  ✓ App startet in < 3 Sekunden
  ✓ Python-Code läuft zuverlässig (99%+ Erfolgsrate)
  ✓ Mindestens 1 vollständiger Statistik-Kurs (10+ Lektionen)
  ✓ Funktioniert offline
  ✓ Installer für Windows, macOS, Linux
  ✓ < 100 MB Installer-Größe
  ✓ Keine kritischen Bugs
  ✓ ≥ 4.0 Rating (falls Store-Release)
