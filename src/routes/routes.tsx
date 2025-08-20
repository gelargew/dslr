import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";

// Import existing pages
import HomePage from "../pages/HomePage";
import SecondPage from "@/pages/SecondPage";

// Import photobooth pages
import WelcomePage from "@/pages/WelcomePage";
import CameraPage from "@/pages/CameraPage";
import CountdownPage from "@/pages/CountdownPage";
import PreviewPage from "@/pages/PreviewPage";
import ThankYouPage from "@/pages/ThankYouPage";
import EditLandingPage from "@/pages/EditLandingPage";
import EditPhotoPage from "@/pages/EditPhotoPage";
import EditOverlayPage from "@/pages/EditOverlayPage";
import CompletePage from "@/pages/CompletePage";
import DebugPage from "@/pages/DebugPage";
// import GalleryPage from "@/pages/GalleryPage";

// Legacy routes (can be removed later)
export const HomeRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/home",
  component: HomePage,
});

export const SecondPageRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/second-page",
  component: SecondPage,
});

// Debug route
export const DebugRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/debug",
  component: DebugPage,
});

// Photobooth Routes
export const WelcomeRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: WelcomePage,
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

export const ThankYouRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/thank-you",
  component: ThankYouPage,
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

// Videotron Routes
// export const GalleryRoute = createRoute({
//   getParentRoute: () => RootRoute,
//   path: "/gallery",
//   component: GalleryPage,
// });

export const rootTree = RootRoute.addChildren([
  // Photobooth routes (main flow)
  WelcomeRoute,
  CameraRoute,
  CountdownRoute,
  PreviewRoute,
  ThankYouRoute,
  EditLandingRoute,
  EditPhotoRoute,
  EditOverlayRoute,
  CompleteRoute,

  // Debug route
  DebugRoute,

  // Videotron routes
  // GalleryRoute,

  // Legacy routes (for testing/development)
  HomeRoute,
  SecondPageRoute,
]);