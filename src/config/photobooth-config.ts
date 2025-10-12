// Textimoni Photobooth Application Configuration
export const CONFIG = {
  enableCountdown: true, // Set to false for 1-second countdown
};

// Helper functions for ALL countdowns
export const getCountdownDuration = (): number => {
  return CONFIG.enableCountdown ? 3 : 1;
};

export const getThankYouDuration = (): number => {
  return CONFIG.enableCountdown ? 10 : 1;
};

export const getEditLandingDuration = (): number => {
  return CONFIG.enableCountdown ? 10 : 1;
};
