import { createFileRoute } from "@tanstack/react-router";
import { NewGame } from "@/features/game/NewGame";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <NewGame />
    </div>
  );
}
