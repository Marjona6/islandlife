import {userProgressService} from '../src/services/userProgress';
import {gameModeService} from '../src/services/gameMode';

// Mock Firebase
jest.mock('@react-native-firebase/auth', () => ({
  default: jest.fn(() => ({
    currentUser: null,
    signInAnonymously: jest.fn().mockResolvedValue({
      user: {
        uid: 'anonymous-user-123',
        email: null,
        isAnonymous: true,
        displayName: null,
      },
    }),
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    EmailAuthProvider: {
      credential: jest.fn(),
    },
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: false,
          data: () => null,
        }),
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      })),
    })),
  })),
}));

// Mock game mode service
jest.mock('../src/services/gameMode', () => ({
  gameModeService: {
    isProdMode: jest.fn(),
    isDevMode: jest.fn(),
  },
}));

describe('User Progress Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign in anonymously in PROD mode', async () => {
    // Mock PROD mode
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(true);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(false);

    // Mock Firebase Auth
    const auth = require('@react-native-firebase/auth').default;
    const mockSignInAnonymously = jest.fn().mockResolvedValue({
      user: {
        uid: 'anonymous-user-123',
        email: null,
        isAnonymous: true,
        displayName: null,
      },
    });
    auth.mockImplementation(() => ({
      currentUser: null,
      signInAnonymously: mockSignInAnonymously,
      onAuthStateChanged: jest.fn(),
    }));

    await userProgressService.initialize();

    expect(mockSignInAnonymously).toHaveBeenCalled();
  });

  it('should not sign in anonymously in DEV mode', async () => {
    // Mock DEV mode
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(false);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(true);

    // Mock Firebase Auth
    const auth = require('@react-native-firebase/auth').default;
    const mockSignInAnonymously = jest.fn();
    auth.mockImplementation(() => ({
      currentUser: null,
      signInAnonymously: mockSignInAnonymously,
      onAuthStateChanged: jest.fn(),
    }));

    await userProgressService.initialize();

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it('should not sign in anonymously if user already exists', async () => {
    // Mock PROD mode
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(true);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(false);

    // Mock Firebase Auth with existing user
    const auth = require('@react-native-firebase/auth').default;
    const mockSignInAnonymously = jest.fn();
    auth.mockImplementation(() => ({
      currentUser: {
        uid: 'existing-user-123',
        email: 'test@example.com',
        isAnonymous: false,
        displayName: 'Test User',
      },
      signInAnonymously: mockSignInAnonymously,
      onAuthStateChanged: jest.fn(),
    }));

    await userProgressService.initialize();

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it('should handle Firebase initialization errors gracefully', async () => {
    // Mock PROD mode
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(true);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(false);

    // Mock Firebase Auth to throw an error
    const auth = require('@react-native-firebase/auth').default;
    const mockSignInAnonymously = jest
      .fn()
      .mockRejectedValue(new Error('Firebase error'));
    auth.mockImplementation(() => ({
      currentUser: null,
      signInAnonymously: mockSignInAnonymously,
      onAuthStateChanged: jest.fn(),
    }));

    // Should not throw an error
    await expect(userProgressService.initialize()).resolves.toBeUndefined();
  });
});
