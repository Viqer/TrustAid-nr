import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

// Initialize from localStorage
const initialToken = localStorage.getItem('trustaid_token');
let initialUser: User | null = null;

if (initialToken) {
  try {
    const decoded = jwtDecode<any>(initialToken);
    // Handle standard JWT payload fields
    initialUser = {
      id: decoded.id || decoded.sub || decoded._id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      localWalletId: decoded.localWalletId || null,
    };
  } catch (e) {
    localStorage.removeItem('trustaid_token');
  }
}

export const useAuth = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken,
  setToken: (token: string) => {
    localStorage.setItem('trustaid_token', token);
    const decoded = jwtDecode<any>(token);
    set({
      token,
      user: {
        id: decoded.id || decoded.sub || decoded._id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
        localWalletId: decoded.localWalletId || null,
      }
    });
  },
  logout: () => {
    localStorage.removeItem('trustaid_token');
    set({ user: null, token: null });
    window.location.href = '/login';
  }
}));
