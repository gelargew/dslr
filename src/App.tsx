import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { ConfigModalProvider } from "./contexts/ConfigModalContext";
import ConfigModal from "./components/photobooth/ConfigModal/ConfigModal";

// Import mock IPC for development
import "./helpers/mock-ipc";

function AppWithProviders() {
  const { i18n } = useTranslation();

  useEffect(() => {
    syncThemeWithLocal();
    updateAppLanguage(i18n);
  }, [i18n]);

  return (
    <ConfigModalProvider>
      <RouterProvider router={router} />
      <GlobalConfigModal />
    </ConfigModalProvider>
  );
}

function GlobalConfigModal() {
  try {
    const { isOpen, close, config } = useConfigModalContext();
    return (
      <ConfigModal
        isOpen={isOpen}
        onClose={close}
        initialConfig={config || undefined}
      />
    );
  } catch (error) {
    console.error('ConfigModal error:', error);
    return null;
  }
}

export default function App() {
  return <AppWithProviders />;
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);