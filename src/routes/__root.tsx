import React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useDebugger } from "@/hooks/useDebugger";
import { useSettings } from "@/hooks/useSettings";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Debugger } from "@/components/Debugger";
import { DebuggerIcon } from "@/components/DebuggerIcon";
import SettingsDialog from "@/components/SettingsDialog";

export const RootRoute = createRootRoute({
  component: Root,
});

function RootContent() {
  const { isDebuggerEnabled, isDebuggerVisible, toggleDebugger } = useDebugger();
  const { isSettingsOpen, openSettings, closeSettings, canAccessSettings } = useSettings();

  // Initialize global keyboard shortcuts
  useKeyboardShortcuts();

  // Log debugger state changes for debugging
  React.useEffect(() => {
    console.log('🎛️ RootContent - Debugger state changed:', {
      isDebuggerEnabled,
      isDebuggerVisible
    });
  }, [isDebuggerEnabled, isDebuggerVisible]);

  // All routes are photobooth routes, use fullscreen layout
  return (
    <div className="h-screen w-full overflow-hidden relative">
      <Outlet />
      {isDebuggerEnabled && (
        <>
          <DebuggerIcon
            onClick={toggleDebugger}
            isDebuggerVisible={isDebuggerVisible}
          />
          <Debugger
            isVisible={isDebuggerVisible}
            onToggle={toggleDebugger}
          />
        </>
      )}

      {/* Settings Dialog - global and accessible from homepage */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={closeSettings}
      />
    </div>
  );
}

function Root() {
  return <RootContent />;
}