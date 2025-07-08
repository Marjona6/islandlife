# Game Mode Implementation

This document describes the implementation of the PROD/DEV game mode system with environment variable support and Firebase anonymous authentication.

## Overview

The game now supports two distinct modes:

- **PROD Mode**: Production mode with sequential level progression and user progress tracking via Firebase
- **DEV Mode**: Development mode with free access to all levels for testing

## Environment Variable Setup

### 1. Environment Files

The game mode is controlled by the `GAME_MODE` environment variable. Create the following files:

```bash
# .env (default - PROD mode)
GAME_MODE=PROD

# .env.dev (for development)
GAME_MODE=DEV

# .env.prod (for production)
GAME_MODE=PROD
```

### 2. Dependencies

The implementation uses `react-native-config` to read environment variables:

```bash
npm install react-native-config
```

## Implementation Details

### 1. Game Mode Service (`src/services/gameMode.ts`)

The game mode service handles:

- Reading the `GAME_MODE` environment variable
- Determining the current mode (PROD/DEV)
- Managing level progression logic
- Providing mode-specific behavior

**Key Methods:**

- `getGameMode()`: Reads from environment variable, defaults to 'PROD'
- `isProdMode()`: Returns true if in PROD mode
- `isDevMode()`: Returns true if in DEV mode
- `getNextLevel()`: Returns next level based on mode and progress

### 2. User Progress Service (`src/services/userProgress.ts`)

Enhanced to support:

- Anonymous authentication in PROD mode
- Automatic user creation for new users
- Progress tracking via Firebase Firestore
- Account linking capabilities

**Key Features:**

- Automatic anonymous sign-in in PROD mode
- No authentication required in DEV mode
- Graceful error handling for Firebase unavailability
- Support for linking anonymous accounts to email/password

### 3. Home Screen Behavior

The Home Screen adapts based on the game mode:

**PROD Mode:**

- Shows "PLAY" button
- Subtitle: "Continue Adventure"
- Navigates directly to next uncompleted level
- Requires user progress tracking

**DEV Mode:**

- Shows "SELECT LEVEL" button
- Subtitle: "Choose Your Level"
- Navigates to level selection screen
- No progress tracking required

## Firebase Configuration

### 1. Required Services

Enable the following Firebase services:

- **Authentication**: Anonymous and Email/Password
- **Firestore**: For user progress storage

### 2. Security Rules

Set up Firestore security rules:

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

### 3. Configuration Files

Place Firebase configuration files:

- Android: `android/app/google-services.json`
- iOS: `ios/islandlife/GoogleService-Info.plist`

## Testing

### 1. Game Mode Logic Tests (`__tests__/gameModeLogic.test.ts`)

Tests cover:

- Environment variable reading
- Mode detection (PROD/DEV)
- Default behavior when environment variable is invalid
- Error handling when react-native-config is unavailable
- Level progression logic

### 2. User Progress Authentication Tests (`__tests__/userProgressAuth.test.ts`)

Tests cover:

- Anonymous authentication in PROD mode
- No authentication in DEV mode
- Handling existing users
- Error handling for Firebase issues

### 3. Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- __tests__/gameModeLogic.test.ts
npm test -- __tests__/userProgressAuth.test.ts
```

## Usage Examples

### 1. Development Workflow

```bash
# Set to DEV mode for testing
echo "GAME_MODE=DEV" > .env

# Start the app
npm run ios  # or npm run android
```

### 2. Production Deployment

```bash
# Set to PROD mode for production
echo "GAME_MODE=PROD" > .env

# Build and deploy
npm run ios  # or npm run android
```

### 3. Switching Modes

To switch between modes:

1. Update the `.env` file
2. Restart the app
3. Clear any cached data if needed

## User Experience

### PROD Mode Flow

1. **First Launch**: User is automatically signed in anonymously
2. **Home Screen**: Shows "PLAY" button leading to level 1
3. **Level Completion**: Progress is saved to Firebase
4. **Subsequent Launches**: "PLAY" button leads to next uncompleted level
5. **Account Linking**: Users can link anonymous accounts to email in Settings

### DEV Mode Flow

1. **Home Screen**: Shows "SELECT LEVEL" button
2. **Level Selection**: All levels are available immediately
3. **No Progress Tracking**: Levels can be played in any order
4. **No Authentication**: No Firebase authentication required

## Firebase Initialization

### Automatic Initialization

Firebase is automatically initialized when the app starts:

```typescript
// In App.tsx
useEffect(() => {
  initializeServices();
}, []);

const initializeServices = async () => {
  // Initialize Firebase first
  initializeFirebase();

  // Then initialize other services
  await gameModeService.initialize();
  await userProgressService.initialize();
};
```

### Smart Initialization Logic

The Firebase service includes smart initialization that:

1. **Checks if Firebase is already initialized** using `firebase.app()`
2. **Only initializes if needed** using `firebase.initializeApp()`
3. **Handles errors gracefully** without crashing the app
4. **Prevents multiple initializations** with a flag

```typescript
const initializeFirebaseApp = () => {
  if (isInitialized) return;

  try {
    const firebaseApp = require('@react-native-firebase/app').default;

    // Check if Firebase is already initialized
    try {
      firebaseApp.app();
      console.log('Firebase already initialized');
    } catch (error) {
      // Firebase not initialized, initialize it
      firebaseApp.initializeApp();
      console.log('Firebase initialized successfully');
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};
```

### Testing Firebase Initialization

Tests verify that Firebase initialization works correctly:

```bash
npm test -- __tests__/firebaseInit.test.ts
```

The tests cover:

- Initialization when Firebase is not initialized
- Skipping initialization when already initialized
- Error handling during initialization

## Error Handling

The implementation includes robust error handling:

1. **Firebase Unavailable**: App continues without Firebase features
2. **Invalid Environment Variable**: Defaults to PROD mode
3. **Authentication Errors**: Gracefully handled without crashing
4. **Network Issues**: Progress is cached locally when possible

## Future Enhancements

Potential improvements:

1. **Google Sign-In**: Add Google authentication option
2. **Remote Config**: Use Firebase Remote Config for dynamic mode switching
3. **Offline Support**: Enhanced offline progress tracking
4. **Analytics**: Track user behavior in different modes
5. **A/B Testing**: Test different progression systems

## Troubleshooting

### Common Issues

1. **Environment Variable Not Read**

   - Ensure `react-native-config` is installed
   - Check `.env` file format (no spaces around `=`)
   - Restart the app after changing `.env`

2. **Firebase Authentication Fails**

   - Verify Firebase configuration files
   - Check Firebase console for service status
   - Ensure anonymous authentication is enabled

3. **Tests Fail**
   - Clear Jest cache: `npm test -- --clearCache`
   - Check mock implementations
   - Verify test environment setup

### Debug Mode

Enable debug logging by adding to your code:

```typescript
console.log('Current game mode:', gameModeService.getGameMode());
console.log('Is PROD mode:', gameModeService.isProdMode());
console.log('Is DEV mode:', gameModeService.isDevMode());
```

## Conclusion

This implementation provides a robust foundation for managing different game modes while maintaining a smooth user experience. The environment variable approach allows for easy switching between development and production modes, while the Firebase integration ensures proper progress tracking in production.
