import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";

export const Route = createFileRoute("/_store")({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />
      <main className="flex-1"><Outlet /></main>
      <StoreFooter />
    </div>
  ),
});
