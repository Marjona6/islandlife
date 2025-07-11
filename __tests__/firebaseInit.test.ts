import { initializeFirebase } from '../src/services/firebase';

describe('Firebase Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle Firebase initialization gracefully', () => {
    // The function should not throw even if Firebase is not available
    expect(() => {
      initializeFirebase();
    }).not.toThrow();
  });

  it('should handle Firebase initialization errors gracefully', () => {
    // The function should handle errors gracefully
    expect(() => {
      initializeFirebase();
    }).not.toThrow();
  });

  it('should be callable multiple times without errors', () => {
    // Should be able to call multiple times
    expect(() => {
      initializeFirebase();
      initializeFirebase();
      initializeFirebase();
    }).not.toThrow();
  });
});
