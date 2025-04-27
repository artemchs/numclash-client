import { GoogleLoginButton } from "@/features/auth/GoogleLoginButton";
import { AuthLayout } from "@/layouts/AuthLayout";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore"; // Import auth store
import { useEffect } from "react";
import { z } from "zod"; // Import zod

// Define search parameter schema using zod
const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined), // Optional redirect URL
});

export const Route = createFileRoute("/login")({
  // Validate search parameters using zod
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const auth = useAuthStore();
  const search = Route.useSearch(); // Get validated search params

  useEffect(() => {
    // If the user is already authenticated, redirect them
    // - If a 'redirect' URL is present, go there
    // - Otherwise, go to the homepage
    if (auth.isAuthenticated) {
      navigate({ to: search.redirect || "/", replace: true });
    }
  }, [auth.isAuthenticated, navigate, search.redirect]);

  // The GoogleLoginButton handles the actual login initiation
  // We might add logic here if login happened via a form on this page

  return (
    <AuthLayout title="Login" description="Login to your account">
      <GoogleLoginButton />
      {/* Add other login methods here if needed */}
    </AuthLayout>
  );
}
