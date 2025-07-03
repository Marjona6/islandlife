# Island Revive - Match-3 Puzzle Game

A React Native prototype for a match-3 mobile puzzle game with a renovation/story meta layer. Players solve match-3 levels to earn resources and decorate a tropical beach property.

## Features

### 🎮 Match-3 Game

- 8x8 grid with 5 different tile types (🌴 🐚 🌺 🐠 ⭐)
- Tap or swipe adjacent tiles to swap them
- Match 3+ of the same type in a row/column to clear them
- Tiles fall down to fill empty spaces; new tiles spawn from the top
- Win condition: match at least 10 combos to complete the level

### 💰 Currency System

- Earn 1 shell (🐚) and 1 key (🔑) for every level win
- Currency persists between sessions using AsyncStorage
- Display currency count at the top of both screens

### 🏖️ Beach Decoration Meta Layer

- After winning a level, visit the "Beach Hut" screen
- Purchase decorations using earned keys:
  - 🌴 Palm Tree (1 key)
  - 🪑 Beach Chair (2 keys)
  - ⛱️ Beach Umbrella (3 keys)
  - 🏐 Volleyball Net (5 keys)
- Purchased items appear permanently on your beach
- Simple navigation between Game and Beach screens

## Technical Stack

- **React Native** (0.73.9) - Mobile app framework
- **React Navigation** - Screen navigation
- **AsyncStorage** - Local data persistence
- **Context API** - State management
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. For iOS (requires macOS):

   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

4. For Android:
   ```bash
   npm run android
   ```

## How to Play

1. **Start the Game**: The app opens to the match-3 game screen
2. **Match Tiles**: Tap two adjacent tiles to swap them and create matches of 3 or more
3. **Complete Levels**: Achieve 10 combos to win the level and earn currency
4. **Visit Beach**: Tap the "🏖️ Beach" button to go to the decoration screen
5. **Buy Decorations**: Use your earned keys to purchase beach items
6. **Decorate**: Watch your beach transform as you add more items

## Project Structure

```
src/
├── components/
│   ├── GameBoard.tsx    # Main game board component
│   └── Tile.tsx         # Individual tile component
├── contexts/
│   └── GameContext.tsx  # Game state management
├── screens/
│   ├── GameScreen.tsx   # Match-3 game screen
│   └── BeachScreen.tsx  # Beach decoration screen
├── types/
│   └── game.ts          # TypeScript type definitions
└── utils/
    └── gameLogic.ts     # Match-3 game logic
```

## Future Enhancements

This is a prototype. Future versions could include:

- Boosters and power-ups
- Story dialogues and characters
- More complex levels and objectives
- Monetization features
- Sound effects and animations
- Multiplayer features

## Development Notes

- The game uses emoji-based tiles for simplicity
- All game state is managed through React Context
- Data persistence is handled with AsyncStorage
- Navigation is implemented with React Navigation Stack
- The codebase is fully typed with TypeScript

## License

This is a prototype project for educational and demonstration purposes.

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
