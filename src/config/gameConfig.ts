// Game configuration
export const GAME_CONFIG = {
  // Game mode - can be set via environment variable or build configuration
  // In development, you can change this to 'DEV' for testing
  GAME_MODE: 'PROD' as 'PROD' | 'DEV',

  // Firebase configuration
  FIREBASE: {
    // Add your Firebase config here when ready
    // For now, we'll use the default config from google-services.json/google-services.plist
  },

  // Game settings
  GAME: {
    MAX_LEVELS: 8,
    DEFAULT_CURRENCY: {
      shells: 0,
      gems: 0,
    },
  },
};

// Helper function to get game mode
export const getGameMode = (): 'PROD' | 'DEV' => {
  // You can implement different ways to determine the mode:
  // 1. Environment variable (requires additional setup)
  // 2. Build configuration
  // 3. Remote config
  // 4. Simple flag in code

  return GAME_CONFIG.GAME_MODE;
};
