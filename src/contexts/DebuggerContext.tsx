import React, { createContext, useContext, useState, useEffect } from 'react';
import { configManager } from '@/services/config-manager';

interface DebuggerContextType {
  isDebuggerEnabled: boolean;
  isDebuggerVisible: boolean;
  setDebuggerVisible: (visible: boolean) => void;
  toggleDebugger: () => void;
}

const DebuggerContext = createContext<DebuggerContextType | undefined>(undefined);

interface DebuggerProviderProps {
  children: React.ReactNode;
}

export const DebuggerProvider: React.FC<DebuggerProviderProps> = ({ children }) => {
  // Read fresh value from ConfigManager on every render (no caching!)
  const isDebuggerEnabled = React.useMemo(() => {
    try {
      const enabled = configManager.getDebuggerEnabled() || process.env.NODE_ENV === 'development';
      console.log(`🐛 DebuggerContext render - Reading fresh debugger state: ${enabled}`);
      return enabled;
    } catch {
      console.log('🐛 DebuggerContext render - Error reading debugger state, using development fallback');
      return process.env.NODE_ENV === 'development';
    }
  }, []); // Only recalc when dependencies change (none for this case)

  // Only useState for truly local state
  const [isDebuggerVisible, setIsDebuggerVisible] = useState(false);

  // Listen for configuration changes using custom events
  useEffect(() => {
    const handleConfigChange = (event: CustomEvent) => {
      console.log('🐛 DebuggerContext received config change event:', event.detail);

      try {
        // Read fresh values from ConfigManager (no closure issues!)
        const currentEnabled = configManager.getDebuggerEnabled() || process.env.NODE_ENV === 'development';
        const newEnabled = configManager.getDebuggerEnabled() || process.env.NODE_ENV === 'development';

        console.log('🐛 State change analysis:', {
          configManagerCurrent: currentEnabled,
          configManagerNew: newEnabled,
          localVisible: isDebuggerVisible,
          shouldUpdate: currentEnabled !== newEnabled || (!newEnabled && isDebuggerVisible)
        });

        // Only update local state (isDebuggerVisible) - external state comes from ConfigManager
        if (!newEnabled && isDebuggerVisible) {
          console.log('🐛 Auto-hiding debugger (disabled)');
          setIsDebuggerVisible(false);
        }

        // Force a re-render to ensure UI reflects the fresh ConfigManager state
        // React will re-read the fresh isDebuggerEnabled value on next render
        console.log('🐛 Triggering re-render to reflect fresh ConfigManager state');
        setForceUpdate(prev => prev + 1);
      } catch (error) {
        console.error('Error handling debugger config change:', error);
      }
    };

    // Listen for config change events
    window.addEventListener('config-change', handleConfigChange as EventListener);
    console.log('🐛 DebuggerContext listening for config changes');

    return () => {
      window.removeEventListener('config-change', handleConfigChange as EventListener);
      console.log('🐛 DebuggerContext stopped listening for config changes');
    };
  }, [isDebuggerVisible]); // Only depends on truly local state

  const toggleDebugger = () => {
    if (isDebuggerEnabled) {
      setIsDebuggerVisible(!isDebuggerVisible);
    }
  };

  const contextValue: DebuggerContextType = {
    isDebuggerEnabled,
    isDebuggerVisible: isDebuggerVisible && isDebuggerEnabled, // Only visible if both are true
    setDebuggerVisible: setIsDebuggerVisible,
    toggleDebugger,
  };

  return (
    <DebuggerContext.Provider value={contextValue}>
      {children}
    </DebuggerContext.Provider>
  );
};

export const useDebugger = () => {
  const context = useContext(DebuggerContext);
  if (context === undefined) {
    throw new Error('useDebugger must be used within a DebuggerProvider');
  }
  return context;
};
