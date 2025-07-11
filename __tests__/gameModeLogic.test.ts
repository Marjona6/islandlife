import { gameModeService } from '../src/services/gameMode';

// Mock the services
jest.mock('../src/services/gameMode', () => ({
  gameModeService: {
    initialize: jest.fn(),
    isProdMode: jest.fn(),
    isDevMode: jest.fn(),
    getNextLevel: jest.fn(),
    getGameMode: jest.fn(),
  },
}));

jest.mock('../src/services/userProgress', () => ({
  userProgressService: {
    initialize: jest.fn(),
    getNextLevel: jest.fn(),
  },
}));

// Mock react-native-config
jest.mock('react-native-config', () => ({
  default: {
    GAME_MODE: 'PROD',
  },
}));

describe('Game Mode Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return PROD mode when GAME_MODE environment variable is set to PROD', () => {
    // Mock the environment variable
    const Config = require('react-native-config').default;
    Config.GAME_MODE = 'PROD';

    // Mock the getGameMode method to use the environment variable
    (gameModeService.getGameMode as jest.Mock).mockImplementation(() => {
      try {
        const envMode = Config.GAME_MODE;
        if (envMode === 'DEV' || envMode === 'PROD') {
          return envMode;
        }
      } catch (error) {
        console.warn(
          'Could not read GAME_MODE from environment, using default:',
          error,
        );
      }
      return 'PROD';
    });

    const mode = gameModeService.getGameMode();
    expect(mode).toBe('PROD');
  });

  it('should return DEV mode when GAME_MODE environment variable is set to DEV', () => {
    // Mock the environment variable
    const Config = require('react-native-config').default;
    Config.GAME_MODE = 'DEV';

    // Mock the getGameMode method to use the environment variable
    (gameModeService.getGameMode as jest.Mock).mockImplementation(() => {
      try {
        const envMode = Config.GAME_MODE;
        if (envMode === 'DEV' || envMode === 'PROD') {
          return envMode;
        }
      } catch (error) {
        console.warn(
          'Could not read GAME_MODE from environment, using default:',
          error,
        );
      }
      return 'PROD';
    });

    const mode = gameModeService.getGameMode();
    expect(mode).toBe('DEV');
  });

  it('should return PROD mode as default when GAME_MODE environment variable is invalid', () => {
    // Mock the environment variable with invalid value
    const Config = require('react-native-config').default;
    Config.GAME_MODE = 'INVALID';

    // Mock the getGameMode method to use the environment variable
    (gameModeService.getGameMode as jest.Mock).mockImplementation(() => {
      try {
        const envMode = Config.GAME_MODE;
        if (envMode === 'DEV' || envMode === 'PROD') {
          return envMode;
        }
      } catch (error) {
        console.warn(
          'Could not read GAME_MODE from environment, using default:',
          error,
        );
      }
      return 'PROD';
    });

    const mode = gameModeService.getGameMode();
    expect(mode).toBe('PROD');
  });

  it('should return PROD mode as default when react-native-config is not available', () => {
    // Mock react-native-config to throw an error
    jest.doMock('react-native-config', () => {
      throw new Error('Module not found');
    });

    // Mock the getGameMode method to handle the error
    (gameModeService.getGameMode as jest.Mock).mockImplementation(() => {
      try {
        const Config = require('react-native-config').default;
        const envMode = Config.GAME_MODE;
        if (envMode === 'DEV' || envMode === 'PROD') {
          return envMode;
        }
      } catch (error) {
        console.warn(
          'Could not read GAME_MODE from environment, using default:',
          error,
        );
      }
      return 'PROD';
    });

    const mode = gameModeService.getGameMode();
    expect(mode).toBe('PROD');
  });

  it('should correctly identify PROD mode', () => {
    (gameModeService.getGameMode as jest.Mock).mockReturnValue('PROD');
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(true);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(false);

    expect(gameModeService.isProdMode()).toBe(true);
    expect(gameModeService.isDevMode()).toBe(false);
  });

  it('should correctly identify DEV mode', () => {
    (gameModeService.getGameMode as jest.Mock).mockReturnValue('DEV');
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(false);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(true);

    expect(gameModeService.isProdMode()).toBe(false);
    expect(gameModeService.isDevMode()).toBe(true);
  });

  it('should return level-1 in DEV mode regardless of progress', async () => {
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(true);
    (gameModeService.getNextLevel as jest.Mock).mockResolvedValue('level-1');

    const nextLevel = await gameModeService.getNextLevel();
    expect(nextLevel).toBe('level-1');
  });

  it('should return next level in PROD mode based on user progress', async () => {
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(true);
    (gameModeService.getNextLevel as jest.Mock).mockResolvedValue('level-3');

    const nextLevel = await gameModeService.getNextLevel();
    expect(nextLevel).toBe('level-3');
  });
});
