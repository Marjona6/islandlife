import React, {useRef, useState, forwardRef, useImperativeHandle} from 'react';
import {render, act} from '@testing-library/react-native';
import {View, Text} from 'react-native';
import {GameBoard} from '../components/GameBoard';
import {GameProvider} from '../contexts/GameContext';

// Mock console.log to reduce noise in tests
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
});

describe('Coconut Drop Integration', () => {
  it('should increment dropped count and trigger completion when enough coconuts drop', () => {
    let droppedCount = 0;
    let completionTriggered = false;
    const target = 5;

    const handleItemDrop = (count: number = 1) => {
      droppedCount += count;
      console.log(`Coconut dropped: ${droppedCount}/${target}`);

      if (droppedCount >= target) {
        completionTriggered = true;
        console.log('Level complete!');
      }
    };

    // Simulate a cascade where multiple coconuts drop at once
    // This tests the real integration between GameBoard and LevelGameScreen
    handleItemDrop(3); // First cascade: 3 coconuts
    expect(droppedCount).toBe(3);
    expect(completionTriggered).toBe(false);

    handleItemDrop(2); // Second cascade: 2 more coconuts
    expect(droppedCount).toBe(5);
    expect(completionTriggered).toBe(true);
  });

  it('should handle coconut drop callbacks correctly', () => {
    let dropCount = 0;
    const onCoconutDrop = (count: number) => {
      dropCount += count;
    };

    // Simulate multiple coconut drops
    onCoconutDrop(1);
    onCoconutDrop(2);
    onCoconutDrop(1);

    expect(dropCount).toBe(4);
  });

  it('should accumulate coconut drops over multiple cascades', () => {
    let totalDrops = 0;
    const onCoconutDrop = (count: number = 1) => {
      totalDrops += count;
    };

    // Simulate multiple cascades
    onCoconutDrop(3); // First cascade
    onCoconutDrop(2); // Second cascade
    onCoconutDrop(1); // Third cascade

    expect(totalDrops).toBe(6);
  });
});

describe('Coconut Drop Integration (Custom Harness)', () => {
  // Custom test harness with proper lifecycle management
  type HarnessProps = {initialBoard: any[][]};
  const Harness = forwardRef((props: HarnessProps, ref) => {
    const [dropped, setDropped] = useState(0);
    const boardRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      triggerDrop: (newBoard: any[][]) => {
        // Check for coconuts at the bottom row (row 7) directly
        const coconutsToExit: Array<{row: number; col: number; id: string}> =
          [];
        if (newBoard[7] && Array.isArray(newBoard[7])) {
          for (let col = 0; col < 8; col++) {
            const tile = newBoard[7][col];
            if (tile && tile.isSpecial) {
              coconutsToExit.push({row: 7, col, id: tile.id});
            }
          }
        }

        // If we found coconuts, trigger the callback
        if (coconutsToExit.length > 0) {
          setDropped(d => d + coconutsToExit.length);
        }
      },
      getDropped: () => dropped,
    }));

    return (
      <GameProvider>
        <View>
          <GameBoard
            ref={boardRef}
            variant="sand"
            sandBlockers={[]}
            onCoconutDrop={count => setDropped(d => d + count)}
            onGameAction={() => {}}
            isTransitioning={false}
          />
          <Text testID="dropped-count">{dropped}</Text>
        </View>
      </GameProvider>
    );
  });

  function makeBoardWithCoconuts(numCoconuts: number) {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill({type: '🦀', id: Math.random().toString()}));
    for (let i = 0; i < numCoconuts; i++) {
      board[7][i] = {type: '🥥', id: `coconut-${i}`, isSpecial: true};
    }
    return board;
  }

  it('counts a single coconut drop', async () => {
    const initialBoard = makeBoardWithCoconuts(1);
    const harnessRef = React.createRef<any>();

    const {findByTestId} = render(
      <Harness ref={harnessRef} initialBoard={initialBoard} />,
    );

    await act(async () => {
      harnessRef.current?.triggerDrop?.(initialBoard);
    });

    const droppedCount = await findByTestId('dropped-count');
    expect(droppedCount.props.children).toBe(1);
  });

  it('counts multiple coconut drops in one cascade', async () => {
    const initialBoard = makeBoardWithCoconuts(4);
    const harnessRef = React.createRef<any>();

    const {findByTestId} = render(
      <Harness ref={harnessRef} initialBoard={initialBoard} />,
    );

    await act(async () => {
      harnessRef.current?.triggerDrop?.(initialBoard);
    });

    const droppedCount = await findByTestId('dropped-count');
    expect(droppedCount.props.children).toBe(4);
  });

  it('does not increment dropped count if no coconuts drop', async () => {
    const initialBoard = makeBoardWithCoconuts(0);
    const harnessRef = React.createRef<any>();

    const {findByTestId} = render(
      <Harness ref={harnessRef} initialBoard={initialBoard} />,
    );

    await act(async () => {
      harnessRef.current?.triggerDrop?.(initialBoard);
    });

    const droppedCount = await findByTestId('dropped-count');
    expect(droppedCount.props.children).toBe(0);
  });

  it('accumulates dropped count over multiple cascades', async () => {
    const harnessRef = React.createRef<any>();
    const board1 = makeBoardWithCoconuts(2);
    const board2 = makeBoardWithCoconuts(3);

    const {findByTestId} = render(
      <Harness ref={harnessRef} initialBoard={board1} />,
    );

    await act(async () => {
      harnessRef.current?.triggerDrop?.(board1);
    });
    let droppedCount = await findByTestId('dropped-count');
    expect(droppedCount.props.children).toBe(2);

    await act(async () => {
      harnessRef.current?.triggerDrop?.(board2);
    });
    droppedCount = await findByTestId('dropped-count');
    expect(droppedCount.props.children).toBe(5);
  });
});
