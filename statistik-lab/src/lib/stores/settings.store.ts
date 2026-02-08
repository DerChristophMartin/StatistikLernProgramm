import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '../types/settings';
import { defaultSettings } from '../types/settings';

function createSettingsStore() {
    const { subscribe, set, update } = writable<AppSettings>(defaultSettings);

    return {
        subscribe,

        async load() {
            try {
                const settings = await invoke<AppSettings>('get_settings');
                set({ ...defaultSettings, ...settings });
                applyTheme(settings.theme);
            } catch (e) {
                console.error('Einstellungen laden fehlgeschlagen:', e);
            }
        },

        async save(newSettings: Partial<AppSettings>) {
            update(current => {
                const merged = { ...current, ...newSettings };
                invoke('save_settings', { settings: JSON.stringify(merged) });
                applyTheme(merged.theme);
                return merged;
            });
        },

        updateSingle<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
            update(current => {
                const updated = { ...current, [key]: value };
                invoke('save_settings', { settings: JSON.stringify(updated) });
                if (key === 'theme') applyTheme(value as string);
                return updated;
            });
        },
    };
}

function applyTheme(theme: string) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
}

export const settingsStore = createSettingsStore();
