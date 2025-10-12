import React, { createContext, useContext, useState, useEffect } from 'react';
import { DigicamproConfig } from '@/config/camera-config';

interface ConfigModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setConfig: (config: DigicamproConfig) => void;
  config: DigicamproConfig | null;
}

const ConfigModalContext = createContext<ConfigModalContextType | undefined>(undefined);

export function ConfigModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DigicamproConfig | null>(null);

  useEffect(() => {
    console.log('🔧 Setting up global config modal keyboard listener');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        console.log('🔧 Global config modal shortcut triggered!');
        setIsOpen(true);
      }
    };

    // Add global event listener
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase

    console.log('🔧 Global config modal keyboard listener added');

    return () => {
      console.log('🔧 Cleaning up global config modal keyboard listener');
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const open = () => {
    console.log('🔧 Opening config modal manually');
    setIsOpen(true);
  };

  const close = () => {
    console.log('🔧 Closing config modal');
    setIsOpen(false);
  };

  return (
    <ConfigModalContext.Provider value={{ isOpen, open, close, setConfig, config }}>
      {children}
    </ConfigModalContext.Provider>
  );
}

export function useConfigModalContext() {
  const context = useContext(ConfigModalContext);
  if (context === undefined) {
    throw new Error('useConfigModalContext must be used within a ConfigModalProvider');
  }
  return context;
}