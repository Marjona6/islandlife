// Modern Firebase imports using modular API
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

let app: any = null;
let auth: any = null;
let firestore: any = null;
let isInitialized = false;

const initializeFirebaseApp = () => {
  if (isInitialized) return;

  try {
    // Get the default Firebase app (auto-initialized from google-services.json)
    app = getApp();
    console.log('Firebase initialized successfully');
    isInitialized = true;
  } catch (error) {
    console.error('Error getting Firebase app:', error);
    console.warn(
      'Firebase not available - continuing without Firebase features',
    );
  }
};

const getFirebaseApp = (): any => {
  if (!app) {
    try {
      app = getApp();
      initializeFirebaseApp();
    } catch (error) {
      console.warn('Firebase App not available:', error);
      return null;
    }
  }
  return app;
};

const getFirebaseAuth = (): any => {
  if (!auth) {
    try {
      initializeFirebaseApp();
      auth = getAuth();
    } catch (error) {
      console.warn('Firebase Auth not available:', error);
      return null;
    }
  }
  return auth;
};

const getFirebaseFirestore = (): any => {
  if (!firestore) {
    try {
      initializeFirebaseApp();
      firestore = getFirestore();
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

// Export Firebase services with modern API
export { getFirebaseAuth, getFirebaseFirestore, getFirebaseApp };
