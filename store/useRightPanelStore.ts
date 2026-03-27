import { create } from 'zustand';
import React from 'react';

interface RightPanelState {
    component: React.ReactNode | null;
    setComponent: (component: React.ReactNode | null) => void;
}

export const useRightPanelStore = create<RightPanelState>((set) => ({
    component: null,
    setComponent: (component) => set({ component }),
}));
