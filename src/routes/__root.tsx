import React from "react";
import BaseLayout from "@/layouts/BaseLayout";
import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { PhotoContextProvider } from "@/contexts/PhotoContext";
import { EditContextProvider } from "@/contexts/EditContext";

export const RootRoute = createRootRoute({
  component: Root,
});

function Root() {
  const location = useLocation();

  // Check if current route is a photobooth route that needs fullscreen layout
  const isPhotoboothRoute = [
    '/',
    '/camera',
    '/countdown',
    '/preview',
    '/thank-you',
    '/edit',
    '/edit/photo',
    '/edit/overlay',
    '/complete',
    '/gallery'
  ].includes(location.pathname);

  // Debug and admin routes use BaseLayout
  const isAdminRoute = [
    '/debug',
    '/home',
    '/second-page'
  ].includes(location.pathname);

  // For photobooth routes, use fullscreen layout without BaseLayout chrome
  if (isPhotoboothRoute) {
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

  // For admin/debug routes, use BaseLayout
  return (
    <PhotoContextProvider>
      <EditContextProvider>
        <BaseLayout>
          <Outlet />
        </BaseLayout>
      </EditContextProvider>
    </PhotoContextProvider>
  );
}