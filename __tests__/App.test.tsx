/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {act} from 'react-test-renderer';

// Mock the services to prevent infinite loops
jest.mock('../src/services/firebase', () => ({
  initializeFirebase: jest.fn(),
}));

jest.mock('../src/services/gameMode', () => ({
  gameModeService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    isProdMode: jest.fn().mockReturnValue(true),
    getNextLevel: jest.fn().mockResolvedValue('level-1'),
    isLevelUnlocked: jest.fn().mockResolvedValue(true),
    getUnlockedLevels: jest
      .fn()
      .mockResolvedValue(['level-1', 'level-2', 'level-3']),
    getUserProgress: jest.fn().mockResolvedValue(null),
    completeLevel: jest.fn().mockResolvedValue(undefined),
    updateCurrency: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/services/userProgress', () => ({
  userProgressService: {
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

it('renders correctly', async () => {
  let tree: any;
  await act(async () => {
    tree = renderer.create(<App />);
  });
  expect(tree).toBeTruthy();
});
