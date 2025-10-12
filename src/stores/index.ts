// Store exports for easy importing
export { useConfigStore } from './config-store';
export { useUIStore } from './ui-store';

// Store types
export type { ConfigStore } from './config-store';
export type { UIStore } from './ui-store';

// Legacy exports for backward compatibility during migration
// TODO: Remove these after migration is complete
export { useConfigStore as useStore } from './config-store';