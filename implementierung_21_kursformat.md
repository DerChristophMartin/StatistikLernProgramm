━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
21. KURSFORMAT-SPEZIFIKATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ÜBERSICHT
  ──────────────────────────────────────────────────────
  Kurse bestehen aus YAML-Metadaten und Markdown-Dateien.
  Das Format ist absichtlich einfach gehalten, damit Kurse
  auch ohne die App bearbeitet werden können.


  KURSSTRUKTUR IM DATEISYSTEM
  ──────────────────────────────────────────────────────

  mein-kurs/
  ├── kurs.yaml                 # Kurs-Metadaten
  ├── cover.png                 # Vorschaubild (optional)
  ├── 01-kapitel-eins/
  │   ├── kapitel.yaml          # Kapitel-Metadaten
  │   ├── 01-einfuehrung.md     # Lektion
  │   ├── 02-grundlagen.md      # Lektion
  │   └── 03-uebungen.md        # Lektion
  ├── 02-kapitel-zwei/
  │   ├── kapitel.yaml
  │   ├── 01-thema-a.md
  │   └── 02-thema-b.md
  └── datasets/                 # Kurseigene Datensätze
      ├── beispiel.csv
      └── testdaten.json


  KURS-METADATEN (kurs.yaml)
  ──────────────────────────────────────────────────────

  id: statistik-grundlagen
  title: "Statistik Grundlagen"
  description: |
    Ein umfassender Einstiegskurs in die Statistik.
    Lerne die wichtigsten Konzepte von Grund auf.
  author: "Max Mustermann"
  version: "1.2.0"
  language: "de"
  difficulty: "beginner"  # beginner | intermediate | advanced
  estimated_hours: 20
  tags:
    - statistik
    - datenanalyse
    - python
  prerequisites: []
  cover_image: "cover.png"
  license: "CC BY-SA 4.0"
  repository: "https://github.com/user/statistik-kurs"


  KAPITEL-METADATEN (kapitel.yaml)
  ──────────────────────────────────────────────────────

  id: deskriptive-statistik
  title: "Deskriptive Statistik"
  description: "Lagemaße, Streuungsmaße und Visualisierung"
  order: 2
  icon: "📊"  # Optional: Emoji oder Icon-Name
  learning_goals:
    - "Mittelwert, Median und Modus berechnen"
    - "Varianz und Standardabweichung verstehen"
    - "Histogramme und Boxplots erstellen"


  LEKTIONS-FORMAT (Markdown + Frontmatter)
  ──────────────────────────────────────────────────────

  ---
  id: mittelwert-und-median
  title: "Mittelwert und Median"
  order: 1
  estimated_time: 15  # Minuten
  difficulty: beginner
  tags:
    - lagemaße
  ---

  # Mittelwert und Median

  In dieser Lektion lernst du die zwei wichtigsten Lagemaße kennen.

  ## Der Mittelwert

  Der **arithmetische Mittelwert** (auch "Durchschnitt") ist die Summe
  aller Werte geteilt durch die Anzahl der Werte:

  $$
  \bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i
  $$

  ```python
  import numpy as np

  daten = [4, 8, 6, 5, 3, 2, 8, 9]
  mittelwert = np.mean(daten)
  print(f"Mittelwert: {mittelwert}")
  ```

  ## Der Median

  Der **Median** ist der Wert in der Mitte einer sortierten Datenreihe.

  :::tip
  Der Median ist robust gegenüber Ausreißern!
  :::

  ```python
  median = np.median(daten)
  print(f"Median: {median}")
  ```

  ## Vergleich

  ```interactive
  title: Mittelwert vs Median
  parameters:
    - name: ausreisser
      label: Ausreißer-Wert
      min: 0
      max: 100
      default: 10
  ---
  import numpy as np
  import matplotlib.pyplot as plt

  daten = [4, 8, 6, 5, 3, 2, 8, ausreisser]

  fig, ax = plt.subplots()
  ax.bar(['Daten'], [np.mean(daten)], label='Mittelwert', alpha=0.7)
  ax.axhline(np.median(daten), color='red', label='Median')
  ax.legend()
  plt.show()
  ```

  ## Quiz

  ```quiz
  type: multiple-choice
  question: Welches Lagemaß ist robust gegenüber Ausreißern?
  points: 10
  options:
    - text: Mittelwert
      correct: false
    - text: Median
      correct: true
    - text: Beide gleich
      correct: false
  ```


  SPEZIELLE BLOCK-TYPEN
  ──────────────────────────────────────────────────────

  # Ausführbarer Python-Code
  ```python
  # Wird mit Play-Button ausgeführt
  print("Hello, World!")
  ```

  # Nicht-ausführbarer Code (nur Anzeige)
  ```python:readonly
  # Nur zur Illustration, kein Run-Button
  beispiel_code()
  ```

  # Quiz (verschiedene Typen)
  ```quiz
  type: multiple-choice | multiple-select | true-false | numeric | fill-blank
  ...
  ```

  # Interaktives Widget
  ```interactive
  title: Titel
  parameters:
    - name: var_name
      ...
  ---
  # Python-Code
  ```

  # Übungsaufgabe
  ```exercise
  title: Aufgabe X
  description: Berechne...
  starter_code: |
    # Starter-Code
  solution: |
    # Musterlösung
  validation: |
    # Assertions
  hints:
    - Erster Hinweis
    - Zweiter Hinweis
  points: 20
  ```

  # Info-Boxen (Admonitions)
  :::note
  Allgemeine Information
  :::

  :::tip
  Hilfreicher Tipp
  :::

  :::warning
  Wichtige Warnung
  :::

  :::danger
  Kritischer Hinweis / Häufiger Fehler
  :::

  # Aufklappbarer Hinweis
  :::details Klicke für die Lösung
  Hier ist die versteckte Lösung.
  :::

  # Datensatz-Vorschau
  ```dataset
  file: datasets/iris.csv
  rows: 5
  ```


  MATHE-FORMELN (LaTeX via KaTeX)
  ──────────────────────────────────────────────────────

  Inline-Formel: $\mu = \bar{x}$

  Block-Formel:
  $$
  \sigma^2 = \frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^2
  $$

  Unterstützte Umgebungen:
  - align, aligned
  - matrix, bmatrix, pmatrix
  - cases
  - und mehr...


  BILDER UND MEDIEN
  ──────────────────────────────────────────────────────

  # Bild aus dem Kurs-Ordner
  ![Beschreibung](./images/diagramm.png)

  # Bild mit Größenangabe
  ![Beschreibung](./images/foto.jpg){width=50%}

  # Videos (falls lokal)
  <video src="./videos/demo.mp4" controls></video>
