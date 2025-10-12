// Configuration IPC channels for Electron communication
export const CONFIG_CHANNELS = {
  GET_CONFIG: 'config:get',
  SAVE_CONFIG: 'config:save',
  RESET_CONFIG: 'config:reset',
} as const;

export type ConfigChannels = typeof CONFIG_CHANNELS;