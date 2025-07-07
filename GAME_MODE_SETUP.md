# Game Mode System Setup

This document explains how to set up and use the PROD/DEV game mode system.

## Overview

The game has two modes:

- **PROD Mode**: Production mode with sequential level progression and user progress tracking
- **DEV Mode**: Development mode with free access to all levels for testing

## Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication with:
   - Anonymous authentication
   - Email/password authentication
3. Enable Firestore database
4. Download the configuration files:
   - `google-services.json` for Android (place in `android/app/`)
   - `GoogleService-Info.plist` for iOS (place in `ios/islandlife/`)

### 2. Game Mode Configuration

To switch between PROD and DEV modes, edit `src/services/gameMode.ts`:

```typescript
// Change this line to switch modes
return 'PROD'; // or 'DEV'
```

### 3. Environment Variable (Optional)

For a more robust solution, you can set up environment variables:

1. Install react-native-config:

   ```bash
   npm install react-native-config
   ```

2. Create `.env` file in the root:

   ```
   GAME_MODE=PROD
   ```

3. Update `src/services/gameMode.ts` to read from environment:

   ```typescript
   import Config from 'react-native-config';

   getGameMode(): GameMode {
     return (Config.GAME_MODE as GameMode) || 'PROD';
   }
   ```

## How It Works

### PROD Mode

- Users start with only Level 1 unlocked
- Must complete each level to unlock the next
- Progress is saved to Firebase
- Home screen shows a single "PLAY" button that takes users to their next level
- Users can link anonymous accounts to email for cross-device progress

### DEV Mode

- All levels are unlocked from the start
- No progress is saved to Firebase
- Home screen shows "SELECT LEVEL" button that opens level selection
- Perfect for testing and development

## User Experience

### PROD Mode Flow

1. User opens app → sees "PLAY" button
2. Taps "PLAY" → goes directly to next uncompleted level
3. Completes level → progress saved automatically
4. Returns to home → "PLAY" button now leads to next level

### DEV Mode Flow

1. User opens app → sees "SELECT LEVEL" button
2. Taps button → sees all levels in a grid
3. Can tap any level to play it
4. No progress is saved

## Account Linking

In PROD mode, users can:

1. Play anonymously (progress saved locally)
2. Link their anonymous account to an email/password
3. Sign out and sign back in with email
4. Access their progress on different devices

## Testing

To test the system:

1. **PROD Mode Testing**:

   - Set mode to 'PROD'
   - Complete levels and verify progression
   - Test account linking in Settings

2. **DEV Mode Testing**:
   - Set mode to 'DEV'
   - Verify all levels are accessible
   - Confirm no progress is saved

## Firebase Security Rules

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

## Troubleshooting

### Firebase Connection Issues

- Verify `google-services.json` and `GoogleService-Info.plist` are in correct locations
- Check Firebase console for authentication and Firestore setup
- Ensure internet connectivity

### Mode Not Switching

- Restart the app after changing the mode
- Check for any cached data
- Verify the mode is set correctly in `gameMode.ts`

### Progress Not Saving

- Check Firebase authentication status
- Verify Firestore rules allow user access
- Check network connectivity
- Review Firebase console for errors
