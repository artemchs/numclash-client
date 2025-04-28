import { Navbar } from "@/features/nav/Navbar";
import type React from "react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] w-[100dvw] bg-background flex flex-col">
      <Navbar />
      {children}
    </div>
  );
}
