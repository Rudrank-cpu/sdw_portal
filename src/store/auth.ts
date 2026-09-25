import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthInfo, User } from '@/types/api';

interface AuthState {
  user: User | null;
  auth: AuthInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setSession: (user: User, auth: AuthInfo, accessToken: string, refreshToken: string) => void;
  setGuestSession: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      auth: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isGuest: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setSession: (user, auth, accessToken, refreshToken) =>
        set({ user, auth, accessToken, refreshToken, isAuthenticated: true, isGuest: false }),

      setGuestSession: () =>
        set({
          user: {
            id: 'guest',
            prn: 'GUEST',
            email: 'guest@student.portal',
            name: 'Guest User',
            branch: 'General',
            year: 'FE',
            avatar: '',
          },
          auth: {
            isCesaAdmin: false,
            cesaRoles: [],
            memberships: [],
          },
          accessToken: null,
          refreshToken: null,
          isAuthenticated: true,
          isGuest: true,
        }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      logout: () =>
        set({
          user: null,
          auth: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isGuest: false,
        }),
    }),
    {
      name: 'cesa-sdw-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
