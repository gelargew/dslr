import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { rootTree } from "./routes";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Use memory history for Electron apps - starts at root path
const history = createMemoryHistory({
  initialEntries: ['/'], // Start at homepage
});

export const router = createRouter({
  routeTree: rootTree,
  history: history,
  defaultPreload: 'intent',
});
