import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useEdit } from './useEdit';

/**
 * Hook for global keyboard shortcuts
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { clearEdit } = useEdit();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+R combination
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        event.stopPropagation();

        console.log('🔄 Keyboard shortcut triggered: Ctrl+Shift+R - Resetting application');

        try {
          // Clear edit state (selected frame, icons, text, etc.)
          clearEdit();

          // Navigate to homepage
          navigate({ to: '/' });

          console.log('✅ Application reset completed');
        } catch (error) {
          console.error('❌ Error during application reset:', error);
        }
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, clearEdit]);
};