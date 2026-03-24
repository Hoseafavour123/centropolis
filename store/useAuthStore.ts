import { create } from "zustand";

interface User {
    id: string;
    clerkId: string;
    email: string;
    name: string | null;
    image: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (user: User | null, isAuthenticated: boolean) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setAuth: (user, isAuthenticated) => set({ user, isAuthenticated, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
}));
