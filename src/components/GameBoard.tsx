import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Svg, {
  Ellipse,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
  Path,
} from 'react-native-svg';
import {Tile} from './Tile';
import {useGame} from '../contexts/GameContext';

import {
  isValidMove,
  findMatches,
  removeMatches,
  dropTiles,
} from '../utils/gameLogic';
import {
  checkIfGameImpossible,
  rearrangeBoard,
} from '../utils/gameImpossibleLogic';

// Enhanced Hole component with realistic hole effect
const ColumnHole: React.FC<{_colIndex: number; _isActive: boolean}> = ({
  _colIndex,
  _isActive,
}) => {
  return (
    <View style={styles.hole}>
      {/* Realistic oval hole */}
      <Svg width={42} height={20} style={styles.holeSvg}>
        <Defs>
          {/* Radial gradient for hole depth */}
          <RadialGradient
            id={`holeDepth${_colIndex}`}
            cx="50%"
            cy="30%"
            rx="70%"
            ry="80%">
            <Stop offset="0%" stopColor="#1a1a1a" />
            <Stop offset="40%" stopColor="#3a3a3a" />
            <Stop offset="70%" stopColor="#5a5a5a" />
            <Stop offset="100%" stopColor="#7a7a7a" />
          </RadialGradient>

          {/* Gradient for bottom highlight */}
          <RadialGradient
            id={`bottomHighlight${_colIndex}`}
            cx="50%"
            cy="80%"
            rx="60%"
            ry="40%">
            <Stop offset="0%" stopColor="#9a9a9a" />
            <Stop offset="100%" stopColor="transparent" />
          </RadialGradient>
        </Defs>

        {/* The main hole with depth */}
        <Ellipse
          cx="21"
          cy="10"
          rx="18"
          ry="7"
          fill={`url(#holeDepth${_colIndex})`}
        />

        {/* Bottom highlight for depth */}
        <Ellipse
          cx="21"
          cy="10"
          rx="16"
          ry="6"
          fill={`url(#bottomHighlight${_colIndex})`}
        />

        {/* Darker top section - smaller inner oval */}
        <Ellipse cx="21" cy="8" rx="14" ry="5" fill="#1a1a1a" opacity="0.8" />

        {/* Hole rim shadow for depth */}
        <Ellipse
          cx="21"
          cy="10"
          rx="18"
          ry="7"
          fill="none"
          stroke="#555555"
          strokeWidth="1.5"
          opacity="0.8"
        />
      </Svg>
    </View>
  );
};

// Simple particle effect component
const FallingParticles: React.FC<{_colIndex: number; isActive: boolean}> = ({
  _colIndex,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <View style={styles.particleContainer}>
      {/* Dust particles that look more realistic */}
      {Array.from({length: 6}, (_, i) => (
        <View
          key={i}
          style={[
            styles.particle,
            {
              left: 6 + i * 5,
              top: 1 + (i % 3) * 1,
              backgroundColor: ['#8B4513', '#A0522D', '#CD853F', '#D2691E'][
                i % 4
              ],
              opacity: 0.4 + i * 0.1,
            },
          ]}
        />
      ))}
    </View>
  );
};

export const GameBoard: React.FC<{
  variant?: 'sand' | 'sea';
  sandBlockers?: Array<{row: number; col: number}>;
}> = ({variant = 'sand', sandBlockers = []}) => {
  const {gameState, dispatchGame, dispatchCurrency} = useGame();
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [_isProcessingMatches, setIsProcessingMatches] = useState(false);
  const [matchedTiles, setMatchedTiles] = useState<Set<string>>(new Set());
  const [fallingTiles, setFallingTiles] = useState<Map<string, number>>(
    new Map(),
  );

  // Game state refs for immediate access during processing
  const currentBoardRef = useRef<any[][]>([]);
  const isProcessingMoveRef = useRef(false);
  const isProcessingMatchesRef = useRef(false);
  // Add ref to track current sand blocker state during processing
  const currentSandBlockersRef = useRef<
    Array<{row: number; col: number; hasUmbrella: boolean}>
  >([]);

  // Initialize refs when game state changes
  useEffect(() => {
    currentBoardRef.current = gameState.board;
    currentSandBlockersRef.current = [...gameState.sandBlockers];
  }, [gameState.board, gameState.sandBlockers]);

  // Track if board has been initialized
  const hasInitializedRef = useRef(false);
  // Store initial sand blockers to prevent re-initialization
  const initialSandBlockersRef = useRef(sandBlockers);

  // Debug isProcessingMove state changes
  useEffect(() => {
    // console.log('isProcessingMove changed to:', isProcessingMove);
  }, [isProcessingMove]);

  // Initialize game on mount if not already initialized
  useEffect(() => {
    if (!hasInitializedRef.current && gameState.board.length === 0) {
      console.log('GameBoard: Initializing board');
      hasInitializedRef.current = true;
      dispatchGame({
        type: 'INIT_BOARD',
        payload: {variant, sandBlockers: initialSandBlockersRef.current},
      });
    }
  }, [dispatchGame, variant, gameState.board.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTilePress = (_row: number, _col: number) => {
    // Do nothing on tap - only swipe works
  };

  const handleTileSwipe = (
    row: number,
    col: number,
    direction: 'up' | 'down' | 'left' | 'right',
  ) => {
    console.log('=== SWIPE ATTEMPT ===');
    console.log('Swipe attempted:', {
      row,
      col,
      direction,
      isProcessingMove: isProcessingMoveRef.current,
      isProcessingMatches: isProcessingMatchesRef.current,
    });
    console.log(
      'Current board state:',
      currentBoardRef.current.map(row => row.map(tile => tile?.type || 'null')),
    );

    if (isProcessingMoveRef.current || isProcessingMatchesRef.current) {
      console.log('Move or match processing in progress, ignoring swipe', {
        isProcessingMove: isProcessingMoveRef.current,
        isProcessingMatches: isProcessingMatchesRef.current,
      });
      return; // Prevent moves while processing
    }

    let targetRow = row;
    let targetCol = col;

    // Calculate target position based on swipe direction
    switch (direction) {
      case 'up':
        targetRow = row - 1;
        break;
      case 'down':
        targetRow = row + 1;
        break;
      case 'left':
        targetCol = col - 1;
        break;
      case 'right':
        targetCol = col + 1;
        break;
    }

    // Check if target position is within bounds
    if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) {
      console.log('Target position out of bounds');
      return;
    }

    // Check if target position has a sand blocker
    const hasSandBlocker = gameState.sandBlockers.some(
      blocker => blocker.row === targetRow && blocker.col === targetCol,
    );
    if (hasSandBlocker) {
      console.log('Target position has sand blocker');
      return;
    }

    // Log the board and tile types at the swipe location
    console.log(
      'handleTileSwipe: board at swipe:',
      currentBoardRef.current.map(row => row.map(tile => tile?.type || 'null')),
    );
    console.log(
      'handleTileSwipe: tile at swipe:',
      currentBoardRef.current[row]?.[col]?.type,
      'target:',
      currentBoardRef.current[targetRow]?.[targetCol]?.type,
    );

    // Check if the move is valid using current board state
    console.log('Checking if move is valid:', {row, col, targetRow, targetCol});
    console.log(
      'Current board state:',
      currentBoardRef.current.map(row => row.map(tile => tile?.type || 'null')),
    );

    // Use the most current board state for validation
    const currentBoard = currentBoardRef.current;
    console.log(
      'About to call isValidMove with board:',
      currentBoard.map(row => row.map(tile => tile?.type || 'null')),
    );
    const isValid = isValidMove(currentBoard, row, col, targetRow, targetCol);
    console.log('isValidMove result:', isValid);
    if (isValid) {
      console.log('Valid move, initiating swap');
      // Set processing to true immediately when user initiates a valid swap
      setIsProcessingMove(true);
      isProcessingMoveRef.current = true;
      performSwap(row, col, targetRow, targetCol);
    } else {
      console.log('Invalid move');
    }
    console.log('=== END SWIPE ATTEMPT ===');
  };

  const performSwap = (
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ) => {
    console.log('Performing swap');
    setMatchedTiles(new Set()); // Clear any existing matched tiles

    // Create the swapped board state immediately
    const swappedBoard = currentBoardRef.current.map(row => [...row]);
    const temp = swappedBoard[row1][col1];
    swappedBoard[row1][col1] = swappedBoard[row2][col2];
    swappedBoard[row2][col2] = temp;

    // Perform the swap immediately
    dispatchGame({
      type: 'SWAP_TILES',
      payload: {row1, col1, row2, col2},
    });

    // Wait a short time for the swap animation to complete, then process the turn
    setTimeout(() => {
      console.log(
        'Processing turn with swapped board:',
        swappedBoard.map(row => row.map(tile => tile?.type || 'null')),
      );
      // Pass the current umbrella state for the new turn using refs
      processGameTurn(
        swappedBoard,
        row1,
        col1,
        row2,
        col2,
        0, // cascadeCount
        [...currentSandBlockersRef.current], // currentSandBlockers
      );
    }, 150); // Short delay for swap animation
  };

  // Check if the game is impossible (no valid moves available)
  // Using imported functions from gameImpossibleLogic.ts

  const processGameTurn = (
    board: any[][],
    row1?: number,
    col1?: number,
    row2?: number,
    col2?: number,
    cascadeCount: number = 0,
    currentSandBlockers?: Array<{
      row: number;
      col: number;
      hasUmbrella: boolean;
    }>,
  ) => {
    console.log(
      'Processing turn with board:',
      board.map(row => row.map(tile => tile?.type || 'null')),
    );

    // Reset isProcessingMove since swap animation is complete (only on first call)
    if (cascadeCount === 0) {
      setIsProcessingMove(false);
      isProcessingMoveRef.current = false;
      console.log('Set isProcessingMove to false (swap complete)');
    }

    // First, find matches
    const matches = findMatches(board);
    console.log('Matches found:', matches);

    if (matches.length > 0) {
      // Set match processing to true
      setIsProcessingMatches(true);
      isProcessingMatchesRef.current = true;
      console.log('Set isProcessingMatches to true');

      // Show matched tiles fading out
      const matchedPositions = new Set<string>();
      matches.forEach(match => {
        match.forEach(pos => {
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });
      });
      setMatchedTiles(matchedPositions);

      // Process sand blockers atomically to avoid race conditions
      const sandBlockersToCheck =
        currentSandBlockers || currentSandBlockersRef.current;

      console.log('Current sand blockers:', sandBlockersToCheck);
      console.log('Cascade count:', cascadeCount);
      console.log('Matches found:', matches);

      // Find all sand blockers adjacent to matches and count adjacent matches
      const adjacentBlockers = new Map<string, number>(); // key: "row,col", value: match count

      matches.forEach(match => {
        match.forEach(pos => {
          const adjacentPositions = [
            {row: pos.row - 1, col: pos.col}, // up
            {row: pos.row + 1, col: pos.col}, // down
            {row: pos.row, col: pos.col - 1}, // left
            {row: pos.row, col: pos.col + 1}, // right
          ];

          adjacentPositions.forEach(adjPos => {
            if (
              adjPos.row >= 0 &&
              adjPos.row < 8 &&
              adjPos.col >= 0 &&
              adjPos.col < 8
            ) {
              const blockerKey = `${adjPos.row},${adjPos.col}`;
              if (
                sandBlockersToCheck.some(
                  b => b.row === adjPos.row && b.col === adjPos.col,
                )
              ) {
                // Count this match for this sand blocker
                adjacentBlockers.set(
                  blockerKey,
                  (adjacentBlockers.get(blockerKey) || 0) + 1,
                );
              }
            }
          });
        });
      });

      // Process adjacent sand blockers and calculate final state
      let finalSandBlockers = [...sandBlockersToCheck];

      adjacentBlockers.forEach((matchCount, blockerKey) => {
        const [row, col] = blockerKey.split(',').map(Number);
        const blocker = {row, col};

        console.log(
          `Sand blocker at ${blocker.row},${blocker.col} - adjacent to ${matchCount} matches`,
        );

        // Find the sand blocker and check if it has an umbrella
        const blockerIndex = finalSandBlockers.findIndex(
          b => b.row === blocker.row && b.col === blocker.col,
        );

        if (blockerIndex === -1) return; // Blocker not found

        const sandBlocker = finalSandBlockers[blockerIndex];
        const hasUmbrella = sandBlocker.hasUmbrella;

        console.log(
          `Sand blocker at ${blocker.row},${blocker.col} - has umbrella: ${hasUmbrella}`,
        );

        if (hasUmbrella && matchCount === 1) {
          // First match: remove umbrella
          console.log(
            `Removing umbrella from sand blocker at ${blocker.row},${blocker.col}`,
          );
          finalSandBlockers[blockerIndex] = {
            ...sandBlocker,
            hasUmbrella: false,
          };
        } else if (
          (hasUmbrella && matchCount >= 2) ||
          (!hasUmbrella && matchCount >= 1)
        ) {
          // Multiple matches on umbrella sand blocker OR any match on non-umbrella sand blocker: clear completely
          console.log(
            `Clearing sand blocker at ${blocker.row},${blocker.col} due to ${matchCount} adjacent matches`,
          );
          finalSandBlockers = finalSandBlockers.filter(
            b => !(b.row === blocker.row && b.col === blocker.col),
          );
        }
      });

      // Update game state with final sand blocker state
      dispatchGame({
        type: 'SET_SAND_BLOCKERS',
        payload: finalSandBlockers,
      });

      // Update refs immediately for next cascade
      currentSandBlockersRef.current = finalSandBlockers;

      console.log('Final sand blockers:', finalSandBlockers);

      // Calculate the final board state immediately (no intermediate gappy state)
      const boardAfterRemoval = removeMatches(board, matches);
      const boardAfterDrop = dropTiles(
        boardAfterRemoval,
        variant,
        finalSandBlockers, // Use updated sand blockers
      );

      // Calculate which tiles need to fall for animation
      const falling = calculateFallingTiles(boardAfterRemoval, boardAfterDrop);

      // Set falling state for all tiles at once to ensure synchronized animation
      setFallingTiles(falling);

      console.log(
        'Updated to final board state:',
        boardAfterDrop.map(row => row.map(tile => tile?.type || 'null')),
      );

      // Calculate score and count collected tiles
      let collectedTiles = 0;
      let matchScore = 0;

      matches.forEach(match => {
        // Score calculation: base points per tile + bonus for longer matches
        const basePoints = 10;
        const lengthBonus = Math.max(0, match.length - 3) * 5; // Bonus for matches longer than 3
        const matchPoints = match.length * basePoints + lengthBonus;
        matchScore += matchPoints;

        // Count collected tiles for collect objectives
        match.forEach(pos => {
          const tileType = board[pos.row][pos.col]?.type;
          if (tileType === '🐚') {
            collectedTiles++;
          }
        });
      });

      // Add score to game state
      dispatchGame({type: 'ADD_SCORE', payload: matchScore});

      // Create updated board with cleared sand blocker positions filled
      let updatedBoard = boardAfterDrop.map(row => [...row]);

      // Fill cleared sand blocker positions with new tiles
      const clearedBlockers = sandBlockersToCheck.filter(
        blocker =>
          !finalSandBlockers.some(
            finalBlocker =>
              finalBlocker.row === blocker.row &&
              finalBlocker.col === blocker.col,
          ),
      );
      clearedBlockers.forEach((blocker: {row: number; col: number}) => {
        const tileTypes =
          variant === 'sand'
            ? (['🦀', '🌴', '⭐', '🌺', '🐚'] as const)
            : (['🦑', '🦐', '🐡', '🪝'] as const);
        const randomType =
          tileTypes[Math.floor(Math.random() * tileTypes.length)];
        updatedBoard[blocker.row][blocker.col] = {
          id: `${blocker.row}-${blocker.col}-${Date.now()}-${Math.random()}`,
          type: randomType,
          row: blocker.row,
          col: blocker.col,
        };
      });

      // Update board state immediately but keep matched tiles visible for animation
      dispatchGame({type: 'UPDATE_BOARD', payload: updatedBoard});
      currentBoardRef.current = updatedBoard;
      dispatchGame({type: 'INCREMENT_COMBOS'});

      // Add collected tiles to currency if any were collected
      if (collectedTiles > 0) {
        dispatchCurrency({type: 'ADD_SHELLS', payload: collectedTiles});
      }

      // Clear matched tiles after explosion animation
      setTimeout(() => {
        setMatchedTiles(new Set());
      }, 500); // Wait for explosion animation to complete

      // Clear falling animation after it completes
      setTimeout(() => {
        setFallingTiles(new Map());
      }, 1000);

      // Check for game win
      if (gameState.combos + matches.length >= gameState.targetCombos) {
        handleGameWin();
      }

      // Recursively process next round of matches after animations
      setTimeout(() => {
        console.log(
          'Starting next round of matches, cascade count:',
          cascadeCount + 1,
        );
        processGameTurn(
          updatedBoard, // Use the updated board with filled sand blocker positions
          undefined,
          undefined,
          undefined,
          undefined,
          cascadeCount + 1,
          finalSandBlockers, // Pass the updated sand blockers to the next cascade
        );
      }, 1200); // Wait for animations to complete before next round
    } else {
      // No matches found, finish processing
      if (
        cascadeCount === 0 &&
        row1 !== undefined &&
        col1 !== undefined &&
        row2 !== undefined &&
        col2 !== undefined
      ) {
        // No matches on first swap - revert the swap
        dispatchGame({
          type: 'SWAP_TILES',
          payload: {row1: row2, col1: col2, row2: row1, col2: col1},
        });
      }

      // Check if game is impossible after no matches
      if (cascadeCount === 0) {
        const isImpossible = checkIfGameImpossible(currentBoardRef.current);
        if (isImpossible) {
          console.log('Game is impossible - rearranging board...');
          const rearrangedBoard = rearrangeBoard(
            currentBoardRef.current,
            currentSandBlockers || sandBlockers,
          );
          dispatchGame({type: 'UPDATE_BOARD', payload: rearrangedBoard});
          currentBoardRef.current = rearrangedBoard;
        }
      }

      // No need to update sand blocker state here as it's already updated atomically during processing

      setIsProcessingMove(false);
      setIsProcessingMatches(false);
      isProcessingMoveRef.current = false;
      isProcessingMatchesRef.current = false;
      console.log('=== PROCESSING COMPLETE ===');
      console.log(
        'Set isProcessingMove and isProcessingMatches to false (no matches or cascades left)',
      );
      console.log(
        'Final board state:',
        currentBoardRef.current.map(row =>
          row.map(tile => tile?.type || 'null'),
        ),
      );
      console.log('=== END PROCESSING ===');

      // Add a small delay to ensure state updates have propagated
      setTimeout(() => {
        console.log('State reset complete - ready for new moves');
      }, 50);
    }
  };

  const handleGameWin = () => {
    // Award currency
    dispatchCurrency({type: 'ADD_SHELLS', payload: 1});
    dispatchCurrency({type: 'ADD_KEYS', payload: 1});

    // Mark game as won
    dispatchGame({type: 'SET_GAME_WON'});
  };

  const getTileFallDistance = (row: number, col: number) => {
    return fallingTiles.get(`${row}-${col}`) || 0;
  };

  const calculateFallingTiles = (
    boardAfterRemoval: any[][],
    boardAfterDrop: any[][],
  ) => {
    const falling = new Map<string, number>();

    // For each column, find tiles that should be falling
    for (let col = 0; col < 8; col++) {
      // Get sand blocker positions in this column
      const sandBlockerRows = currentSandBlockersRef.current
        .filter(blocker => blocker.col === col)
        .map(blocker => blocker.row)
        .sort((a, b) => a - b);

      // Create sections separated by sand blockers
      const sections: Array<{start: number; end: number}> = [];
      let currentStart = 0;

      for (const blockerRow of sandBlockerRows) {
        if (blockerRow > currentStart) {
          sections.push({start: currentStart, end: blockerRow - 1});
        }
        currentStart = blockerRow + 1;
      }

      // Add the final section if there's space after the last sand blocker
      if (currentStart < 8) {
        sections.push({start: currentStart, end: 7});
      }

      // Process each section independently for falling calculation
      for (const section of sections) {
        // Find gaps in this section after removal
        const gaps: number[] = [];
        for (let row = section.start; row <= section.end; row++) {
          if (boardAfterRemoval[row][col] === null) {
            gaps.push(row);
          }
        }

        if (gaps.length > 0) {
          // Mark tiles in this section that need to fall
          for (
            let finalRow = section.start;
            finalRow <= section.end;
            finalRow++
          ) {
            const finalTile = boardAfterDrop[finalRow][col];
            if (finalTile) {
              // Find where this tile was in the board after removal (within this section)
              let originalRow = -1;
              for (let row = section.start; row <= section.end; row++) {
                if (
                  boardAfterRemoval[row][col] &&
                  boardAfterRemoval[row][col].id === finalTile.id
                ) {
                  originalRow = row;
                  break;
                }
              }

              // If this tile moved down (fell) within the section, mark it for falling animation
              if (originalRow >= 0 && finalRow > originalRow) {
                falling.set(`${finalRow}-${col}`, finalRow - originalRow);
              }

              // If this is a new tile (not found in original board), it should fall from the top of the section
              if (originalRow === -1) {
                // Calculate how far it should fall within this section
                const fallDistance = finalRow - section.start + 1;
                falling.set(`${finalRow}-${col}`, fallDistance);
              }
            }
          }
        }
      }
    }

    return falling;
  };

  const renderBackground = () => {
    if (variant === 'sand') {
      return (
        <View style={styles.backgroundContainer}>
          <Svg
            style={styles.sandSvg}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 360 400">
            <Defs>
              <SvgLinearGradient
                id="sandGradient1"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%">
                <Stop offset="0%" stopColor="#d2b48c" />
                <Stop offset="100%" stopColor="#c19a6b" />
              </SvgLinearGradient>
              <SvgLinearGradient
                id="sandGradient2"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%">
                <Stop offset="0%" stopColor="#c19a6b" />
                <Stop offset="100%" stopColor="#b08d5a" />
              </SvgLinearGradient>
              <SvgLinearGradient
                id="sandGradient3"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%">
                <Stop offset="0%" stopColor="#b08d5a" />
                <Stop offset="100%" stopColor="#9f7a49" />
              </SvgLinearGradient>
            </Defs>

            {/* Base sand shape with wavy edges */}
            <Path
              d="M -10,-10 
                 Q 22.5,-8 45,0 
                 Q 67.5,8 90,0 
                 Q 112.5,-8 135,0 
                 Q 157.5,8 180,0 
                 Q 202.5,-8 225,0 
                 Q 247.5,8 270,0 
                 Q 292.5,-8 315,0 
                 Q 337.5,8 370,0 
                 L 370,410 
                 Q 337.5,408 315,400 
                 Q 292.5,392 270,400 
                 Q 247.5,408 225,400 
                 Q 202.5,392 180,400 
                 Q 157.5,408 135,400 
                 Q 112.5,392 90,400 
                 Q 67.5,408 45,400 
                 Q 22.5,392 -10,410 
                 Z"
              fill="url(#sandGradient1)"
            />

            {/* Horizontal wave stripe 1 */}
            <Path
              d="M 0,90 
                 Q 22.5,82 45,90 
                 Q 67.5,98 90,90 
                 Q 112.5,82 135,90 
                 Q 157.5,98 180,90 
                 Q 202.5,82 225,90 
                 Q 247.5,98 270,90 
                 Q 292.5,82 315,90 
                 Q 337.5,98 360,90 
                 L 360,150 
                 Q 337.5,142 315,150 
                 Q 292.5,158 270,150 
                 Q 247.5,142 225,150 
                 Q 202.5,158 180,150 
                 Q 157.5,142 135,150 
                 Q 112.5,158 90,150 
                 Q 67.5,142 45,150 
                 Q 22.5,158 0,150 
                 Z"
              fill="url(#sandGradient2)"
              opacity="0.6"
            />

            {/* Horizontal wave stripe 2 */}
            <Path
              d="M 0,210 
                 Q 30,202 60,210 
                 Q 90,218 120,210 
                 Q 150,202 180,210 
                 Q 210,218 240,210 
                 Q 270,202 300,210 
                 Q 330,218 360,210 
                 Q 390,202 360,210 
                 L 360,270 
                 Q 330,262 300,270 
                 Q 270,278 240,270 
                 Q 210,262 180,270 
                 Q 150,278 120,270 
                 Q 90,262 60,270 
                 Q 30,278 0,270 
                 Q -30,262 0,270 
                 Z"
              fill="url(#sandGradient3)"
              opacity="0.4"
            />
          </Svg>
        </View>
      );
    } else if (variant === 'sea') {
      return (
        <View style={styles.backgroundContainer}>
          <Svg
            style={styles.seaSvg}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 360 400">
            <Defs>
              <SvgLinearGradient
                id="seaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%">
                <Stop offset="0%" stopColor="#87CEEB" />
                <Stop offset="50%" stopColor="#4682B4" />
                <Stop offset="100%" stopColor="#1E3A8A" />
              </SvgLinearGradient>
              <SvgLinearGradient
                id="seafloorGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%">
                <Stop offset="0%" stopColor="#d2b48c" />
                <Stop offset="100%" stopColor="#c19a6b" />
              </SvgLinearGradient>
            </Defs>

            {/* Sea background - covers entire area */}
            <Path
              d="M -10,-10 
                 L 370,-10 
                 L 370,410 
                 L -10,410 
                 Z"
              fill="url(#seaGradient)"
            />

            {/* Seafloor sand layer with wavy top edge */}
            <Path
              d="M -10,300 
                 Q 30,290 60,300 
                 Q 90,310 120,300 
                 Q 150,290 180,300 
                 Q 210,310 240,300 
                 Q 270,290 300,300 
                 Q 330,310 370,300 
                 L 370,410 
                 L -10,410 
                 Z"
              fill="url(#seafloorGradient)"
            />

            {/* Seaweed plants */}
            {Array.from({length: 8}, (_, i) => (
              <Path
                key={i}
                d={`M ${45 + i * 40},300 
                   Q ${45 + i * 40},280 ${45 + i * 40},260 
                   Q ${35 + i * 40},250 ${45 + i * 40},240 
                   Q ${55 + i * 40},230 ${45 + i * 40},220 
                   Q ${35 + i * 40},210 ${45 + i * 40},200 
                   Q ${55 + i * 40},190 ${45 + i * 40},180`}
                stroke="#228B22"
                strokeWidth="5"
                fill="none"
                opacity="0.8"
              />
            ))}
          </Svg>
        </View>
      );
    }
    return null;
  };

  // Variant-specific container styling
  const getContainerStyle = () => {
    const baseStyle = {
      marginTop: -20,
      overflow: 'hidden' as const,
      paddingTop: 20,
      borderRadius: 20,
      padding: 12,
      width: 360,
      alignSelf: 'center' as const,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      position: 'relative' as const,
    };

    return {
      ...baseStyle,
      backgroundColor: 'transparent',
    };
  };

  if (gameState.board.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Holes at the top where new tiles drop from */}
      <View style={styles.holesRow}>
        {Array.from({length: 8}, (_, colIndex) => (
          <View key={`hole-container-${colIndex}`} style={styles.holeContainer}>
            <ColumnHole
              _colIndex={colIndex}
              _isActive={fallingTiles.has(`0-${colIndex}`)}
            />
            <FallingParticles
              _colIndex={colIndex}
              isActive={fallingTiles.has(`0-${colIndex}`)}
            />
          </View>
        ))}
      </View>

      {/* Clipping container to hide tiles above hole midpoints */}
      <View style={getContainerStyle()}>
        {renderBackground()}

        {/* Game board */}
        {gameState.board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((tile, colIndex) => {
              const sandBlocker = gameState.sandBlockers.find(
                blocker => blocker.row === rowIndex && blocker.col === colIndex,
              );
              const hasSandBlocker = !!sandBlocker;
              const hasUmbrella = sandBlocker?.hasUmbrella || false;

              // Use the original for now, but this will help us debug
              if (hasSandBlocker) {
                return (
                  <View
                    key={`sand-blocker-${rowIndex}-${colIndex}`}
                    style={[
                      styles.sandBlocker,
                      {
                        position: 'relative',
                        width: 40,
                        height: 40,
                        margin: 1,
                      },
                    ]}>
                    <Text style={styles.sandBlockerText}>
                      {hasUmbrella ? '🏖️' : ''}
                    </Text>
                  </View>
                );
              }
              return tile ? (
                <Tile
                  key={tile.id}
                  tile={tile}
                  onPress={() => handleTilePress(rowIndex, colIndex)}
                  onSwipe={direction =>
                    handleTileSwipe(rowIndex, colIndex, direction)
                  }
                  isMatched={false}
                  isFalling={fallingTiles.has(`${rowIndex}-${colIndex}`)}
                  fallDistance={getTileFallDistance(rowIndex, colIndex)}
                />
              ) : (
                <View
                  key={`empty-${rowIndex}-${colIndex}`}
                  style={styles.emptyTile}
                />
              );
            })}
          </View>
        ))}

        {/* Separate layer for matched tiles (exploding) */}
        {Array.from(matchedTiles).map(matchKey => {
          const [rowStr, colStr] = matchKey.split('-');
          const row = parseInt(rowStr);
          const col = parseInt(colStr);
          const originalTile = gameState.board[row]?.[col];

          if (originalTile) {
            return (
              <View
                key={`matched-${originalTile.id}`}
                style={[
                  styles.matchedTileContainer,
                  {
                    top: row * 42, // 40 (tile height) + 2 (margin)
                    left: col * 42,
                  },
                ]}>
                <Tile
                  tile={originalTile}
                  onPress={() => {}} // No interaction for matched tiles
                  onSwipe={() => {}} // No interaction for matched tiles
                  isMatched={true}
                  isFalling={false}
                  fallDistance={0}
                />
              </View>
            );
          }
          return null;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  holesRow: {
    flexDirection: 'row',
    marginBottom: 20, // Increased from 10 to 20 to move holes up
  },
  holeContainer: {
    position: 'relative',
    width: 42, // Match tile spacing exactly
    height: 20,
    marginHorizontal: 0, // Remove margin to align perfectly
  },
  hole: {
    width: 42, // Match tile width (40) + margin (2)
    height: 20,
    marginHorizontal: 0, // Remove margin to align perfectly
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeOuter: {
    width: 40, // Match tile width exactly
    height: 20, // Proper oval height
    borderRadius: 0, // No border radius - let SVG be the shape
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  holeInnerContainer: {
    width: 34,
    height: 16, // Proper oval height
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeSvg: {
    width: '100%',
    height: '100%',
  },
  holeGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  holeHighlight1: {
    position: 'absolute',
    top: 1,
    left: 7,
    width: 10,
    height: 3,
    backgroundColor: '#444',
    borderRadius: 3,
    opacity: 0.3,
  },
  holeHighlight2: {
    position: 'absolute',
    top: 2,
    left: 9,
    width: 6,
    height: 2,
    backgroundColor: '#666',
    borderRadius: 2,
    opacity: 0.5,
  },
  holeHighlight3: {
    position: 'absolute',
    top: 3,
    left: 11,
    width: 3,
    height: 1,
    backgroundColor: '#888',
    borderRadius: 1,
    opacity: 0.7,
  },
  holeInnerShadow: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: 34,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  holeInnerShadow2: {
    position: 'absolute',
    top: 16,
    left: 2,
    width: 30,
    height: 1,
    backgroundColor: '#000',
    borderRadius: 1,
    opacity: 0.7,
  },
  holeInnerShadow3: {
    position: 'absolute',
    top: 14,
    left: 4,
    width: 26,
    height: 1,
    backgroundColor: '#000',
    borderRadius: 1,
    opacity: 0.5,
  },
  holeRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 20,
    borderRadius: 0, // No border radius - let SVG be the shape
    borderWidth: 1,
    borderColor: '#444',
    opacity: 0.3,
  },
  emptyTile: {
    width: 40,
    height: 40,
    margin: 1,
    backgroundColor: 'transparent',
  },
  matchedTileContainer: {
    position: 'absolute',
    width: 42,
    height: 42,
    zIndex: 10,
  },
  holeGlow: {
    position: 'absolute',
    top: 0,
    left: 1, // Center the glow within the container (42-40)/2 = 1
    width: 40,
    height: 20, // Match the new oval height
    borderRadius: 0, // No border radius - let SVG be the shape
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  holeGlowActive: {
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 12,
  },
  holeOuterActive: {
    transform: [{scale: 1.1}],
    shadowOpacity: 0.9,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  sandSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  seaSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    width: 'auto',
    height: 'auto',
    overflow: 'hidden',
    zIndex: -1,
  },
  sandBlocker: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: '#D2B48C',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B4513',
    zIndex: 10,
  },
  sandBlockerText: {
    fontSize: 24,
  },
});
