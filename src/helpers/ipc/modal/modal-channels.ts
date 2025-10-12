// Modal IPC channels for Electron communication
export const MODAL_CHANNELS = {
  OPEN_CONFIG: 'modal:open-config',
  CLOSE_CONFIG: 'modal:close-config',
} as const;

export type ModalChannels = typeof MODAL_CHANNELS;