// DigiCamControl IPC channels for Electron communication
export const DIGICAM_CHANNELS = {
  CAPTURE: 'digicam:capture',
  CHECK_STATUS: 'digicam:check-status',
  NEW_IMAGE: 'digicam:new-image',
  DOWNLOAD_PHOTO: 'digicam:download-photo'
} as const;

export type DigicamChannels = typeof DIGICAM_CHANNELS;