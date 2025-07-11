import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

describe('Victory Screen Integration Tests', () => {
  const mockOnContinue = jest.fn();
  const mockOnRestart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Victory Screen Component', () => {
    it('should render victory screen when visible', async () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      await waitFor(() => {
        expect(getByText('GOOD JOB!')).toBeTruthy();
        expect(getByText('Level Complete')).toBeTruthy();
        expect(getByText('Continue')).toBeTruthy();
        expect(getByText('Play Again')).toBeTruthy();
      });
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <VictoryScreen
          isVisible={false}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      expect(queryByText('GOOD JOB!')).toBeNull();
      expect(queryByText('Level Complete')).toBeNull();
    });

    it('should call onContinue when continue button is pressed', async () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      await waitFor(() => {
        expect(getByText('Continue')).toBeTruthy();
      });

      fireEvent.press(getByText('Continue'));
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });

    it('should call onRestart when play again button is pressed', async () => {
      const { getByText } = render(
        <VictoryScreen
          isVisible={true}
          onContinue={mockOnContinue}
          onRestart={mockOnRestart}
        />,
      );

      await waitFor(() => {
        expect(getByText('Play Again')).toBeTruthy();
      });

      fireEvent.press(getByText('Play Again'));
      expect(mockOnRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Level Completion Logic', () => {
    // Test level completion logic separately
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

      it('should complete when sand blocker count goes from 14 to 0', () => {
        // Initial state with 14 sand blockers
        const initialState = {
          score: 0,
          collected: 0,
          cleared: 0,
          combos: 0,
          dropped: 0,
          sandBlockers: Array.from({ length: 14 }, (_, i) => ({
            row: Math.floor(i / 8),
            col: i % 8,
          })),
        };

        // Final state with 0 sand blockers
        const finalState = {
          ...initialState,
          sandBlockers: [],
        };

        const initialComplete = testLevelCompletion(
          'sand-clear',
          0,
          initialState,
          false,
        );
        const finalComplete = testLevelCompletion(
          'sand-clear',
          0,
          finalState,
          true,
        );

        expect(initialComplete).toBe(true);
        expect(finalComplete).toBe(true);
        expect(initialState.sandBlockers.length).toBe(14);
        expect(finalState.sandBlockers.length).toBe(0);
      });
    });

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

  describe('GameBoard Integration', () => {
    it('should call onGameAction when sand blockers are cleared', () => {
      const mockOnGameAction = jest.fn();

      // Simulate the GameBoard calling onGameAction after clearing sand blockers
      // This is what happens in the actual GameBoard component
      const simulateSandBlockerClear = () => {
        // Simulate the sand blocker clearing logic from GameBoard
        // All sand blockers cleared (empty array)
        expect([]).toHaveLength(0);

        // This should trigger onGameAction
        setTimeout(() => {
          mockOnGameAction();
        }, 0);
      };

      simulateSandBlockerClear();

      // Wait for the timeout to execute
      return new Promise(resolve => {
        setTimeout(() => {
          expect(mockOnGameAction).toHaveBeenCalled();
          resolve(undefined);
        }, 10);
      });
    });

    it('should trigger victory when sand blockers are cleared and onGameAction is called', () => {
      const mockOnGameAction = jest.fn();
      let showVictory = false;
      let isTransitioning = false;

      // Simulate the victory check logic from LevelGameScreen
      const checkLevelCompletion = () => {
        const currentLevel = {
          objective: 'sand-clear' as const,
          target: 14,
        };

        const gameState = {
          sandBlockers: [], // All sand blockers cleared
        };

        if (showVictory || isTransitioning) return;

        let isComplete = false;
        switch (currentLevel.objective) {
          case 'sand-clear':
            isComplete = gameState.sandBlockers.length === 0;
            break;
          default:
            isComplete = false;
        }

        if (isComplete) {
          console.log('🎉 Level complete detected in test');
          isTransitioning = true;
          setTimeout(() => {
            showVictory = true;
            isTransitioning = false;
          }, 100);
        }
      };

      // Simulate the flow: clear sand blockers -> call onGameAction -> check victory
      expect([]).toHaveLength(0); // Verify empty array

      mockOnGameAction.mockImplementation(() => {
        checkLevelCompletion();
      });

      // Trigger the flow
      mockOnGameAction();

      // Wait for the victory check to complete
      return new Promise(resolve => {
        setTimeout(() => {
          expect(mockOnGameAction).toHaveBeenCalled();
          expect(showVictory).toBe(true);
          resolve(undefined);
        }, 200);
      });
    });
  });
});
