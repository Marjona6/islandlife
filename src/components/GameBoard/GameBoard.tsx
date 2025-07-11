import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  Ref,
} from 'react';
import { View, Text } from 'react-native';
import { Tile } from '../Tile/Tile';
import { useGame } from '../../contexts/GameContext';
import { TileType } from '../../types/game';

import {
  isValidMove,
  findMatches,
  removeMatches,
  dropTiles,
  detectBombTrigger,
  getBombExplosionTiles,
  detectRocketTrigger,
  getRocketExplosionTiles,
} from '../../utils/gameLogic';
import {
  checkIfGameImpossible,
  rearrangeBoard,
} from '../../utils/gameImpossibleLogic';
import { styles } from '../../styles/styles';
import { GameBoardHandle, GameBoardProps } from './types';
import { ColumnHole } from './ColumnHole';
import { FallingParticles } from './FallingParticles';
import { renderBackground } from './utils/renderBackground';
import { getContainerStyle } from './utils/getContainerStyle';

const GameBoardInner = (
  {
    variant = 'sand',
    sandBlockers = [],
    onMove,
    onCoconutDrop,
    onGameAction,
    isTransitioning = false,
    testID,
  }: GameBoardProps,
  ref: Ref<GameBoardHandle>,
) => {
  const { gameState, dispatchGame, dispatchCurrency, isInitialized } =
    useGame();
  const [matchedTiles, setMatchedTiles] = useState<Set<string>>(new Set());
  const [fallingTiles, setFallingTiles] = useState<Map<string, number>>(
    new Map(),
  );
  const [bombNotification, setBombNotification] = useState<string | null>(null);
  const [rocketNotification, setRocketNotification] = useState<string | null>(
    null,
  );
  const [shakingTiles, setShakingTiles] = useState<Set<string>>(new Set());
  const [cascadeLevel, setCascadeLevel] = useState<number>(0);

  // Game state refs for immediate access during processing
  const currentBoardRef = useRef<any[][]>([]);
  const isProcessingMoveRef = useRef(false);
  const isProcessingMatchesRef = useRef(false);
  // Add ref to track current sand blocker state during processing
  const currentSandBlockersRef = useRef<
    Array<{
      row: number;
      col: number;
      hasUmbrella: boolean;
      sandLevel?: number;
      hasTreasure?: boolean;
    }>
  >([]);
  // Add ref to collect coconut drops during processing to avoid state conflicts
  const pendingCoconutDropsRef = useRef<
    Array<{ row: number; col: number; id: string }>
  >([]);

  // Expose processGameTurn for testing - must be called before any conditional returns
  useImperativeHandle(ref, () => ({
    processGameTurn,
  }));

  // Initialize refs when game state changes
  useEffect(() => {
    currentBoardRef.current = gameState.board;
    currentSandBlockersRef.current = [...gameState.sandBlockers];
    // Clear pending coconut drops when game state changes
    pendingCoconutDropsRef.current = [];
  }, [gameState.board, gameState.sandBlockers]);

  // Track if board has been initialized
  const hasInitializedRef = useRef(false);
  // Store initial sand blockers to prevent re-initialization
  const initialSandBlockersRef = useRef(sandBlockers);

  // Initialize game on mount if not already initialized and context is ready
  useEffect(() => {
    if (
      isInitialized &&
      !hasInitializedRef.current &&
      gameState.board.length === 0
    ) {
      hasInitializedRef.current = true;
      dispatchGame({
        type: 'INIT_BOARD',
        payload: { variant, sandBlockers: initialSandBlockersRef.current },
      });
    }
  }, [isInitialized, dispatchGame, variant, gameState.board.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Now it's safe to return early
  if (!isInitialized) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const handleTileSwipe = (
    row: number,
    col: number,
    direction: 'up' | 'down' | 'left' | 'right',
  ) => {
    // Prevent swipes during transitions
    if (isTransitioning) {
      return;
    }

    // Prevent swipes during processing
    if (isProcessingMoveRef.current || isProcessingMatchesRef.current) {
      return;
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
      return;
    }

    // Check if target position has a sand blocker
    const hasSandBlocker = currentSandBlockersRef.current.some(
      blocker => blocker.row === targetRow && blocker.col === targetCol,
    );

    if (hasSandBlocker) {
      return;
    }

    // Use the most current board state for validation
    const currentBoard = currentBoardRef.current;
    const isValid = isValidMove(currentBoard, row, col, targetRow, targetCol);
    if (isValid) {
      // Set processing to true immediately when user initiates a valid swap
      isProcessingMoveRef.current = true;
      // Notify parent that a move was made
      onMove?.();
      performSwap(row, col, targetRow, targetCol);
    }
  };

  const performSwap = (
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ) => {
    setMatchedTiles(new Set()); // Clear any existing matched tiles

    // Defensive copy of the board
    const currentBoard = currentBoardRef.current;
    if (!currentBoard || !Array.isArray(currentBoard)) {
      console.warn(
        'performSwap: currentBoard is not available or not an array',
      );
      return;
    }

    const swappedBoard = currentBoard.map(row =>
      Array.isArray(row) ? [...row] : Array(8).fill(null),
    );

    // Defensive check to ensure the rows exist before accessing
    if (
      swappedBoard[row1] &&
      swappedBoard[row2] &&
      Array.isArray(swappedBoard[row1]) &&
      Array.isArray(swappedBoard[row2])
    ) {
      const temp = swappedBoard[row1][col1];
      swappedBoard[row1][col1] = swappedBoard[row2][col2];
      swappedBoard[row2][col2] = temp;
    } else {
      console.warn('performSwap: Invalid board state for swap operation');
      return;
    }

    // Perform the swap immediately
    dispatchGame({
      type: 'SWAP_TILES',
      payload: { row1, col1, row2, col2 },
    });

    // Wait a short time for the swap animation to complete, then process the turn
    setTimeout(() => {
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
    }, 75); // Reduced from 150ms to 75ms for faster response
  };

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
      sandLevel?: number;
      hasTreasure?: boolean;
    }>,
  ) => {
    // Reset isProcessingMove since swap animation is complete (only on first call)
    if (cascadeCount === 0) {
      isProcessingMoveRef.current = false;
      setCascadeLevel(0); // Reset cascade level for new move
    } else {
      setCascadeLevel(cascadeCount); // Update cascade level for staggered animations
    }

    // Check for rocket/bomb mechanics on first cascade only
    let matches: Array<Array<{ row: number; col: number }>> = [];
    let boardAfterProcessing = board;

    if (
      cascadeCount === 0 &&
      row1 !== undefined &&
      col1 !== undefined &&
      row2 !== undefined &&
      col2 !== undefined
    ) {
      // Check for bomb trigger first (bomb takes precedence)
      if (detectBombTrigger(board, row1, col1, row2, col2)) {
        const bombArea = getBombExplosionTiles(row2, col2);
        matches = [bombArea];

        // Show bomb notification and start shaking animation
        setBombNotification('💥 BOMB EXPLOSION! 💥');
        const shakingPositions = new Set<string>();
        bombArea.forEach(({ row, col }) => {
          shakingPositions.add(`${row}-${col}`);
        });
        setShakingTiles(shakingPositions);

        // Process the bomb explosion normally
        boardAfterProcessing = removeMatches(board, [bombArea]);
        boardAfterProcessing = dropTiles(
          boardAfterProcessing,
          variant,
          currentSandBlockers || currentSandBlockersRef.current,
        );

        // Clear bomb notification after 2 seconds
        setTimeout(() => {
          setBombNotification(null);
          setShakingTiles(new Set()); // Clear shaking tiles
        }, 2000);
      } else {
        // Check for rocket trigger
        const rocketResult = detectRocketTrigger(board, row1, col1, row2, col2);
        if (rocketResult.triggered) {
          const rocketArea = getRocketExplosionTiles(
            row2,
            col2,
            rocketResult.isHorizontal,
          );
          matches = [rocketArea];
          boardAfterProcessing = removeMatches(board, [rocketArea]);
          boardAfterProcessing = dropTiles(
            boardAfterProcessing,
            variant,
            currentSandBlockers || currentSandBlockersRef.current,
          );

          // Show rocket notification
          const direction = rocketResult.isHorizontal
            ? 'HORIZONTAL'
            : 'VERTICAL';
          setRocketNotification(`🚀 ${direction} ROCKET! 🚀`);

          // Clear rocket notification after 2 seconds
          setTimeout(() => {
            setRocketNotification(null);
          }, 2000);
        } else {
          // No bomb or rocket, just process normal matches
          matches = findMatches(board);
          if (matches.length > 0) {
            boardAfterProcessing = removeMatches(board, matches);
            boardAfterProcessing = dropTiles(
              boardAfterProcessing,
              variant,
              currentSandBlockers || currentSandBlockersRef.current,
            );
          }
        }
      }
    } else {
      // Normal cascade processing
      matches = findMatches(board);
      if (matches.length > 0) {
        boardAfterProcessing = removeMatches(board, matches);
        boardAfterProcessing = dropTiles(
          boardAfterProcessing,
          variant,
          currentSandBlockers || currentSandBlockersRef.current,
        );
      }
    }

    if (matches.length > 0) {
      // Set match processing to true
      isProcessingMatchesRef.current = true;

      // Show matched tiles fading out
      const matchedPositions = new Set<string>();
      matches.forEach((match: Array<{ row: number; col: number }>) => {
        match.forEach((pos: { row: number; col: number }) => {
          matchedPositions.add(`${pos.row}-${pos.col}`);
        });
      });
      setMatchedTiles(matchedPositions);

      // Process sand blockers atomically to avoid race conditions
      const sandBlockersToCheck =
        currentSandBlockers || currentSandBlockersRef.current;

      // Find all sand blockers adjacent to matches and count adjacent matches
      const adjacentBlockers = new Map<string, number>(); // key: "row,col", value: match count

      matches.forEach((match: Array<{ row: number; col: number }>) => {
        match.forEach((pos: { row: number; col: number }) => {
          const adjacentPositions = [
            { row: pos.row - 1, col: pos.col }, // up
            { row: pos.row + 1, col: pos.col }, // down
            { row: pos.row, col: pos.col - 1 }, // left
            { row: pos.row, col: pos.col + 1 }, // right
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
      const revealedTreasures: Array<{
        row: number;
        col: number;
        treasureType: TileType;
      }> = [];

      adjacentBlockers.forEach((matchCount, blockerKey) => {
        const [row, col] = blockerKey.split(',').map(Number);
        const blocker = { row, col };

        // Find the sand blocker and check if it has an umbrella
        const blockerIndex = finalSandBlockers.findIndex(
          b => b.row === blocker.row && b.col === blocker.col,
        );

        if (blockerIndex === -1) return; // Blocker not found

        const sandBlocker = finalSandBlockers[blockerIndex];
        const hasUmbrella = sandBlocker.hasUmbrella;
        const sandLevel = sandBlocker.sandLevel || 1;
        const hasTreasure = sandBlocker.hasTreasure || false;

        // Handle sand levels: level 1 requires 1 match, level 2 requires 2 matches
        const requiredMatches = sandLevel;

        if (hasUmbrella && matchCount === 1) {
          // First match: remove umbrella
          finalSandBlockers[blockerIndex] = {
            ...sandBlocker,
            hasUmbrella: false,
          };
        } else if (
          (hasUmbrella && matchCount >= requiredMatches) ||
          (!hasUmbrella && matchCount >= requiredMatches)
        ) {
          // Required matches reached: clear the sand blocker

          // If this sand blocker has treasure, reveal it
          if (hasTreasure) {
            const treasureTypes = ['💎', '🪙', '🏺', '💍'];
            const randomTreasure = treasureTypes[
              Math.floor(Math.random() * treasureTypes.length)
            ] as TileType;
            revealedTreasures.push({
              row: blocker.row,
              col: blocker.col,
              treasureType: randomTreasure,
            });
          }

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

      // Reveal treasures if any were uncovered
      revealedTreasures.forEach(treasure => {
        dispatchGame({
          type: 'REVEAL_TREASURE',
          payload: treasure,
        });
      });

      // Trigger level completion check for sand-clear objectives
      if (onGameAction) {
        setTimeout(() => onGameAction(), 0);
      }

      // Use the updated board from processing (which includes rocket/bomb effects)
      // Calculate which tiles need to fall for animation
      const falling = calculateFallingTiles(board, boardAfterProcessing);

      // Set falling state for all tiles at once to ensure synchronized animation
      setFallingTiles(falling);

      // Calculate score and count collected tiles
      let collectedTiles = 0;
      let collectedTreasure = 0;
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
          // Count treasure tiles for buried treasure objectives
          if (tileType && ['💎', '🪙', '🏺', '💍'].includes(tileType)) {
            collectedTreasure++;
          }
        });
      });

      // Add score to game state
      dispatchGame({ type: 'ADD_SCORE', payload: matchScore });

      // Add collected treasure to game state
      if (collectedTreasure > 0) {
        dispatchGame({ type: 'COLLECT_TREASURE', payload: collectedTreasure });
      }

      // Trigger level completion check for score objectives
      if (onGameAction) {
        setTimeout(() => onGameAction(), 0);
      }

      // Create updated board with cleared sand blocker positions filled
      let finalBoard = (boardAfterProcessing || Array(8).fill(null)).map(
        (row: any[]) => (Array.isArray(row) ? [...row] : Array(8).fill(null)),
      );

      // Apply gravity to let tiles fall
      finalBoard = dropTiles(finalBoard, variant, finalSandBlockers);

      // Check for coconuts that have reached the bottom row and should exit
      const coconutsToExit: Array<{ row: number; col: number; id: string }> =
        [];
      if (finalBoard[7] && Array.isArray(finalBoard[7])) {
        for (let col = 0; col < 8; col++) {
          const tile = finalBoard[7][col];
          if (tile && tile.isSpecial) {
            coconutsToExit.push({ row: 7, col, id: tile.id });
          }
        }
      }

      if (coconutsToExit.length > 0) {
        if (onCoconutDrop) onCoconutDrop(coconutsToExit.length);

        // Remove coconuts from the bottom row
        coconutsToExit.forEach(item => {
          finalBoard[item.row][item.col] = null;
          // Collect coconut drops to notify parent later to avoid state conflicts
          pendingCoconutDropsRef.current.push(item);
        });

        // Apply gravity again to fill the gaps left by exiting coconuts
        finalBoard = dropTiles(finalBoard, variant, finalSandBlockers);
      }

      // Update board state immediately but keep matched tiles visible for animation
      dispatchGame({ type: 'UPDATE_BOARD', payload: finalBoard });
      currentBoardRef.current = finalBoard;
      dispatchGame({ type: 'INCREMENT_COMBOS' });

      // Trigger level completion check for combo objectives
      if (onGameAction) {
        setTimeout(() => onGameAction(), 0);
      }

      // Add collected tiles to currency if any were collected
      if (collectedTiles > 0) {
        dispatchCurrency({ type: 'ADD_SHELLS', payload: collectedTiles });
        // Also dispatch to game state for level-specific tracking
        dispatchGame({ type: 'ADD_COLLECTED_TILES', payload: collectedTiles });
        // Trigger level completion check for collect objectives
        if (onGameAction) {
          setTimeout(() => onGameAction(), 0);
        }
      }

      // Clear matched tiles after explosion animation
      // Use longer animation for bomb/rocket explosions
      const isSpecialExplosion = matches.some(match => match.length >= 8); // Rocket (8) or Bomb (25)
      const explosionDuration = isSpecialExplosion ? 600 : 200; // Faster animations

      setTimeout(() => {
        setMatchedTiles(new Set());
      }, explosionDuration);

      // Clear falling animation after it completes
      setTimeout(() => {
        setFallingTiles(new Map());
      }, 400); // Faster falling animation

      // Check for game win
      if (gameState.combos + matches.length >= gameState.targetCombos) {
        handleGameWin();
      }

      // Recursively process next round of matches after animations
      setTimeout(() => {
        // Clear any existing falling animations before next cascade
        setFallingTiles(new Map());
        processGameTurn(
          finalBoard, // Use the updated board with filled sand blocker positions
          undefined,
          undefined,
          undefined,
          undefined,
          cascadeCount + 1,
          finalSandBlockers, // Pass the updated sand blockers to the next cascade
        );
      }, 400); // Faster cascade timing for better responsiveness
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
          payload: { row1: row2, col1: col2, row2: row1, col2: col1 },
        });
      }

      // Check for coconuts that have reached the bottom row and should exit (even when no matches)
      const coconutsToExit: Array<{ row: number; col: number; id: string }> =
        [];
      if (
        currentBoardRef.current[7] &&
        Array.isArray(currentBoardRef.current[7])
      ) {
        for (let col = 0; col < 8; col++) {
          const tile = currentBoardRef.current[7][col];
          if (tile && tile.isSpecial) {
            coconutsToExit.push({ row: 7, col, id: tile.id });
          }
        }
      }

      if (coconutsToExit.length > 0) {
        // Remove coconuts from the bottom row
        const updatedBoard = currentBoardRef.current.map(row => [...row]);
        coconutsToExit.forEach(item => {
          updatedBoard[item.row][item.col] = null;
          // Collect coconut drops to notify parent later to avoid state conflicts
          pendingCoconutDropsRef.current.push(item);
        });

        // Apply gravity again to fill the gaps left by exiting coconuts
        const finalBoard = dropTiles(
          updatedBoard,
          variant,
          currentSandBlockersRef.current,
        );

        // Update the board with the coconuts removed
        dispatchGame({ type: 'UPDATE_BOARD', payload: finalBoard });
        currentBoardRef.current = finalBoard;
      }

      // Check if game is impossible after each cascade completes
      const isImpossible = checkIfGameImpossible(
        currentBoardRef.current,
        currentSandBlockers || sandBlockers,
      );
      if (isImpossible) {
        const rearrangedBoard = rearrangeBoard(
          currentBoardRef.current,
          currentSandBlockers || sandBlockers,
        );
        dispatchGame({ type: 'UPDATE_BOARD', payload: rearrangedBoard });
        currentBoardRef.current = rearrangedBoard;
      }

      isProcessingMatchesRef.current = false;
    }
  };

  const handleGameWin = () => {
    // Award currency
    dispatchCurrency({ type: 'ADD_SHELLS', payload: 1 });
    dispatchCurrency({ type: 'ADD_KEYS', payload: 1 });

    // Mark game as won
    dispatchGame({ type: 'SET_GAME_WON' });
  };

  const getTileFallDistance = (row: number, col: number) => {
    return fallingTiles.get(`${row}-${col}`) || 0;
  };

  const calculateFallingTiles = (
    boardAfterRemoval: any[][],
    boardAfterDrop: any[][],
  ) => {
    const falling = new Map<string, number>();

    // Ensure boards are valid arrays
    const safeBoardAfterRemoval = Array.isArray(boardAfterRemoval)
      ? boardAfterRemoval
      : [];
    const safeBoardAfterDrop = Array.isArray(boardAfterDrop)
      ? boardAfterDrop
      : [];

    // For each column, find tiles that should be falling
    for (let col = 0; col < 8; col++) {
      // Get sand blocker positions in this column
      const sandBlockers = Array.isArray(currentSandBlockersRef.current)
        ? currentSandBlockersRef.current
        : [];
      const sandBlockerRows = sandBlockers
        .filter(blocker => blocker.col === col)
        .map(blocker => blocker.row)
        .sort((a, b) => a - b);

      // Create sections separated by sand blockers
      const sections: Array<{ start: number; end: number }> = [];
      let currentStart = 0;

      for (const blockerRow of sandBlockerRows) {
        if (blockerRow > currentStart) {
          sections.push({ start: currentStart, end: blockerRow - 1 });
        }
        currentStart = blockerRow + 1;
      }

      // Add the final section if there's space after the last sand blocker
      if (currentStart < 8) {
        sections.push({ start: currentStart, end: 7 });
      }

      // Process each section independently for falling calculation
      for (const section of sections) {
        // Find gaps in this section after removal
        const gaps: number[] = [];
        for (let row = section.start; row <= section.end; row++) {
          const rowArray = Array.isArray(safeBoardAfterRemoval[row])
            ? safeBoardAfterRemoval[row]
            : [];
          if (rowArray[col] === null) {
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
            const finalRowArray = Array.isArray(safeBoardAfterDrop[finalRow])
              ? safeBoardAfterDrop[finalRow]
              : [];
            const finalTile = finalRowArray[col];
            if (finalTile) {
              // Find where this tile was in the board after removal (within this section)
              let originalRow = -1;
              for (let row = section.start; row <= section.end; row++) {
                const originalRowArray = Array.isArray(
                  safeBoardAfterRemoval[row],
                )
                  ? safeBoardAfterRemoval[row]
                  : [];
                if (
                  originalRowArray[col] &&
                  originalRowArray[col].id === finalTile.id
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

  if (gameState.board.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Holes at the top where new tiles drop from */}
      <View style={styles.holesRow}>
        {Array.from({ length: 8 }, (_, colIndex) => (
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
        {renderBackground(variant)}

        {/* Bomb Notification */}
        {bombNotification && (
          <View style={styles.bombNotification}>
            <Text style={styles.bombNotificationText}>{bombNotification}</Text>
          </View>
        )}

        {/* Rocket Notification */}
        {rocketNotification && (
          <View style={styles.rocketNotification}>
            <Text style={styles.rocketNotificationText}>
              {rocketNotification}
            </Text>
          </View>
        )}

        {/* Game board */}
        {(gameState.board && Array.isArray(gameState.board)
          ? gameState.board
          : Array(8).fill(null)
        ).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {(Array.isArray(row) ? row : Array(8).fill(null)).map(
              (tile, colIndex) => {
                const sandBlocker = (
                  gameState.sandBlockers &&
                  Array.isArray(gameState.sandBlockers)
                    ? gameState.sandBlockers
                    : []
                ).find(
                  blocker =>
                    blocker.row === rowIndex && blocker.col === colIndex,
                );
                const hasSandBlocker = !!sandBlocker;
                const hasUmbrella = sandBlocker?.hasUmbrella || false;
                const isShaking = shakingTiles.has(`${rowIndex}-${colIndex}`);

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
                    onSwipe={direction =>
                      handleTileSwipe(rowIndex, colIndex, direction)
                    }
                    isMatched={false}
                    isFalling={fallingTiles.has(`${rowIndex}-${colIndex}`)}
                    fallDistance={getTileFallDistance(rowIndex, colIndex)}
                    isCoconutExiting={false}
                    onCoconutExit={() => {}}
                    isShaking={isShaking}
                    cascadeLevel={cascadeLevel}
                  />
                ) : (
                  <View
                    key={`empty-${rowIndex}-${colIndex}`}
                    style={styles.emptyTile}
                  />
                );
              },
            )}
          </View>
        ))}

        {/* Separate layer for matched tiles (exploding) */}
        {Array.from(matchedTiles || []).map(matchKey => {
          const [rowStr, colStr] = matchKey.split('-');
          const row = parseInt(rowStr);
          const col = parseInt(colStr);
          const board =
            gameState.board && Array.isArray(gameState.board)
              ? gameState.board
              : [];
          const rowArray = Array.isArray(board[row]) ? board[row] : [];
          const originalTile = rowArray[col];

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
                  isShaking={shakingTiles.has(`${row}-${col}`)}
                  cascadeLevel={cascadeLevel}
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

export const GameBoard = forwardRef<GameBoardHandle, GameBoardProps>(
  GameBoardInner,
);
