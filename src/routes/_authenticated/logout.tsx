import { LogoutButton } from "@/features/auth/LogoutButton";
import { AuthLayout } from "@/layouts/AuthLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/logout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout title="Logout" description="Logout from your account">
      <LogoutButton />
    </AuthLayout>
  );
}
