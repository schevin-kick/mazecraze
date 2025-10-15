// Game data management and storage utilities

/**
 * Create game data object
 * @param {number} seed - Maze seed
 * @param {Array} moves - Array of move directions
 * @param {boolean} won - Whether the game was won
 * @param {Object} dimensions - Optional maze dimensions { rows, cols, cellSize }
 * @returns {Object} Game data object
 */
export const createGameData = (seed, moves, won, dimensions = null) => {
  const data = {
    seed,
    moves,
    won,
    completed: true,
    timestamp: Date.now(),
    moveCount: moves.length,
  };

  if (dimensions) {
    data.rows = dimensions.rows;
    data.cols = dimensions.cols;
    data.cellSize = dimensions.cellSize;
  }

  return data;
};

/**
 * Save game to localStorage
 * @param {Object} gameData - Game data to save
 */
export const saveGame = (gameData) => {
  try {
    const games = getStoredGames();
    games[gameData.seed] = gameData;
    localStorage.setItem('mazeGames', JSON.stringify(games));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

/**
 * Get all stored games
 * @returns {Object} Object with seed as key, game data as value
 */
export const getStoredGames = () => {
  try {
    const data = localStorage.getItem('mazeGames');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load games:', error);
    return {};
  }
};

/**
 * Get game by seed
 * @param {number} seed - Seed to look up
 * @returns {Object|null} Game data or null if not found
 */
export const getGameBySeed = (seed) => {
  const games = getStoredGames();
  return games[seed] || null;
};

/**
 * Export game data as JSON string
 * @param {Object} gameData - Game data to export
 * @returns {string} JSON string
 */
export const exportGameData = (gameData) => {
  return JSON.stringify(gameData, null, 2);
};

/**
 * Import game data from JSON string
 * @param {string} jsonString - JSON string to parse
 * @returns {Object|null} Game data or null if invalid
 */
export const importGameData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.seed && Array.isArray(data.moves)) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Failed to import game data:', error);
    return null;
  }
};
