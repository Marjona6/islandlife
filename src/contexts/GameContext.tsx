import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tile, TileType, GameState, Currency, BeachItem } from '../types/game';
import { createValidBoard, createBoardFromLevel } from '../utils/gameLogic';
import {
  checkIfGameImpossible,
  rearrangeBoard,
} from '../utils/gameImpossibleLogic';

// Game constants
const TARGET_COMBOS = 10;

// Initial state
const initialGameState: GameState = {
  board: [],
  score: 0,
  combos: 0,
  targetCombos: TARGET_COMBOS,
  isGameWon: false,
  isGameOver: false,
  sandBlockers: [],
  treasureCollected: 0,
  totalTreasure: 0,
  collectedTiles: 0,
};

const initialCurrency: Currency = {
  shells: 0,
  keys: 0,
};

const initialBeachItems: BeachItem[] = [
  {
    id: 'palm-tree',
    name: 'Palm Tree',
    cost: 1,
    isPurchased: false,
    icon: '🌴',
  },
  {
    id: 'beach-chair',
    name: 'Beach Chair',
    cost: 2,
    isPurchased: false,
    icon: '🪑',
  },
  {
    id: 'umbrella',
    name: 'Beach Umbrella',
    cost: 3,
    isPurchased: false,
    icon: '⛱️',
  },
  {
    id: 'volleyball',
    name: 'Volleyball Net',
    cost: 5,
    isPurchased: false,
    icon: '🏐',
  },
];

// Action types
type GameAction =
  | {
      type: 'INIT_BOARD';
      payload?: {
        variant: 'sand' | 'sea';
        sandBlockers?: Array<{ row: number; col: number }>;
      };
    }
  | {
      type: 'INIT_BOARD_FROM_LEVEL';
      payload: {
        levelBoard: (TileType | string | null)[][];
        variant: 'sand' | 'sea';
        sandBlockers?: Array<{ row: number; col: number }>;
        totalTreasure?: number;
        specialTiles?: Array<{
          type: string;
          row: number;
          col: number;
          properties?: Record<string, any>;
        }>;
      };
    }
  | {
      type: 'SWAP_TILES';
      payload: { row1: number; col1: number; row2: number; col2: number };
    }
  | { type: 'UPDATE_BOARD'; payload: Tile[][] }
  | { type: 'INCREMENT_COMBOS' }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'RESET_GAME' }
  | { type: 'SET_GAME_WON' }
  | {
      type: 'SET_SAND_BLOCKERS';
      payload: Array<{ row: number; col: number; hasUmbrella: boolean }>;
    }
  | { type: 'CLEAR_SAND_BLOCKER'; payload: { row: number; col: number } }
  | { type: 'REMOVE_UMBRELLA'; payload: { row: number; col: number } }
  | {
      type: 'UPDATE_SAND_BLOCKER_STATE';
      payload: {
        sandBlockers: Array<{ row: number; col: number }>;
        umbrellas: Array<{ row: number; col: number }>;
      };
    }
  | { type: 'COLLECT_TREASURE'; payload: number }
  | { type: 'SET_TOTAL_TREASURE'; payload: number }
  | { type: 'ADD_COLLECTED_TILES'; payload: number }
  | {
      type: 'REVEAL_TREASURE';
      payload: { row: number; col: number; treasureType: TileType };
    }
  | {
      type: 'PROCESS_CASCADE_RESULTS';
      payload: {
        newBoard: Tile[][];
        score: number;
        treasure: number;
        combos: number;
        sandBlockers: Array<{ row: number; col: number; hasUmbrella: boolean }>;
        collectedTiles: number;
        revealedTreasures?: Array<{
          row: number;
          col: number;
          treasureType: TileType;
        }>;
      };
    };

type CurrencyAction =
  | { type: 'ADD_SHELLS'; payload: number }
  | { type: 'ADD_KEYS'; payload: number }
  | { type: 'SPEND_KEYS'; payload: number }
  | { type: 'LOAD_CURRENCY'; payload: Currency }
  | { type: 'ADD_CASCADE_CURRENCY'; payload: { shells: number; keys: number } };

type BeachAction =
  | { type: 'PURCHASE_ITEM'; payload: string }
  | { type: 'LOAD_BEACH_ITEMS'; payload: BeachItem[] };

// Reducers
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INIT_BOARD':
      let board = createValidBoard(
        action.payload?.variant || 'sand',
        action.payload?.sandBlockers?.map(sb => ({
          row: sb.row,
          col: sb.col,
        })) || [],
      );

      // Check if the board is impossible and rearrange if needed
      const sandBlockersForCheck =
        action.payload?.sandBlockers?.map(sb => ({
          row: sb.row,
          col: sb.col,
          hasUmbrella: true,
        })) || [];

      if (checkIfGameImpossible(board, sandBlockersForCheck)) {
        console.log('Initial board is impossible, rearranging...');
        board = rearrangeBoard(board, action.payload?.sandBlockers || []);
      }

      return {
        ...state,
        board,
        score: 0,
        combos: 0,
        isGameWon: false,
        isGameOver: false,
        sandBlockers:
          action.payload?.sandBlockers?.map(sb => ({
            row: sb.row,
            col: sb.col,
            hasUmbrella: true, // Start with umbrellas on all sand blockers
          })) || [],
      };

    case 'INIT_BOARD_FROM_LEVEL':
      let levelBoard = createBoardFromLevel(
        action.payload.levelBoard,
        action.payload.variant,
        action.payload.sandBlockers?.map(sb => ({
          row: sb.row,
          col: sb.col,
        })) || [],
        action.payload.specialTiles,
      );

      // Check if the level board is impossible and rearrange if needed
      const levelSandBlockersForCheck =
        action.payload.sandBlockers?.map(sb => ({
          row: sb.row,
          col: sb.col,
          hasUmbrella: true,
        })) || [];

      if (checkIfGameImpossible(levelBoard, levelSandBlockersForCheck)) {
        console.log('Level board is impossible, rearranging...');
        levelBoard = rearrangeBoard(
          levelBoard,
          action.payload.sandBlockers || [],
        );
      }

      return {
        ...state,
        board: levelBoard,
        score: 0,
        combos: 0,
        isGameWon: false,
        isGameOver: false,
        sandBlockers:
          action.payload.sandBlockers?.map(sb => ({
            row: sb.row,
            col: sb.col,
            hasUmbrella: true, // Start with umbrellas on all sand blockers
          })) || [],
      };

    case 'SWAP_TILES':
      const { row1, col1, row2, col2 } = action.payload;
      const updatedBoard = state.board.map(row => [...row]);
      const temp = updatedBoard[row1][col1];
      updatedBoard[row1][col1] = updatedBoard[row2][col2];
      updatedBoard[row2][col2] = temp;

      return {
        ...state,
        board: updatedBoard,
      };

    case 'UPDATE_BOARD':
      return {
        ...state,
        board: action.payload,
      };

    case 'INCREMENT_COMBOS':
      const newCombos = state.combos + 1;
      return {
        ...state,
        combos: newCombos,
        isGameWon: newCombos >= TARGET_COMBOS,
      };

    case 'ADD_SCORE':
      return {
        ...state,
        score: state.score + action.payload,
      };

    case 'RESET_GAME':
      return {
        ...initialGameState,
        targetCombos: TARGET_COMBOS,
      };

    case 'SET_GAME_WON':
      return {
        ...state,
        isGameWon: true,
      };

    case 'SET_SAND_BLOCKERS':
      return {
        ...state,
        sandBlockers: action.payload,
      };

    case 'CLEAR_SAND_BLOCKER':
      return {
        ...state,
        sandBlockers: state.sandBlockers.filter(
          blocker =>
            !(
              blocker.row === action.payload.row &&
              blocker.col === action.payload.col
            ),
        ),
      };

    case 'REMOVE_UMBRELLA':
      return {
        ...state,
        sandBlockers: state.sandBlockers.map(blocker =>
          blocker.row === action.payload.row &&
          blocker.col === action.payload.col
            ? { ...blocker, hasUmbrella: false }
            : blocker,
        ),
      };

    case 'UPDATE_SAND_BLOCKER_STATE':
      // Convert the old format to the new format
      const newSandBlockers = action.payload.sandBlockers.map(sb => ({
        row: sb.row,
        col: sb.col,
        hasUmbrella: action.payload.umbrellas.some(
          umbrella => umbrella.row === sb.row && umbrella.col === sb.col,
        ),
      }));
      return {
        ...state,
        sandBlockers: newSandBlockers,
      };

    case 'COLLECT_TREASURE':
      return {
        ...state,
        treasureCollected: state.treasureCollected + action.payload,
      };

    case 'SET_TOTAL_TREASURE':
      return {
        ...state,
        totalTreasure: action.payload,
      };

    case 'ADD_COLLECTED_TILES':
      return {
        ...state,
        collectedTiles: state.collectedTiles + action.payload,
      };

    case 'REVEAL_TREASURE':
      return {
        ...state,
        board: state.board.map(row =>
          row.map(tile =>
            tile &&
            tile.row === action.payload.row &&
            tile.col === action.payload.col
              ? {
                  ...tile,
                  type: action.payload.treasureType,
                  isRevealed: true,
                }
              : tile,
          ),
        ),
      };

    case 'PROCESS_CASCADE_RESULTS':
      let cascadeBoard = action.payload.newBoard;

      // Apply treasure reveals if any
      if (action.payload.revealedTreasures) {
        cascadeBoard = cascadeBoard.map(row =>
          row.map(tile =>
            tile &&
            action.payload.revealedTreasures!.some(
              treasure =>
                treasure.row === tile.row && treasure.col === tile.col,
            )
              ? {
                  ...tile,
                  type: action.payload.revealedTreasures!.find(
                    treasure =>
                      treasure.row === tile.row && treasure.col === tile.col,
                  )!.treasureType,
                  isRevealed: true,
                }
              : tile,
          ),
        );
      }

      const cascadeCombos = state.combos + action.payload.combos;
      return {
        ...state,
        board: cascadeBoard,
        score: state.score + action.payload.score,
        combos: cascadeCombos,
        isGameWon: cascadeCombos >= TARGET_COMBOS,
        sandBlockers: action.payload.sandBlockers,
        treasureCollected: state.treasureCollected + action.payload.treasure,
        collectedTiles: state.collectedTiles + action.payload.collectedTiles,
      };

    default:
      return state;
  }
};

const currencyReducer = (state: Currency, action: CurrencyAction): Currency => {
  switch (action.type) {
    case 'ADD_SHELLS':
      return { ...state, shells: state.shells + action.payload };
    case 'ADD_KEYS':
      return { ...state, keys: state.keys + action.payload };
    case 'SPEND_KEYS':
      return { ...state, keys: Math.max(0, state.keys - action.payload) };
    case 'LOAD_CURRENCY':
      return action.payload;
    case 'ADD_CASCADE_CURRENCY':
      return {
        ...state,
        shells: state.shells + action.payload.shells,
        keys: state.keys + action.payload.keys,
      };
    default:
      return state;
  }
};

const beachReducer = (state: BeachItem[], action: BeachAction): BeachItem[] => {
  switch (action.type) {
    case 'PURCHASE_ITEM':
      return state.map(item =>
        item.id === action.payload ? { ...item, isPurchased: true } : item,
      );
    case 'LOAD_BEACH_ITEMS':
      return action.payload;
    default:
      return state;
  }
};

// Context
interface GameContextType {
  gameState: GameState;
  currency: Currency;
  beachItems: BeachItem[];
  dispatchGame: React.Dispatch<GameAction>;
  dispatchCurrency: React.Dispatch<CurrencyAction>;
  dispatchBeach: React.Dispatch<BeachAction>;
  initGame: (variant?: 'sand' | 'sea') => void;
  swapTiles: (row1: number, col1: number, row2: number, col2: number) => void;
  purchaseBeachItem: (itemId: string) => void;
  setSandBlockers: (
    blockers: Array<{ row: number; col: number; hasUmbrella: boolean }>,
  ) => void;
  clearSandBlocker: (row: number, col: number) => void;
  isInitialized: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [gameState, dispatchGame] = useReducer(gameReducer, initialGameState);
  const [currency, dispatchCurrency] = useReducer(
    currencyReducer,
    initialCurrency,
  );
  const [beachItems, dispatchBeach] = useReducer(
    beachReducer,
    initialBeachItems,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('islandlife_currency');
      const savedBeachItems = await AsyncStorage.getItem(
        'islandlife_beach_items',
      );

      if (savedCurrency) {
        dispatchCurrency({
          type: 'LOAD_CURRENCY',
          payload: JSON.parse(savedCurrency),
        });
      }

      if (savedBeachItems) {
        dispatchBeach({
          type: 'LOAD_BEACH_ITEMS',
          payload: JSON.parse(savedBeachItems),
        });
      }

      // Mark as initialized after data is loaded
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading saved data:', error);
      // Still mark as initialized even if there's an error
      setIsInitialized(true);
    }
  };

  // Save data when it changes
  useEffect(() => {
    const saveCurrency = async () => {
      try {
        await AsyncStorage.setItem(
          'islandlife_currency',
          JSON.stringify(currency),
        );
      } catch (error) {
        console.error('Error saving currency:', error);
      }
    };
    saveCurrency();
  }, [currency]);

  useEffect(() => {
    const saveBeachItems = async () => {
      try {
        await AsyncStorage.setItem(
          'islandlife_beach_items',
          JSON.stringify(beachItems),
        );
      } catch (error) {
        console.error('Error saving beach items:', error);
      }
    };
    saveBeachItems();
  }, [beachItems]);

  const initGame = useCallback(
    (variant: 'sand' | 'sea' = 'sand') => {
      dispatchGame({ type: 'INIT_BOARD', payload: { variant } });
    },
    [dispatchGame],
  );

  const swapTiles = useCallback(
    (row1: number, col1: number, row2: number, col2: number) => {
      dispatchGame({ type: 'SWAP_TILES', payload: { row1, col1, row2, col2 } });
    },
    [dispatchGame],
  );

  const purchaseBeachItem = useCallback(
    (itemId: string) => {
      const item = beachItems.find(i => i.id === itemId);
      if (item && !item.isPurchased && currency.keys >= item.cost) {
        dispatchCurrency({ type: 'SPEND_KEYS', payload: item.cost });
        dispatchBeach({ type: 'PURCHASE_ITEM', payload: itemId });
      }
    },
    [beachItems, currency.keys, dispatchCurrency, dispatchBeach],
  );

  const setSandBlockers = useCallback(
    (blockers: Array<{ row: number; col: number; hasUmbrella: boolean }>) => {
      dispatchGame({ type: 'SET_SAND_BLOCKERS', payload: blockers });
    },
    [dispatchGame],
  );

  const clearSandBlocker = useCallback(
    (row: number, col: number) => {
      dispatchGame({ type: 'CLEAR_SAND_BLOCKER', payload: { row, col } });
    },
    [dispatchGame],
  );

  const value: GameContextType = {
    gameState,
    currency,
    beachItems,
    dispatchGame,
    dispatchCurrency,
    dispatchBeach,
    initGame,
    swapTiles,
    purchaseBeachItem,
    setSandBlockers,
    clearSandBlocker,
    isInitialized,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
