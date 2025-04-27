import { TanstackQueryProvider } from "./TanstackQueryProvider";
import { TanstackRouterProvider } from "./TanstackRouterProvider";

export function AppProvider() {
  return (
    <TanstackQueryProvider>
      <TanstackRouterProvider />
    </TanstackQueryProvider>
  );
}
