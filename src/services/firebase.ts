// Lazy Firebase imports to avoid initialization errors
let auth: any = null;
let firestore: any = null;

const getAuth = () => {
  if (!auth) {
    try {
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
  try {
    // Firebase is auto-initialized when the app starts
    // We just need to ensure our services are ready
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Don't throw - allow app to continue without Firebase in development
  }
};

// Export Firebase services with lazy loading
export const getFirebaseAuth = getAuth;
export const getFirebaseFirestore = getFirestore;
