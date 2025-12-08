import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthDTO } from '@/core/auth/application/dtos/AuthDTO';

interface AuthState {
  session: AuthDTO | null;
  setSession: (session: AuthDTO | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
