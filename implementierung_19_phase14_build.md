━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
19. PHASE 14 — BUILD & DISTRIBUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  BUILD-OPTIONEN
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬─────────────────────────────────────────────────────┐
  │ Plattform           │ Output-Format                                        │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ Windows             │ .msi Installer, .exe (NSIS), portable .exe          │
  │ macOS               │ .dmg, .app Bundle                                    │
  │ Linux               │ .deb, .AppImage, .rpm                               │
  └─────────────────────┴─────────────────────────────────────────────────────┘


  LOKALER BUILD
  ──────────────────────────────────────────────────────

  # Development Build (Hot-Reload)
  cargo tauri dev

  # Production Build (lokale Plattform)
  cargo tauri build

  # Build mit Debug-Symbolen
  cargo tauri build --debug

  # Spezifisches Target
  cargo tauri build --target x86_64-pc-windows-msvc


  CROSS-PLATFORM BUILD (GITHUB ACTIONS)
  ──────────────────────────────────────────────────────

  # .github/workflows/release.yml

  name: Release

  on:
    push:
      tags:
        - 'v*'

  permissions:
    contents: write

  jobs:
    build:
      strategy:
        fail-fast: false
        matrix:
          include:
            - platform: 'macos-latest'
              args: '--target aarch64-apple-darwin'
            - platform: 'macos-latest'
              args: '--target x86_64-apple-darwin'
            - platform: 'ubuntu-22.04'
              args: ''
            - platform: 'windows-latest'
              args: ''

      runs-on: ${{ matrix.platform }}

      steps:
        - uses: actions/checkout@v4

        - name: Setup Node
          uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'

        - name: Setup Rust
          uses: dtolnay/rust-toolchain@stable
          with:
            targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

        - name: Install Linux dependencies
          if: matrix.platform == 'ubuntu-22.04'
          run: |
            sudo apt-get update
            sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

        - name: Install dependencies
          run: npm ci

        - name: Build
          uses: tauri-apps/tauri-action@v0
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          with:
            tagName: v__VERSION__
            releaseName: 'StatistikLab v__VERSION__'
            releaseBody: 'Siehe Changelog für Details.'
            releaseDraft: true
            prerelease: false
            args: ${{ matrix.args }}


  TAURI BUILD-KONFIGURATION
  ──────────────────────────────────────────────────────

  # src-tauri/tauri.conf.json (bundle section)

  {
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.statistiklab.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": [
        "resources/**/*"
      ],
      "category": "Education",
      "shortDescription": "Interaktiv Statistik lernen",
      "longDescription": "StatistikLab ist eine Desktop-Anwendung zum interaktiven Erlernen von Statistik mit ausführbarem Python-Code, Quiz-Fragen und Gamification.",
      "copyright": "© 2025 StatistikLab",
      "homepage": "https://statistiklab.app",
      "windows": {
        "digestAlgorithm": "sha256",
        "wix": {
          "language": "de-DE",
          "upgradeCode": "YOUR-UPGRADE-GUID"
        },
        "nsis": {
          "languages": ["German"],
          "displayLanguageSelector": true
        }
      },
      "macOS": {
        "entitlements": null,
        "minimumSystemVersion": "10.15",
        "signingIdentity": null,
        "providerShortName": null
      },
      "linux": {
        "appId": "com.statistiklab.app",
        "category": "Education",
        "formats": ["deb", "AppImage"]
      }
    }
  }


  CODE-SIGNING
  ──────────────────────────────────────────────────────

  # Windows (Code-Signing mit Zertifikat)
  # In GitHub Secrets:
  # - TAURI_PRIVATE_KEY (Base64-kodiert)
  # - TAURI_KEY_PASSWORD

  # macOS (Notarization)
  # In GitHub Secrets:
  # - APPLE_CERTIFICATE (Base64-kodiert)
  # - APPLE_CERTIFICATE_PASSWORD
  # - APPLE_SIGNING_IDENTITY
  # - APPLE_ID
  # - APPLE_PASSWORD
  # - APPLE_TEAM_ID

  # Beispiel: GitHub Actions für macOS Signing

  - name: Import Apple Certificate
    if: matrix.platform == 'macos-latest'
    env:
      APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
      APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
    run: |
      echo $APPLE_CERTIFICATE | base64 --decode > certificate.p12
      security create-keychain -p actions build.keychain
      security import certificate.p12 -k build.keychain -P $APPLE_CERTIFICATE_PASSWORD -T /usr/bin/codesign
      security list-keychains -s build.keychain
      security set-key-partition-list -S apple-tool:,apple: -s -k actions build.keychain


  AUTO-UPDATER KONFIGURATION
  ──────────────────────────────────────────────────────

  # src-tauri/tauri.conf.json (updater section)

  {
    "plugins": {
      "updater": {
        "active": true,
        "pubkey": "YOUR_PUBLIC_KEY",
        "endpoints": [
          "https://releases.statistiklab.app/{{target}}/{{current_version}}"
        ],
        "dialog": true,
        "windows": {
          "installMode": "passive"
        }
      }
    }
  }


  # Update-Check Implementierung (Frontend)

  import { check } from '@tauri-apps/plugin-updater';
  import { ask } from '@tauri-apps/plugin-dialog';

  async function checkForUpdates() {
    try {
      const update = await check();

      if (update?.available) {
        const yes = await ask(
          `Version ${update.version} ist verfügbar. Jetzt aktualisieren?`,
          { title: 'Update verfügbar', kind: 'info' }
        );

        if (yes) {
          await update.downloadAndInstall();
          // App neu starten
          await invoke('restart');
        }
      }
    } catch (e) {
      console.error('Update-Check fehlgeschlagen:', e);
    }
  }


  OPTIMIERUNGEN FÜR PRODUCTION
  ──────────────────────────────────────────────────────

  # Rust Cargo.toml — Release-Profil optimieren

  [profile.release]
  opt-level = "z"        # Minimale Binary-Größe
  lto = true             # Link-Time Optimization
  codegen-units = 1      # Bessere Optimierung
  panic = "abort"        # Kleinere Binary
  strip = true           # Debug-Symbole entfernen


  # Frontend Vite-Optimierung

  // vite.config.ts
  export default defineConfig({
    build: {
      target: 'esnext',
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            pyodide: ['pyodide'],
            codemirror: [
              '@codemirror/state',
              '@codemirror/view',
              '@codemirror/lang-python',
            ],
          },
        },
      },
    },
  });


  ERWARTETE BUILD-GRÖßEN
  ──────────────────────────────────────────────────────

  ┌─────────────────────┬─────────────────────────────────────────────────────┐
  │ Komponente          │ Größe (ca.)                                          │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ Tauri Binary        │ 5-8 MB                                               │
  │ Frontend Assets     │ 2-3 MB                                               │
  │ Pyodide Core        │ 6 MB (komprimiert)                                   │
  │ Python Packages     │ 20-30 MB (numpy, pandas, scipy, matplotlib, sklearn)│
  │ Default Course      │ 1-2 MB                                               │
  │ Fonts               │ 0.5 MB                                               │
  ├─────────────────────┼─────────────────────────────────────────────────────┤
  │ GESAMT Installer    │ 40-50 MB                                             │
  └─────────────────────┴─────────────────────────────────────────────────────┘
