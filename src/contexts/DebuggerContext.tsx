import React, { createContext, useContext, useState, useEffect } from 'react';
import { APP_CONFIG } from '@/config/app-config';

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
  // Check if debugger is enabled via app config
  const isDebuggerEnabled = APP_CONFIG.debugger.enabled || process.env.NODE_ENV === 'development';

  const [isDebuggerVisible, setDebuggerVisible] = useState(false);

  const toggleDebugger = () => {
    if (isDebuggerEnabled) {
      setDebuggerVisible(!isDebuggerVisible);
    }
  };

  const contextValue: DebuggerContextType = {
    isDebuggerEnabled,
    isDebuggerVisible,
    setDebuggerVisible,
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
