// Camera IPC channels for Electron communication
export const CAMERA_CHANNELS = {
  GET_DEVICES: 'camera:get-devices',
  GET_PERMISSIONS: 'camera:get-permissions',
  REQUEST_PERMISSIONS: 'camera:request-permissions',
  CAPTURE_PHOTO: 'camera:capture-photo',
} as const;

export type CameraChannels = typeof CAMERA_CHANNELS;
