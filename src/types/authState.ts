import type { User } from "./user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean; // Derived from user presence
  checkAuthStatus: () => Promise<void>; // Action to check auth via API
  login: (user: User) => void; // Action to set user data and token
  logout: () => void; // Action to clear user data
}
