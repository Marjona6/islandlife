import {initializeFirebase} from '../src/services/firebase';

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  default: {
    app: jest.fn(() => ({})),
    initializeApp: jest.fn(() => ({})),
  },
}));

describe('Firebase Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Firebase app when not already initialized', () => {
    const firebaseApp = require('@react-native-firebase/app').default;

    // Mock that Firebase is not initialized
    firebaseApp.app.mockImplementation(() => {
      throw new Error('No Firebase App');
    });

    initializeFirebase();

    expect(firebaseApp.initializeApp).toHaveBeenCalled();
  });

  it('should not reinitialize Firebase if already initialized', () => {
    const firebaseApp = require('@react-native-firebase/app').default;

    // Mock that Firebase is already initialized
    firebaseApp.app.mockReturnValue({});

    initializeFirebase();

    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
  });

  it('should handle Firebase initialization errors gracefully', () => {
    const firebaseApp = require('@react-native-firebase/app').default;

    // Mock that Firebase throws an error
    firebaseApp.app.mockImplementation(() => {
      throw new Error('Firebase error');
    });
    firebaseApp.initializeApp.mockImplementation(() => {
      throw new Error('Initialization error');
    });

    // Should not throw
    expect(() => {
      initializeFirebase();
    }).not.toThrow();
  });
});
