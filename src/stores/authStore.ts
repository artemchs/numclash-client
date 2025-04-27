import { create } from "zustand";
import type { AuthState } from "../types/authState"; // Import User type
import { createJSONStorage, persist } from "zustand/middleware";
import { axiosClient } from "@/api/client"; // Import your configured Axios client
import axios from "axios"; // Import axios for error type checking
import type { User } from "@/types/user";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      login: (user: User) => set({ user, isAuthenticated: true }), // Store the token
      logout: () => {
        // Optional: Add API call to backend logout endpoint if you have one
        axiosClient.post("/auth/logout").catch(console.error);
        set({ user: null, isAuthenticated: false });
        window.location.href = "/login";
      },
      checkAuthStatus: async () => {
        // Avoid unnecessary checks if we already know the user is authenticated
        // Remove this line if you want to check on every navigation
        if (get().isAuthenticated) return;

        try {
          // The browser automatically sends the HttpOnly cookie
          // Adjust the endpoint URL and expected response structure if needed
          const response = await axiosClient.get<{ user: User }>("/users/me");
          if (response.data?.user) {
            get().login(response.data.user); // Pass the user to login
          } else {
            // Handle cases where the API might return 200 but no user (shouldn't happen ideally)
            get().logout();
          }
        } catch (error) {
          // Check if it's an Axios error and specifically a 401 Unauthorized
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            get().logout(); // Clear user data if not authorized
          } else {
            // Handle other errors (network issues, server errors)
            console.error("Authentication check failed:", error);
            // Decide if you want to log out on other errors too
            get().logout();
          }
        }
      },
    }),
    {
      name: "auth-storage", // Keep the storage name
      storage: createJSONStorage(() => localStorage),
      // Persist user and token
      partialize: (state) => ({ user: state.user }),
      // This function runs after state is loaded from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Set isAuthenticated based on whether a user object exists in storage
          state.isAuthenticated = !!state.user;
        }
      },
    }
  )
);
