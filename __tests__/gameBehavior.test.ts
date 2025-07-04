import {
  createValidBoard,
  findMatches,
  removeMatches,
  processTurn,
  // isValidMove, // not used
  // processMove, // not used
} from '../src/utils/gameLogic';
import {Tile} from '../src/types/game';

describe('Game Board Behavior Tests', () => {
  describe('Initial Board Validation', () => {
    test('the game board should not display three or more tiles in a vertical or horizontal row on initial load', () => {
      for (let i = 0; i < 10; i++) {
        const board = createValidBoard();
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 6; col++) {
            const tile1 = board[row][col];
            const tile2 = board[row][col + 1];
            const tile3 = board[row][col + 2];
            if (tile1 && tile2 && tile3) {
              expect(
                tile1.type === tile2.type && tile2.type === tile3.type,
              ).toBe(false);
            }
          }
        }
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 8; col++) {
            const tile1 = board[row][col];
            const tile2 = board[row + 1][col];
            const tile3 = board[row + 2][col];
            if (tile1 && tile2 && tile3) {
              expect(
                tile1.type === tile2.type && tile2.type === tile3.type,
              ).toBe(false);
            }
          }
        }
      }
    });
  });

  describe('Cascading Matches After Tile Fall', () => {
    test('after a user makes a match, if tiles fall into place such that three or more tiles are now in a row vertically or horizontally, those tiles should disappear and additional tiles should fall to replace them', () => {
      // Use only allowed emoji types
      const board: (Tile | null)[][] = [
        [
          {id: '1', type: '🌴', row: 0, col: 0},
          {id: '2', type: '🐚', row: 0, col: 1},
          {id: '3', type: '🌴', row: 0, col: 2},
          {id: '4', type: '🌺', row: 0, col: 3},
          {id: '5', type: '🐠', row: 0, col: 4},
          {id: '6', type: '⭐', row: 0, col: 5},
          {id: '7', type: '🌴', row: 0, col: 6},
          {id: '8', type: '🐚', row: 0, col: 7},
        ],
        [
          {id: '9', type: '🐚', row: 1, col: 0},
          {id: '10', type: '🌴', row: 1, col: 1},
          {id: '11', type: '🐚', row: 1, col: 2},
          {id: '12', type: '🌺', row: 1, col: 3},
          {id: '13', type: '🐠', row: 1, col: 4},
          {id: '14', type: '⭐', row: 1, col: 5},
          {id: '15', type: '🌴', row: 1, col: 6},
          {id: '16', type: '🐚', row: 1, col: 7},
        ],
        [
          {id: '17', type: '🌺', row: 2, col: 0},
          {id: '18', type: '🐠', row: 2, col: 1},
          {id: '19', type: '⭐', row: 2, col: 2},
          {id: '20', type: '🌴', row: 2, col: 3},
          {id: '21', type: '🐚', row: 2, col: 4},
          {id: '22', type: '🌺', row: 2, col: 5},
          {id: '23', type: '🐠', row: 2, col: 6},
          {id: '24', type: '⭐', row: 2, col: 7},
        ],
        [
          {id: '25', type: '🌴', row: 3, col: 0},
          {id: '26', type: '🐚', row: 3, col: 1},
          {id: '27', type: '🌺', row: 3, col: 2},
          {id: '28', type: '🐠', row: 3, col: 3},
          {id: '29', type: '⭐', row: 3, col: 4},
          {id: '30', type: '🌴', row: 3, col: 5},
          {id: '31', type: '🐚', row: 3, col: 6},
          {id: '32', type: '🌺', row: 3, col: 7},
        ],
        [
          {id: '33', type: '🐚', row: 4, col: 0},
          {id: '34', type: '🌺', row: 4, col: 1},
          {id: '35', type: '🐠', row: 4, col: 2},
          {id: '36', type: '⭐', row: 4, col: 3},
          {id: '37', type: '🌴', row: 4, col: 4},
          {id: '38', type: '🐚', row: 4, col: 5},
          {id: '39', type: '🌺', row: 4, col: 6},
          {id: '40', type: '🐠', row: 4, col: 7},
        ],
        [
          {id: '41', type: '🌺', row: 5, col: 0},
          {id: '42', type: '🐠', row: 5, col: 1},
          {id: '43', type: '⭐', row: 5, col: 2},
          {id: '44', type: '🌴', row: 5, col: 3},
          {id: '45', type: '🐚', row: 5, col: 4},
          {id: '46', type: '🌺', row: 5, col: 5},
          {id: '47', type: '🐠', row: 5, col: 6},
          {id: '48', type: '⭐', row: 5, col: 7},
        ],
        [
          {id: '49', type: '🌴', row: 6, col: 0},
          {id: '50', type: '🐚', row: 6, col: 1},
          {id: '51', type: '🌺', row: 6, col: 2},
          {id: '52', type: '🐠', row: 6, col: 3},
          {id: '53', type: '⭐', row: 6, col: 4},
          {id: '54', type: '🌴', row: 6, col: 5},
          {id: '55', type: '🐚', row: 6, col: 6},
          {id: '56', type: '🌺', row: 6, col: 7},
        ],
        [
          {id: '57', type: '🐚', row: 7, col: 0},
          {id: '58', type: '🌺', row: 7, col: 1},
          {id: '59', type: '🐠', row: 7, col: 2},
          {id: '60', type: '⭐', row: 7, col: 3},
          {id: '61', type: '🌴', row: 7, col: 4},
          {id: '62', type: '🐚', row: 7, col: 5},
          {id: '63', type: '🌺', row: 7, col: 6},
          {id: '64', type: '🐠', row: 7, col: 7},
        ],
      ];
      board[6][0] = null;
      board[6][1] = null;
      board[6][2] = null;
      board[5][0] = null;
      board[5][1] = null;
      board[5][2] = null;
      // Use processTurn to resolve all cascades
      const {newBoard, matches} = processTurn(board as Tile[][]);
      // There should be at least one match (the horizontal match that fell into place)
      expect(matches.length).toBeGreaterThan(0);
      // There should be no matches left after processTurn
      expect(findMatches(newBoard).length).toBe(0);
    });
  });

  describe('Match Specificity', () => {
    test('after a user makes a match, only the matched row (horizontal or vertical) should disappear', () => {
      const board: Tile[][] = [
        [
          {id: '1', type: '🌴', row: 0, col: 0},
          {id: '2', type: '🐚', row: 0, col: 1},
          {id: '3', type: '🌺', row: 0, col: 2},
          {id: '4', type: '🐠', row: 0, col: 3},
          {id: '5', type: '⭐', row: 0, col: 4},
          {id: '6', type: '🌴', row: 0, col: 5},
          {id: '7', type: '🐚', row: 0, col: 6},
          {id: '8', type: '🌺', row: 0, col: 7},
        ],
        [
          {id: '9', type: '🌴', row: 1, col: 0},
          {id: '10', type: '🌴', row: 1, col: 1},
          {id: '11', type: '🌴', row: 1, col: 2},
          {id: '12', type: '🌴', row: 1, col: 3},
          {id: '13', type: '🌴', row: 1, col: 4},
          {id: '14', type: '🐚', row: 1, col: 5},
          {id: '15', type: '🌺', row: 1, col: 6},
          {id: '16', type: '🐠', row: 1, col: 7},
        ],
        [
          {id: '17', type: '🐚', row: 2, col: 0},
          {id: '18', type: '🌺', row: 2, col: 1},
          {id: '19', type: '🐠', row: 2, col: 2},
          {id: '20', type: '⭐', row: 2, col: 3},
          {id: '21', type: '🌴', row: 2, col: 4},
          {id: '22', type: '🐚', row: 2, col: 5},
          {id: '23', type: '🌺', row: 2, col: 6},
          {id: '24', type: '🐠', row: 2, col: 7},
        ],
        [
          {id: '25', type: '🌺', row: 3, col: 0},
          {id: '26', type: '🐠', row: 3, col: 1},
          {id: '27', type: '⭐', row: 3, col: 2},
          {id: '28', type: '🌴', row: 3, col: 3},
          {id: '29', type: '🐚', row: 3, col: 4},
          {id: '30', type: '🌺', row: 3, col: 5},
          {id: '31', type: '🐠', row: 3, col: 6},
          {id: '32', type: '⭐', row: 3, col: 7},
        ],
        [
          {id: '33', type: '🐠', row: 4, col: 0},
          {id: '34', type: '⭐', row: 4, col: 1},
          {id: '35', type: '🌴', row: 4, col: 2},
          {id: '36', type: '🐚', row: 4, col: 3},
          {id: '37', type: '🌺', row: 4, col: 4},
          {id: '38', type: '🐠', row: 4, col: 5},
          {id: '39', type: '⭐', row: 4, col: 6},
          {id: '40', type: '🌴', row: 4, col: 7},
        ],
        [
          {id: '41', type: '🐚', row: 5, col: 0},
          {id: '42', type: '🌺', row: 5, col: 1},
          {id: '43', type: '🐠', row: 5, col: 2},
          {id: '44', type: '⭐', row: 5, col: 3},
          {id: '45', type: '🌴', row: 5, col: 4},
          {id: '46', type: '🐚', row: 5, col: 5},
          {id: '47', type: '🌺', row: 5, col: 6},
          {id: '48', type: '🐠', row: 5, col: 7},
        ],
        [
          {id: '49', type: '🌺', row: 6, col: 0},
          {id: '50', type: '🐠', row: 6, col: 1},
          {id: '51', type: '⭐', row: 6, col: 2},
          {id: '52', type: '🌴', row: 6, col: 3},
          {id: '53', type: '🐚', row: 6, col: 4},
          {id: '54', type: '🌺', row: 6, col: 5},
          {id: '55', type: '🐠', row: 6, col: 6},
          {id: '56', type: '⭐', row: 6, col: 7},
        ],
        [
          {id: '57', type: '🌴', row: 7, col: 0},
          {id: '58', type: '🐚', row: 7, col: 1},
          {id: '59', type: '🌺', row: 7, col: 2},
          {id: '60', type: '🐠', row: 7, col: 3},
          {id: '61', type: '⭐', row: 7, col: 4},
          {id: '62', type: '🌴', row: 7, col: 5},
          {id: '63', type: '🐚', row: 7, col: 6},
          {id: '64', type: '🌺', row: 7, col: 7},
        ],
      ];
      const matches = findMatches(board);
      expect(matches.length).toBe(1);
      expect(matches[0].length).toBe(5); // 5 🌴 in a row
      const matchedRow = matches[0][0].row;
      matches[0].forEach(pos => {
        expect(pos.row).toBe(matchedRow);
      });
      const boardAfterRemoval = removeMatches(board, matches);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (row === 1 && col < 5) {
            expect(boardAfterRemoval[row][col]).toBeNull();
          } else {
            expect(boardAfterRemoval[row][col]).toEqual(board[row][col]);
          }
        }
      }
    });

    test('vertical matches should only remove the matched column tiles', () => {
      const board: Tile[][] = [
        [
          {id: '1', type: '🌴', row: 0, col: 0},
          {id: '2', type: '🐚', row: 0, col: 1},
          {id: '3', type: '🌺', row: 0, col: 2},
          {id: '4', type: '🐠', row: 0, col: 3},
          {id: '5', type: '⭐', row: 0, col: 4},
          {id: '6', type: '🌴', row: 0, col: 5},
          {id: '7', type: '🐚', row: 0, col: 6},
          {id: '8', type: '🌺', row: 0, col: 7},
        ],
        [
          {id: '9', type: '🐚', row: 1, col: 0},
          {id: '10', type: '🌴', row: 1, col: 1},
          {id: '11', type: '🐠', row: 1, col: 2},
          {id: '12', type: '⭐', row: 1, col: 3},
          {id: '13', type: '🌴', row: 1, col: 4},
          {id: '14', type: '🐚', row: 1, col: 5},
          {id: '15', type: '🌺', row: 1, col: 6},
          {id: '16', type: '🐠', row: 1, col: 7},
        ],
        [
          {id: '17', type: '🌺', row: 2, col: 0},
          {id: '18', type: '🌴', row: 2, col: 1},
          {id: '19', type: '⭐', row: 2, col: 2},
          {id: '20', type: '🌴', row: 2, col: 3},
          {id: '21', type: '🐚', row: 2, col: 4},
          {id: '22', type: '🌺', row: 2, col: 5},
          {id: '23', type: '🐠', row: 2, col: 6},
          {id: '24', type: '⭐', row: 2, col: 7},
        ],
        [
          {id: '25', type: '🌺', row: 3, col: 0},
          {id: '26', type: '🌴', row: 3, col: 1},
          {id: '27', type: '🐠', row: 3, col: 2},
          {id: '28', type: '⭐', row: 3, col: 3},
          {id: '29', type: '🌴', row: 3, col: 4},
          {id: '30', type: '🐚', row: 3, col: 5},
          {id: '31', type: '🌺', row: 3, col: 6},
          {id: '32', type: '🐠', row: 3, col: 7},
        ],
        [
          {id: '33', type: '🐠', row: 4, col: 0},
          {id: '34', type: '🌴', row: 4, col: 1},
          {id: '35', type: '⭐', row: 4, col: 2},
          {id: '36', type: '🌴', row: 4, col: 3},
          {id: '37', type: '🐚', row: 4, col: 4},
          {id: '38', type: '🌺', row: 4, col: 5},
          {id: '39', type: '🐠', row: 4, col: 6},
          {id: '40', type: '⭐', row: 4, col: 7},
        ],
        [
          {id: '41', type: '🌺', row: 5, col: 0},
          {id: '42', type: '🌴', row: 5, col: 1},
          {id: '43', type: '🐠', row: 5, col: 2},
          {id: '44', type: '⭐', row: 5, col: 3},
          {id: '45', type: '🌴', row: 5, col: 4},
          {id: '46', type: '🐚', row: 5, col: 5},
          {id: '47', type: '🌺', row: 5, col: 6},
          {id: '48', type: '🐠', row: 5, col: 7},
        ],
        [
          {id: '49', type: '🐠', row: 6, col: 0},
          {id: '50', type: '🌴', row: 6, col: 1},
          {id: '51', type: '⭐', row: 6, col: 2},
          {id: '52', type: '🌴', row: 6, col: 3},
          {id: '53', type: '🐚', row: 6, col: 4},
          {id: '54', type: '🌺', row: 6, col: 5},
          {id: '55', type: '🐠', row: 6, col: 6},
          {id: '56', type: '⭐', row: 6, col: 7},
        ],
        [
          {id: '57', type: '🌴', row: 7, col: 0},
          {id: '58', type: '🐚', row: 7, col: 1},
          {id: '59', type: '🌺', row: 7, col: 2},
          {id: '60', type: '🐠', row: 7, col: 3},
          {id: '61', type: '⭐', row: 7, col: 4},
          {id: '62', type: '🌴', row: 7, col: 5},
          {id: '63', type: '🐚', row: 7, col: 6},
          {id: '64', type: '🌺', row: 7, col: 7},
        ],
      ];
      const matches = findMatches(board);
      expect(matches.length).toBe(1);
      expect(matches[0].length).toBe(5); // 5 🌴 in a row
      const matchedCol = matches[0][0].col;
      matches[0].forEach(pos => {
        expect(pos.col).toBe(matchedCol);
      });
      const boardAfterRemoval = removeMatches(board, matches);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (col === 1 && row < 5) {
            expect(boardAfterRemoval[row][col]).toBeNull();
          } else {
            expect(boardAfterRemoval[row][col]).toEqual(board[row][col]);
          }
        }
      }
    });

    test('vertical matches should only remove the matched column tiles', () => {
      const board: Tile[][] = [
        [
          {id: '1', type: '🌴', row: 0, col: 0},
          {id: '2', type: '🐚', row: 0, col: 1},
          {id: '3', type: '🌺', row: 0, col: 2},
          {id: '4', type: '🐠', row: 0, col: 3},
          {id: '5', type: '⭐', row: 0, col: 4},
          {id: '6', type: '🌴', row: 0, col: 5},
          {id: '7', type: '🐚', row: 0, col: 6},
          {id: '8', type: '🌺', row: 0, col: 7},
        ],
        [
          {id: '9', type: '🐚', row: 1, col: 0},
          {id: '10', type: '🌴', row: 1, col: 1},
          {id: '11', type: '🐠', row: 1, col: 2},
          {id: '12', type: '⭐', row: 1, col: 3},
          {id: '13', type: '🌴', row: 1, col: 4},
          {id: '14', type: '🐚', row: 1, col: 5},
          {id: '15', type: '🌺', row: 1, col: 6},
          {id: '16', type: '🐠', row: 1, col: 7},
        ],
        [
          {id: '17', type: '🌺', row: 2, col: 0},
          {id: '18', type: '🌴', row: 2, col: 1},
          {id: '19', type: '⭐', row: 2, col: 2},
          {id: '20', type: '🌴', row: 2, col: 3},
          {id: '21', type: '🐚', row: 2, col: 4},
          {id: '22', type: '🌺', row: 2, col: 5},
          {id: '23', type: '🐠', row: 2, col: 6},
          {id: '24', type: '⭐', row: 2, col: 7},
        ],
        [
          {id: '25', type: '🌺', row: 3, col: 0},
          {id: '26', type: '🌴', row: 3, col: 1},
          {id: '27', type: '🐠', row: 3, col: 2},
          {id: '28', type: '⭐', row: 3, col: 3},
          {id: '29', type: '🌴', row: 3, col: 4},
          {id: '30', type: '🐚', row: 3, col: 5},
          {id: '31', type: '🌺', row: 3, col: 6},
          {id: '32', type: '🐠', row: 3, col: 7},
        ],
        [
          {id: '33', type: '🐠', row: 4, col: 0},
          {id: '34', type: '🌴', row: 4, col: 1},
          {id: '35', type: '⭐', row: 4, col: 2},
          {id: '36', type: '🌴', row: 4, col: 3},
          {id: '37', type: '🐚', row: 4, col: 4},
          {id: '38', type: '🌺', row: 4, col: 5},
          {id: '39', type: '🐠', row: 4, col: 6},
          {id: '40', type: '⭐', row: 4, col: 7},
        ],
        [
          {id: '41', type: '🌺', row: 5, col: 0},
          {id: '42', type: '🌴', row: 5, col: 1},
          {id: '43', type: '🐠', row: 5, col: 2},
          {id: '44', type: '⭐', row: 5, col: 3},
          {id: '45', type: '🌴', row: 5, col: 4},
          {id: '46', type: '🐚', row: 5, col: 5},
          {id: '47', type: '🌺', row: 5, col: 6},
          {id: '48', type: '🐠', row: 5, col: 7},
        ],
        [
          {id: '49', type: '🐠', row: 6, col: 0},
          {id: '50', type: '🌴', row: 6, col: 1},
          {id: '51', type: '⭐', row: 6, col: 2},
          {id: '52', type: '🌴', row: 6, col: 3},
          {id: '53', type: '🐚', row: 6, col: 4},
          {id: '54', type: '🌺', row: 6, col: 5},
          {id: '55', type: '🐠', row: 6, col: 6},
          {id: '56', type: '⭐', row: 6, col: 7},
        ],
        [
          {id: '57', type: '🌴', row: 7, col: 0},
          {id: '58', type: '🐚', row: 7, col: 1},
          {id: '59', type: '🌺', row: 7, col: 2},
          {id: '60', type: '🐠', row: 7, col: 3},
          {id: '61', type: '⭐', row: 7, col: 4},
          {id: '62', type: '🌴', row: 7, col: 5},
          {id: '63', type: '🐚', row: 7, col: 6},
          {id: '64', type: '🌺', row: 7, col: 7},
        ],
      ];
      const matches = findMatches(board);
      expect(matches.length).toBe(1);
      expect(matches[0].length).toBe(5); // 5 🌴 in a row
      const matchedCol = matches[0][0].col;
      matches[0].forEach(pos => {
        expect(pos.col).toBe(matchedCol);
      });
      const boardAfterRemoval = removeMatches(board, matches);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (col === 1 && row < 5) {
            expect(boardAfterRemoval[row][col]).toBeNull();
          } else {
            expect(boardAfterRemoval[row][col]).toEqual(board[row][col]);
          }
        }
      }
    });
  });
});
