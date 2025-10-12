import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 * @param keys - Array of keys that must be pressed simultaneously
 * @param callback - Function to call when shortcut is triggered
 * @param options - Additional modifier key requirements and options
 * @param enabled - Whether the shortcut is currently enabled
 */
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options: KeyboardShortcutOptions = {},
  enabled: boolean = true
) {
  const {
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    preventDefault = true,
    stopPropagation = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    console.log('🎹 Key pressed:', {
      key: event.key.toLowerCase(),
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      enabled,
      requiredKeys: keys,
      requiredModifiers: { ctrlKey, shiftKey, altKey, metaKey }
    });

    if (!enabled) {
      console.log('❌ Keyboard shortcut disabled');
      return;
    }

    // Check if all required keys are pressed
    const keysMatch = keys.includes(event.key.toLowerCase());
    const ctrlMatch = ctrlKey === event.ctrlKey;
    const shiftMatch = shiftKey === event.shiftKey;
    const altMatch = altKey === event.altKey;
    const metaMatch = metaKey === event.metaKey;

    console.log('🔍 Key matching:', {
      keysMatch,
      ctrlMatch,
      shiftMatch,
      altMatch,
      metaMatch,
      allMatch: keysMatch && ctrlMatch && shiftMatch && altMatch && metaMatch
    });

    if (keysMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
      console.log('✅ Keyboard shortcut triggered! Calling callback...');
      if (preventDefault) {
        event.preventDefault();
      }
      if (stopPropagation) {
        event.stopPropagation();
      }
      callback();
    } else {
      console.log('❌ Keyboard shortcut not matched');
    }
  }, [keys, ctrlKey, shiftKey, altKey, metaKey, preventDefault, stopPropagation, callback, enabled]);

  useEffect(() => {
    console.log('🎹 Setting up keyboard shortcut listener:', {
      keys,
      enabled,
      modifiers: { ctrlKey, shiftKey, altKey, metaKey }
    });

    if (!enabled) {
      console.log('❌ Keyboard shortcut not enabled, skipping listener setup');
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    console.log('✅ Keyboard shortcut listener added to document');

    return () => {
      console.log('🗑️ Removing keyboard shortcut listener');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Specific hook for Ctrl+Shift+E shortcut (Settings)
 * @param callback - Function to call when shortcut is triggered
 * @param enabled - Whether the shortcut is currently enabled
 */
export function useSettingsShortcut(callback: () => void, enabled: boolean = true) {
  return useKeyboardShortcut(
    ['e'],
    callback,
    {
      ctrlKey: true,
      shiftKey: true,
      preventDefault: true,
      stopPropagation: true
    },
    enabled
  );
}