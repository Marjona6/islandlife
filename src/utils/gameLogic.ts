import {Tile, TileType} from '../types/game';

const BOARD_SIZE = 8;
const TILE_TYPES: TileType[] = ['🌴', '🐚', '🌺', '🐠', '⭐'];

// Check if two tiles are adjacent
export const areAdjacent = (
  row1: number,
  col1: number,
  row2: number,
  col2: number,
): boolean => {
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// Find all matches in the board
export const findMatches = (
  board: Tile[][],
): Array<Array<{row: number; col: number}>> => {
  const matches: Array<Array<{row: number; col: number}>> = [];

  // console.log(
  //   'Finding matches in board:',
  //   board.map(row => row.map(tile => tile?.type || 'null')),
  // );

  // Check horizontal matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    let col = 0;
    while (col < BOARD_SIZE - 2) {
      const tile1 = board[row][col];
      const tile2 = board[row][col + 1];
      const tile3 = board[row][col + 2];
      if (
        tile1 &&
        tile2 &&
        tile3 &&
        tile1.type === tile2.type &&
        tile2.type === tile3.type
      ) {
        // Start a new match
        const match: Array<{row: number; col: number}> = [
          {row, col},
          {row, col: col + 1},
          {row, col: col + 2},
        ];
        let i = col + 3;
        while (
          i < BOARD_SIZE &&
          board[row][i] &&
          board[row][i].type === tile1.type
        ) {
          match.push({row, col: i});
          i++;
        }
        matches.push(match);
        col += match.length; // skip over the matched section
      } else {
        col++;
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < BOARD_SIZE; col++) {
    let row = 0;
    while (row < BOARD_SIZE - 2) {
      const tile1 = board[row][col];
      const tile2 = board[row + 1][col];
      const tile3 = board[row + 2][col];
      if (
        tile1 &&
        tile2 &&
        tile3 &&
        tile1.type === tile2.type &&
        tile2.type === tile3.type
      ) {
        // Start a new match
        const match: Array<{row: number; col: number}> = [
          {row, col},
          {row: row + 1, col},
          {row: row + 2, col},
        ];
        let i = row + 3;
        while (
          i < BOARD_SIZE &&
          board[i][col] &&
          board[i][col].type === tile1.type
        ) {
          match.push({row: i, col});
          i++;
        }
        matches.push(match);
        row += match.length; // skip over the matched section
      } else {
        row++;
      }
    }
  }

  // console.log('All matches found:', matches);
  return matches;
};

// Remove matched tiles and return their positions
export const removeMatches = (
  board: Tile[][],
  matches: Array<Array<{row: number; col: number}>>,
): Tile[][] => {
  const newBoard = board.map(row => [...row]);

  // Remove matched tiles
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (
        matches.some(match =>
          match.some(pos => pos.row === row && pos.col === col),
        )
      ) {
        newBoard[row][col] = null as any;
      }
    }
  }

  return newBoard;
};

// Make tiles fall down to fill empty spaces
export const dropTiles = (board: Tile[][]): Tile[][] => {
  const newBoard = board.map(row => [...row]);

  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1;

    // Move from bottom to top, keeping non-null tiles
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        if (writeRow !== row) {
          newBoard[writeRow][col] = newBoard[row][col];
          newBoard[writeRow][col].row = writeRow;
        }
        writeRow--;
      }
    }

    // Fill remaining spaces with new tiles
    for (let row = writeRow; row >= 0; row--) {
      const randomType =
        TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
      newBoard[row][col] = {
        id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        type: randomType,
        row,
        col,
      };
    }
  }

  return newBoard;
};

// Check if a move is valid (will create a match)
export const isValidMove = (
  board: Tile[][],
  row1: number,
  col1: number,
  row2: number,
  col2: number,
): boolean => {
  if (!areAdjacent(row1, col1, row2, col2)) {
    return false;
  }

  // Create a copy of the board with the swap
  const testBoard = board.map(row => [...row]);
  const temp = testBoard[row1][col1];
  testBoard[row1][col1] = testBoard[row2][col2];
  testBoard[row2][col2] = temp;

  // Check if the swap creates any matches
  const matches = findMatches(testBoard);
  return matches.length > 0;
};

// Get all valid moves on the current board
export const getValidMoves = (
  board: Tile[][],
): Array<{row1: number; col1: number; row2: number; col2: number}> => {
  const validMoves: Array<{
    row1: number;
    col1: number;
    row2: number;
    col2: number;
  }> = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Check right neighbor
      if (col < BOARD_SIZE - 1) {
        if (isValidMove(board, row, col, row, col + 1)) {
          validMoves.push({row1: row, col1: col, row2: row, col2: col + 1});
        }
      }

      // Check bottom neighbor
      if (row < BOARD_SIZE - 1) {
        if (isValidMove(board, row, col, row + 1, col)) {
          validMoves.push({row1: row, col1: col, row2: row + 1, col2: col});
        }
      }
    }
  }

  return validMoves;
};

// Process a complete game turn (swap, find matches, remove, drop)
export const processTurn = (
  board: Tile[][],
): {
  newBoard: Tile[][];
  matches: Array<Array<{row: number; col: number}>>;
  totalMatches: number;
} => {
  let currentBoard = board.map(row => [...row]);
  let allMatches: Array<Array<{row: number; col: number}>> = [];
  let totalMatches = 0;

  // Keep processing until no more matches
  let hasMatches = true;
  while (hasMatches) {
    const matches = findMatches(currentBoard);
    if (matches.length === 0) {
      hasMatches = false;
    } else {
      allMatches = allMatches.concat(matches);
      totalMatches += matches.length;
      currentBoard = removeMatches(currentBoard, matches);
      currentBoard = dropTiles(currentBoard);
    }
  }

  return {
    newBoard: currentBoard,
    matches: allMatches,
    totalMatches,
  };
};

// Create a board with no initial matches
export const createValidBoard = (): Tile[][] => {
  const board: Tile[][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let randomType: TileType;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        // Check for horizontal matches (last 2 tiles in same row)
        let hasHorizontalMatch = false;
        if (col >= 2) {
          const tile1 = board[row][col - 1];
          const tile2 = board[row][col - 2];
          if (tile1 && tile2 && tile1.type === tile2.type) {
            hasHorizontalMatch = true;
          }
        }

        // Check for vertical matches (last 2 tiles in same column)
        let hasVerticalMatch = false;
        if (row >= 2) {
          const tile1 = board[row - 1][col];
          const tile2 = board[row - 2][col];
          if (tile1 && tile2 && tile1.type === tile2.type) {
            hasVerticalMatch = true;
          }
        }

        // If we have a potential match, avoid that tile type
        if (hasHorizontalMatch || hasVerticalMatch) {
          const avoidTypes: TileType[] = [];

          if (hasHorizontalMatch && col >= 2) {
            avoidTypes.push(board[row][col - 1].type);
          }
          if (hasVerticalMatch && row >= 2) {
            avoidTypes.push(board[row - 1][col].type);
          }

          const availableTypes = TILE_TYPES.filter(
            type => !avoidTypes.includes(type),
          );
          randomType =
            availableTypes[Math.floor(Math.random() * availableTypes.length)];
        } else {
          // No potential matches, use any random type
          randomType =
            TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        }

        attempts++;
      } while (
        attempts < maxAttempts &&
        // Double-check that this tile won't create a match
        ((col >= 2 &&
          board[row][col - 1] &&
          board[row][col - 2] &&
          board[row][col - 1].type === board[row][col - 2].type &&
          board[row][col - 1].type === randomType) ||
          (row >= 2 &&
            board[row - 1][col] &&
            board[row - 2][col] &&
            board[row - 1][col].type === board[row - 2][col].type &&
            board[row - 1][col].type === randomType))
      );

      board[row][col] = {
        id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        type: randomType,
        row,
        col,
      };
    }
  }

  // Final verification - check if the board has any matches
  const matches = findMatches(board);
  if (matches.length > 0) {
    console.warn('Board created with matches, regenerating...');
    return createValidBoard(); // Recursively try again
  }

  return board;
};
