import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Configuration state that should be persisted
export interface ConfigState {
  // Debugger Configuration
  debugger: {
    enabled: boolean;
    lastUpdated: number;
  };

  // DigiCamControl Configuration
  digicam: {
    baseUrl: string;
    lastUpdated: number;
  };

  // Application Metadata
  app: {
    id: string;
    version: string;
    lastInitialized: number;
  };
}

// Default configuration state
const defaultConfigState: ConfigState = {
  debugger: {
    enabled: false, // Default to disabled
    lastUpdated: Date.now()
  },
  digicam: {
    baseUrl: 'http://127.0.0.1:5513',
    lastUpdated: Date.now()
  },
  app: {
    id: '', // Will be generated on first run
    version: '1.0.0',
    lastInitialized: Date.now()
  }
};

// Helper function to generate App ID
const generateAppId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create the Config store with localStorage persistence
export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ...defaultConfigState,

      // Initialize app ID on first run
      initialize: () => {
        const currentState = get();
        if (!currentState.app.id) {
          set((state) => ({
            ...state,
            app: {
              ...state.app,
              id: generateAppId(),
              lastInitialized: Date.now()
            }
          }));
        }
      },

      // Debugger Actions
      setDebuggerEnabled: (enabled: boolean) => {
        set((state) => ({
          ...state,
          debugger: {
            ...state.debugger,
            enabled,
            lastUpdated: Date.now()
          }
        }));
        console.log(`🐛 Config Store: Debugger ${enabled ? 'enabled' : 'disabled'}`);
      },

      // DigiCamControl Actions
      setDigicamBaseUrl: (baseUrl: string) => {
        set((state) => ({
          ...state,
          digicam: {
            ...state.digicam,
            baseUrl,
            lastUpdated: Date.now()
          }
        }));
        console.log(`📷 Config Store: DigiCamControl URL updated to: ${baseUrl}`);
      },

      // App Metadata Actions
      setAppId: (id: string) => {
        set((state) => ({
          ...state,
          app: {
            ...state.app,
            id,
            lastInitialized: Date.now()
          }
        }));
        console.log(`🆔 Config Store: App ID set to: ${id}`);
      },

      // Reset Actions
      resetDebugger: () => {
        set((state) => ({
          ...state,
          debugger: {
            ...defaultConfigState.debugger
          }
        }));
      },

      resetDigicam: () => {
        set((state) => ({
          ...state,
          digicam: {
            ...defaultConfigState.digicam
          }
        }));
      },

      resetConfig: () => {
        const currentAppId = get().app.id; // Preserve app ID
        set({
          ...defaultConfigState,
          app: {
            ...defaultConfigState.app,
            id: currentAppId // Preserve the existing App ID
          }
        });
        console.log('🔄 Config Store: Config reset to defaults');
      }
    }),
    {
      name: 'textimoni-config-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only persist these fields
      partialize: (state) => ({
        debugger: state.debugger,
        digicam: state.digicam,
        app: state.app
      }),
      // Initialize app ID on first load
      onRehydrateStorage: () => (state) => {
        if (state && !state.app.id) {
          state.initialize();
        }
      }
    }
  )
);

// Export store type for TypeScript
export type ConfigStore = ReturnType<typeof useConfigStore>;