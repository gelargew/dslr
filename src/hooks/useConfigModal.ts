import { useEffect, useState } from 'react';
import { DigicamproConfig } from '@/config/camera-config';

export function useConfigModal(initialConfig?: DigicamproConfig) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('🔧 Setting up config modal keyboard listener');

    // Listen to direct keyboard events in renderer
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('🔧 Key pressed:', {
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        key: event.key.toLowerCase(),
        code: event.code
      });

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        console.log('🔧 Config modal shortcut triggered in renderer!');
        setIsOpen(true);
      }
    };

    // Try multiple ways to add the event listener
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    console.log('🔧 Config modal keyboard listener added');

    return () => {
      console.log('🔧 Cleaning up config modal keyboard listener');
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleKeyDown);
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

  return {
    isOpen,
    open,
    close,
    initialConfig,
  };
}