import React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { PhotoContextProvider } from "@/contexts/PhotoContext";
import { EditContextProvider } from "@/contexts/EditContext";

export const RootRoute = createRootRoute({
  component: Root,
});

function Root() {
  // All routes are photobooth routes, use fullscreen layout
  return (
    <PhotoContextProvider>
      <EditContextProvider>
        <div className="h-screen w-full overflow-hidden">
          <Outlet />
        </div>
      </EditContextProvider>
    </PhotoContextProvider>
  );
}