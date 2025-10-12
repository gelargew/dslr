import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useSettingsShortcut } from '@/hooks/useKeyboardShortcut';

interface SettingsContextType {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  canAccessSettings: boolean; // Only accessible on homepage
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();

  // Settings can only be accessed on the homepage
  const canAccessSettings = location.pathname === '/';

  const openSettings = () => {
    console.log('🔧 Opening settings dialog...', {
      currentPath: location.pathname,
      canAccess: canAccessSettings
    });

    if (canAccessSettings) {
      setIsSettingsOpen(true);
    } else {
      console.log('❌ Settings can only be accessed from homepage');
    }
  };

  const closeSettings = () => {
    console.log('🔧 Closing settings dialog');
    setIsSettingsOpen(false);
  };

  const toggleSettings = () => {
    if (isSettingsOpen) {
      closeSettings();
    } else {
      openSettings();
    }
  };

  // Enable keyboard shortcut for settings (Ctrl+Shift+E) - only when on homepage
  useSettingsShortcut(openSettings, canAccessSettings);

  // Close settings when navigating away from homepage
  useEffect(() => {
    if (isSettingsOpen && !canAccessSettings) {
      console.log('🔧 Auto-closing settings dialog (navigated away from homepage)');
      setIsSettingsOpen(false);
    }
  }, [location.pathname, isSettingsOpen, canAccessSettings]);

  const contextValue: SettingsContextType = {
    isSettingsOpen,
    openSettings,
    closeSettings,
    toggleSettings,
    canAccessSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};