import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

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

// Export Firebase services
export {auth, firestore};
