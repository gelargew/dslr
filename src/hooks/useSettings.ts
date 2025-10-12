import { useUIStore } from '@/stores';
import { useLocation } from '@tanstack/react-router';
import { useSettingsShortcut } from './useKeyboardShortcut';
import { useEffect } from 'react';

/**
 * Settings hook using Zustand store
 * Replaces the old SettingsContext
 */
export const useSettings = () => {
  const isSettingsOpen = useUIStore((state) => state.settings.isOpen);
  const setSettingsOpen = useUIStore((state) => state.setSettingsOpen);
  const openSettings = useUIStore((state) => state.openSettings);
  const closeSettings = useUIStore((state) => state.closeSettings);
  const toggleSettings = useUIStore((state) => state.toggleSettings);

  const location = useLocation();

  // Settings can only be accessed on the homepage
  const canAccessSettings = location.pathname === '/';

  // Auto-close settings when navigating away from homepage
  useEffect(() => {
    if (isSettingsOpen && !canAccessSettings) {
      console.log('🔧 Auto-closing settings dialog (navigated away from homepage)');
      closeSettings();
    }
  }, [location.pathname, isSettingsOpen, canAccessSettings, closeSettings]);

  // Wrapper functions that check access permissions
  const openSettingsWithAccess = () => {
    console.log('🔧 Opening settings dialog...', {
      currentPath: location.pathname,
      canAccess: canAccessSettings
    });

    if (canAccessSettings) {
      openSettings();
    } else {
      console.log('❌ Settings can only be accessed from homepage');
    }
  };

  const closeSettingsDialog = () => {
    console.log('🔧 Closing settings dialog');
    closeSettings();
  };

  const toggleSettingsDialog = () => {
    if (isSettingsOpen) {
      closeSettingsDialog();
    } else {
      openSettingsWithAccess();
    }
  };

  // Enable keyboard shortcut for settings (Ctrl+Shift+E) - only when on homepage
  useSettingsShortcut(openSettingsWithAccess, canAccessSettings);

  return {
    isSettingsOpen,
    openSettings: openSettingsWithAccess,
    closeSettings: closeSettingsDialog,
    toggleSettings: toggleSettingsDialog,
    canAccessSettings
  };
};