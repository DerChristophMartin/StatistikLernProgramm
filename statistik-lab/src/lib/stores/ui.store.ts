import { writable } from 'svelte/store';

export interface UIState {
    sidebarOpen: boolean;
    activeModal: string | null;
}

function createUIStore() {
    const { subscribe, update, set } = writable<UIState>({
        sidebarOpen: true,
        activeModal: null,
    });

    return {
        subscribe,
        toggleSidebar: () => update(s => ({ ...s, sidebarOpen: !s.sidebarOpen })),
        setModal: (modalId: string | null) => update(s => ({ ...s, activeModal: modalId })),
    };
}

export const uiStore = createUIStore();
