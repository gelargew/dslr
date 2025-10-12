import React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { PhotoContextProvider } from "@/contexts/PhotoContext";
import { EditContextProvider } from "@/contexts/EditContext";
import { DebuggerProvider, useDebugger } from "@/contexts/DebuggerContext";
import { Debugger } from "@/components/Debugger";
import { DebuggerIcon } from "@/components/DebuggerIcon";

export const RootRoute = createRootRoute({
  component: Root,
});

function RootContent() {
  const { isDebuggerEnabled, isDebuggerVisible, toggleDebugger } = useDebugger();

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
    </div>
  );
}

function Root() {
  return (
    <PhotoContextProvider>
      <EditContextProvider>
        <DebuggerProvider>
          <RootContent />
        </DebuggerProvider>
      </EditContextProvider>
    </PhotoContextProvider>
  );
}