"use client";

import { StatsProvider } from "@/lib/StatsContext";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <StatsProvider>
      {children}
    </StatsProvider>
  );
}
