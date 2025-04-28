import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore"; // Import the auth store
import { MainLayout } from "@/layouts/MainLayout";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import { useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";

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
  component: RouteComponent,
});

function RouteComponent() {
  const { lastMessage } = useWebSocketConnection();
  const navigate = useNavigate();
  const acceptInvitation = useMutation({
    mutationFn: async (inviteId: string) => {
      await axiosClient.post("/invites/accept", {
        inviteId,
      });
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data as string);

      console.log(data);

      if (data.type) {
        if (data.type === "GAME_INVITATION") {
          toast.info(
            `You have received a game invitation from ${data.payload.from.name}.`,
            {
              action: {
                label: "Accept",
                onClick: async () => {
                  await acceptInvitation.mutateAsync(data.payload.inviteId);
                },
              },
            }
          );
        } else if (data.type === "START_GAME") {
          navigate({
            to: "/game/$gameId",
            params: {
              gameId: data.gameId,
            },
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
