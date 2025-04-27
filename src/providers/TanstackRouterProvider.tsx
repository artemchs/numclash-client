import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { useAuthStore } from "@/stores/authStore"; // Import the auth store

// Create the router instance, passing the initial auth state (will be updated)
const router = createRouter({
  routeTree,
  context: {
    // Provide the auth state from the store initially
    // This will be dynamically updated by the component below
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    auth: undefined!, // Will be overridden
  },
  // Optional: Set a default pending component
  // defaultPendingComponent: () => <div>Loading...</div>,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function TanstackRouterProvider() {
  // Get the auth state from the Zustand store
  const auth = useAuthStore();

  // Provide the auth state to the RouterProvider context
  return <RouterProvider router={router} context={{ auth }} />;
}
