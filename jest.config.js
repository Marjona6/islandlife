module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-animatable|react-native-linear-gradient|@react-native-firebase)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/__mocks__/setupTests.js'],
  // Add timeout configuration to prevent tests from running indefinitely
  testTimeout: 10000, // 10 seconds per test
  maxWorkers: 1, // Run tests sequentially to avoid conflicts
  bail: 1, // Stop on first failure
};
