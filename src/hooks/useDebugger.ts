import { useConfigStore, useUIStore } from '@/stores';

/**
 * Debugger hook using Zustand stores
 * Replaces the old DebuggerContext
 */
export const useDebugger = () => {
  const debuggerEnabled = useConfigStore((state) => state.debugger.enabled);
  const debuggerVisible = useUIStore((state) => state.debugger.visible);
  const setDebuggerVisible = useUIStore((state) => state.setDebuggerVisible);
  const toggleDebugger = useUIStore((state) => state.toggleDebugger);

  // Computed property: debugger is only visible if both enabled and visible
  const isDebuggerVisible = debuggerEnabled && debuggerVisible;

  return {
    isDebuggerEnabled: debuggerEnabled,
    isDebuggerVisible,
    setDebuggerVisible,
    toggleDebugger
  };
};