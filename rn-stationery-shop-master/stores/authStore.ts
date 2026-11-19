import { create } from 'zustand';
import { TEST_CREDENTIALS } from '../config/auth';

type AuthProvider = 'credentials' | 'github';

interface AuthState {
  username: string | null;
  provider: AuthProvider | null;
  signInWithCredentials: (username: string, password: string) => boolean;
  signInWithGitHub: (username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  username: null,
  provider: null,
  signInWithCredentials: (username, password) => {
    if (username !== TEST_CREDENTIALS.username || password !== TEST_CREDENTIALS.password) {
      return false;
    }
    set({ username: TEST_CREDENTIALS.username, provider: 'credentials' });
    return true;
  },
  signInWithGitHub: (username) => set({ username, provider: 'github' }),
  logout: () => set({ username: null, provider: null }),
}));
