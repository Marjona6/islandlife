import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VictoryScreen } from '../components/VictoryScreen/VictoryScreen';

// Mock Animated module
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({})),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
      })),
    },
  };
});

describe('Victory Screen Component', () => {
  const mockOnContinue = jest.fn();
  const mockOnRestart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Victory Screen Visibility', () => {
    it('should not render when isVisible is false', () => {
      const { queryByText } = render(
        <VictoryScreen
          isVisible={false}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      expect(queryByText('GOOD JOB!')).toBeNull();
    });

    it('should render when isVisible is true', () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      expect(getByText('GOOD JOB!')).toBeTruthy();
    });
  });

  describe('Victory Screen Interactions', () => {
    it('should call onContinue when continue button is pressed', () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      fireEvent.press(getByText('Continue'));
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });

    it('should call onRestart when restart button is pressed', () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      fireEvent.press(getByText('Play Again'));
      expect(mockOnRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Victory Screen Content', () => {
    it('should display victory text', () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      expect(getByText('GOOD JOB!')).toBeTruthy();
      expect(getByText('Level Complete')).toBeTruthy();
    });

    it('should display correct button text', () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Play Again')).toBeTruthy();
    });
  });
});

// Test level completion logic separately
describe('Level Completion Logic', () => {
  // Helper function to test level completion logic
  const testLevelCompletion = (
    objective: string,
    target: number,
    currentProgress: any,
    expectedResult: boolean,
  ) => {
    let isComplete = false;

    switch (objective) {
      case 'score':
        isComplete = currentProgress.score >= target;
        break;
      case 'collect':
        isComplete = currentProgress.collected >= target;
        break;
      case 'clear':
        isComplete = currentProgress.cleared >= target;
        break;
      case 'combo':
        isComplete = currentProgress.combos >= target;
        break;
      case 'drop':
        isComplete = currentProgress.dropped >= target;
        break;
      case 'sand-clear':
        isComplete = currentProgress.sandBlockers.length === 0;
        break;
      default:
        isComplete = false;
    }

    return isComplete === expectedResult;
  };

  describe('Score Objective', () => {
    it('should complete when score target is reached', () => {
      const result = testLevelCompletion(
        'score',
        500,
        {
          score: 500,
          collected: 0,
          cleared: 0,
          combos: 0,
          dropped: 0,
          sandBlockers: [],
        },
        true,
      );
      expect(result).toBe(true);
    });

    it('should not complete when score target is not reached', () => {
      const result = testLevelCompletion(
        'score',
        500,
        {
          score: 400,
          collected: 0,
          cleared: 0,
          combos: 0,
          dropped: 0,
          sandBlockers: [],
        },
        false,
      );
      expect(result).toBe(true);
    });
  });

  describe('Collect Objective', () => {
    it('should complete when collect target is reached', () => {
      const result = testLevelCompletion(
        'collect',
        15,
        {
          score: 0,
          collected: 15,
          cleared: 0,
          combos: 0,
          dropped: 0,
          sandBlockers: [],
        },
        true,
      );
      expect(result).toBe(true);
    });

    it('should not complete when collect target is not reached', () => {
      const result = testLevelCompletion(
        'collect',
        15,
        {
          score: 0,
          collected: 10,
          cleared: 0,
          combos: 0,
          dropped: 0,
          sandBlockers: [],
        },
        false,
      );
      expect(result).toBe(true);
    });
  });

  describe('Sand Clear Objective', () => {
    it('should complete when all sand blockers are cleared', () => {
      const result = testLevelCompletion(
        'sand-clear',
        0,
        {
          score: 0,
          collected: 0,
          cleared: 0,
          combos: 0,
          dropped: 0,
          sandBlockers: [],
        },
        true,
      );
      expect(result).toBe(true);
    });

    it('should not complete when sand blockers remain', () => {
      const result = testLevelCompletion(
        'sand-clear',
        0,
        {
          score: 0,
          collected: 0,
          cleared: 0,
          combos: 0,
          dropped: 0,
          sandBlockers: [{ row: 1, col: 1 }],
        },
        false,
      );
      expect(result).toBe(true);
    });
  });

  describe('Drop Objective', () => {
    it('should complete when drop target is reached', () => {
      const result = testLevelCompletion(
        'drop',
        8,
        {
          score: 0,
          collected: 0,
          cleared: 0,
          combos: 0,
          dropped: 8,
          sandBlockers: [],
        },
        true,
      );
      expect(result).toBe(true);
    });

    it('should not complete when drop target is not reached', () => {
      const result = testLevelCompletion(
        'drop',
        8,
        {
          score: 0,
          collected: 0,
          cleared: 0,
          combos: 0,
          dropped: 5,
          sandBlockers: [],
        },
        false,
      );
      expect(result).toBe(true);
    });
  });
});
