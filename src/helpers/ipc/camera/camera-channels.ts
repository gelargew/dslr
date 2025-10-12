// Camera IPC channels for Electron communication
export const CAMERA_CHANNELS = {
  GET_DEVICES: 'camera:get-devices',
  GET_PERMISSIONS: 'camera:get-permissions',
  REQUEST_PERMISSIONS: 'camera:request-permissions',
  CAPTURE_PHOTO: 'camera:capture-photo',
  // New digicampro channels
  CAPTURE_FROM_SERVER: 'camera:capture-from-server',
  TEST_CONNECTION: 'camera:test-connection',
} as const;

export type CameraChannels = typeof CAMERA_CHANNELS;
