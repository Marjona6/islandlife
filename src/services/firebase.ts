// Lazy Firebase imports to avoid initialization errors
let auth: any = null;
let firestore: any = null;
let app: any = null;
let isInitialized = false;

const initializeFirebaseApp = () => {
  if (isInitialized) return;

  try {
    const firebaseApp = require('@react-native-firebase/app').default;

    // Check if Firebase is already initialized
    try {
      firebaseApp.app();
      console.log('Firebase already initialized');
    } catch (error) {
      // Firebase not initialized, check if config files exist
      console.warn('Firebase not initialized. Please ensure you have:');
      console.warn('- Android: android/app/google-services.json');
      console.warn('- Firebase project created and configured');

      try {
        // Try to initialize with default config
        firebaseApp.initializeApp();
        console.log('Firebase initialized successfully');
      } catch (initError) {
        console.error('Failed to initialize Firebase:', initError);
        console.warn('Continuing without Firebase features');
        return;
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    console.warn(
      'Firebase not available - continuing without Firebase features',
    );
  }
};

const getApp = () => {
  if (!app) {
    try {
      app = require('@react-native-firebase/app').default;
      initializeFirebaseApp();
    } catch (error) {
      console.warn('Firebase App not available:', error);
      return null;
    }
  }
  return app;
};

const getAuth = () => {
  if (!auth) {
    try {
      initializeFirebaseApp();
      auth = require('@react-native-firebase/auth').default;
    } catch (error) {
      console.warn('Firebase Auth not available:', error);
      return null;
    }
  }
  return auth;
};

const getFirestore = () => {
  if (!firestore) {
    try {
      initializeFirebaseApp();
      firestore = require('@react-native-firebase/firestore').default;
    } catch (error) {
      console.warn('Firestore not available:', error);
      return null;
    }
  }
  return firestore;
};

// Firebase configuration
export const firebaseConfig = {
  // You'll need to add your Firebase config here
  // For now, we'll use the default config from google-services.json/google-services.plist
};

// Initialize Firebase services
export const initializeFirebase = () => {
  initializeFirebaseApp();
};

// Export Firebase services with lazy loading
export const getFirebaseAuth = getAuth;
export const getFirebaseFirestore = getFirestore;
export const getFirebaseApp = getApp;
