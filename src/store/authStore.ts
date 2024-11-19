import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: string | null;
  conversationId: string | null;
  companyName: string | null;
  companyDescription: string | null;
  setAuth: (auth: {
    token: string;
    userId: string;
    conversationId: string;
    companyName: string;
    companyDescription: string;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      conversationId: null,
      companyName: null,
      companyDescription: null,
      setAuth: (auth) => set(auth),
      clearAuth: () => set({
        token: null,
        userId: null,
        conversationId: null,
        companyName: null,
        companyDescription: null,
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);