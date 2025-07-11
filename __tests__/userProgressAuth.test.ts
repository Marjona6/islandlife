import { userProgressService } from '../src/services/userProgress';
import { gameModeService } from '../src/services/gameMode';

// Mock Firebase
const mockAuth: any = {
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
};

const mockFirestore = {
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
};

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
}));

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
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

    // Reset mock to ensure clean state
    mockAuth.signInAnonymously.mockClear();
    mockAuth.currentUser = null;

    await userProgressService.initialize();

    expect(mockAuth.signInAnonymously).toHaveBeenCalled();
  });

  it('should not sign in anonymously in DEV mode', async () => {
    // Mock DEV mode
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(false);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(true);

    // Reset mock to ensure clean state
    mockAuth.signInAnonymously.mockClear();
    mockAuth.currentUser = null;

    await userProgressService.initialize();

    expect(mockAuth.signInAnonymously).not.toHaveBeenCalled();
  });

  it('should not sign in anonymously if user already exists', async () => {
    // Mock PROD mode
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(true);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(false);

    // Set existing user
    mockAuth.currentUser = {
      uid: 'existing-user-123',
      email: 'test@example.com',
      isAnonymous: false,
      displayName: 'Test User',
    };
    mockAuth.signInAnonymously.mockClear();

    await userProgressService.initialize();

    expect(mockAuth.signInAnonymously).not.toHaveBeenCalled();
  });

  it('should handle Firebase initialization errors gracefully', async () => {
    // Mock PROD mode
    (gameModeService.isProdMode as jest.Mock).mockReturnValue(true);
    (gameModeService.isDevMode as jest.Mock).mockReturnValue(false);

    // Mock Firebase Auth to throw an error
    mockAuth.signInAnonymously.mockRejectedValue(new Error('Firebase error'));
    mockAuth.currentUser = null;

    // Should not throw an error
    await expect(userProgressService.initialize()).resolves.toBeUndefined();
  });
});
