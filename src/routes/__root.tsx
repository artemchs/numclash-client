import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import "../index.css";
import type { AuthState } from "@/types/authState";

// Define the router context interface including auth state
export interface RouterContext {
  auth: AuthState;
}

// Use createRootRouteWithContext to make the context available
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  // TanStack Router Devtools removed for brevity, add back if needed
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
