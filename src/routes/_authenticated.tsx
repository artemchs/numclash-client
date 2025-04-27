import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore"; // Import the auth store

// This is a layout route, components rendered here will wrap child routes
// It doesn't need a component itself if it's just for auth checks

export const Route = createFileRoute("/_authenticated")({
  // Make beforeLoad async to await checkAuthStatus
  beforeLoad: async ({ context }) => {
    let isAuthenticated = context.auth.isAuthenticated;

    // If not authenticated according to the store state, double-check with the server
    if (!isAuthenticated) {
      await context.auth.checkAuthStatus();
      // Re-check the state after the async call
      // It's safer to get the latest state directly from the store after an async operation
      isAuthenticated = useAuthStore.getState().isAuthenticated;
    }
  },
});
