// Mock Firebase Auth
const mockAuth = () => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(callback => {
    // Simulate anonymous user
    callback({
      uid: 'test-user-id',
      email: null,
      isAnonymous: true,
      displayName: null,
    });
    return jest.fn(); // Return unsubscribe function
  }),
  signInAnonymously: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: null,
      isAnonymous: true,
      displayName: null,
    },
  }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      isAnonymous: false,
      displayName: null,
    },
  }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      isAnonymous: false,
      displayName: null,
    },
  }),
  signOut: jest.fn().mockResolvedValue(),
  EmailAuthProvider: {
    credential: jest.fn().mockReturnValue({}),
  },
});

// Mock Firebase Firestore
const mockFirestore = () => ({
  collection: jest.fn().mockReturnValue({
    doc: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: false,
        data: () => null,
      }),
      set: jest.fn().mockResolvedValue(),
      update: jest.fn().mockResolvedValue(),
    }),
  }),
});

// Mock Firebase App
const mockApp = () => ({
  // Add any app-level mocks if needed
});

module.exports = {
  auth: mockAuth,
  firestore: mockFirestore,
  app: mockApp,
};
