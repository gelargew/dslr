import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";

// Import photobooth pages
import HomePage from "../pages/HomePage";
import CameraPage from "@/pages/CameraPage";
import CountdownPage from "@/pages/CountdownPage";
import PreviewPage from "@/pages/PreviewPage";
import EditLandingPage from "@/pages/EditLandingPage";
import EditPhotoPage from "@/pages/EditPhotoPage";
import EditOverlayPage from "@/pages/EditOverlayPage";
import CompletePage from "@/pages/CompletePage";

// Textimoni Photobooth Routes - HomePage is the main welcome screen
export const HomeMainRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomePage,
});

export const CameraRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/camera",
  component: CameraPage,
});

export const CountdownRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/countdown",
  component: CountdownPage,
});

export const PreviewRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/preview",
  component: PreviewPage,
});

export const EditLandingRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/edit",
  component: EditLandingPage,
});

export const EditPhotoRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/edit/photo",
  component: EditPhotoPage,
});

export const EditOverlayRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/edit/overlay",
  component: EditOverlayPage,
});

export const CompleteRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/complete",
  component: CompletePage,
});

export const rootTree = RootRoute.addChildren([
  // Main photobooth flow
  HomeMainRoute,    // Main entry point
  CameraRoute,      // DSLR camera interface
  CountdownRoute,   // Countdown before capture
  PreviewRoute,     // Photo preview after capture
  EditLandingRoute, // Edit flow entry
  EditPhotoRoute,   // Photo editing
  EditOverlayRoute, // Overlay editing
  CompleteRoute,    // Final screen
]);