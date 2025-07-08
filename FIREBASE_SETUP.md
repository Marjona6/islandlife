# Firebase Setup Guide

This guide will help you set up Firebase for the Island Life game project.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `islandlife-game` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add iOS App

1. In Firebase project settings, click the iOS icon (🍎)
2. Enter your iOS bundle ID: `com.islandlife`
   - This is found in `android/app/build.gradle` as `applicationId`
3. Enter app nickname: `Island Life iOS`
4. Click "Register app"
5. Download `GoogleService-Info.plist`
6. Add the file to your iOS project:
   ```bash
   # Copy the downloaded file to your iOS project
   cp ~/Downloads/GoogleService-Info.plist ios/islandlife/
   ```

## Step 3: Add Android App

1. In Firebase project settings, click the Android icon (🤖)
2. Enter your Android package name: `com.islandlife`
   - This is found in `android/app/build.gradle` as `applicationId`
3. Enter app nickname: `Island Life Android`
4. Click "Register app"
5. Download `google-services.json`
6. Add the file to your Android project:
   ```bash
   # Copy the downloaded file to your Android project
   cp ~/Downloads/google-services.json android/app/
   ```

## Step 4: Enable Firebase Services

### Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Anonymous" authentication:
   - Click "Anonymous"
   - Toggle "Enable"
   - Click "Save"
3. Optionally enable "Email/Password" for account linking:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## Step 5: Security Rules (Optional)

For production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 6: Verify Setup

1. **Check Configuration Files**:

   ```bash
   # Verify iOS config exists
   ls -la ios/islandlife/GoogleService-Info.plist

   # Verify Android config exists
   ls -la android/app/google-services.json
   ```

2. **Test Firebase Connection**:

   ```bash
   # Run the app and check console logs
   npm run ios  # or npm run android
   ```

   You should see:

   ```
   Firebase initialized successfully
   ```

3. **Test Authentication**:
   - Set `GAME_MODE=PROD` in your `.env` file
   - Run the app
   - Check that anonymous authentication works

## Troubleshooting

### Common Issues

1. **"No Firebase App '[DEFAULT]' has been created"**

   - Ensure configuration files are in the correct locations
   - Check that bundle ID/package name matches Firebase project
   - Restart the app after adding configuration files

2. **"Firebase not available"**

   - Verify Firebase project is created
   - Check that services (Auth, Firestore) are enabled
   - Ensure configuration files are properly added

3. **Authentication Fails**
   - Verify Anonymous authentication is enabled in Firebase Console
   - Check network connectivity
   - Review Firebase Console logs for errors

### Development vs Production

- **Development**: Use "test mode" Firestore rules
- **Production**: Update security rules to restrict access
- **Environment Variables**: Use `GAME_MODE=DEV` for testing without Firebase

## Next Steps

After Firebase is set up:

1. **Test the app** in both DEV and PROD modes
2. **Verify user progress** is saved to Firestore
3. **Test anonymous authentication** works correctly
4. **Consider adding** email/password authentication for account linking

## Support

If you encounter issues:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Review [React Native Firebase Setup](https://rnfirebase.io/)
3. Check Firebase Console for error logs
4. Verify configuration files are correct
