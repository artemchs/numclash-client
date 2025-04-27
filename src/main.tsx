import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./providers/AppProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find root element with id 'root'");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProvider />
  </StrictMode>
);
