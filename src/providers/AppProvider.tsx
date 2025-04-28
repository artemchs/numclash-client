import { Toaster } from "@/components/ui/sonner";
import { TanstackQueryProvider } from "./TanstackQueryProvider";
import { TanstackRouterProvider } from "./TanstackRouterProvider";

export function AppProvider() {
  return (
    <TanstackQueryProvider>
      <TanstackRouterProvider />
      <Toaster richColors position="top-center" />
    </TanstackQueryProvider>
  );
}
