// Depth-First Search (Recursive Backtracking) Maze Generation Algorithm
// Creates perfect mazes with a single solution path

import { createSeededRandom, generateRandomSeed, generateMazeDimensions } from './mazeSeeder';

export const generateMaze = (seed = null) => {
  // Use provided seed or generate a random one
  const mazeSeed = seed !== null ? seed : generateRandomSeed();

  // Generate dimensions based on seed
  const dimensions = generateMazeDimensions(mazeSeed);
  const { rows, cols, cellSize } = dimensions;

  const random = createSeededRandom(mazeSeed);

  // Initialize grid with all walls (0)
  const grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  // Helper function to get unvisited neighbors
  const getUnvisitedNeighbors = (row, col, visited) => {
    const neighbors = [];
    const directions = [
      { dr: -2, dc: 0, name: 'north' },  // North
      { dr: 2, dc: 0, name: 'south' },   // South
      { dr: 0, dc: -2, name: 'west' },   // West
      { dr: 0, dc: 2, name: 'east' }     // East
    ];

    for (const dir of directions) {
      const newRow = row + dir.dr;
      const newCol = col + dir.dc;

      if (newRow > 0 && newRow < rows - 1 &&
          newCol > 0 && newCol < cols - 1 &&
          !visited[newRow][newCol]) {
        neighbors.push({ row: newRow, col: newCol, dir });
      }
    }

    return neighbors;
  };

  // Shuffle array using seeded random
  const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Track visited cells
  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));

  // Recursive DFS function
  const carvePath = (row, col) => {
    visited[row][col] = true;
    grid[row][col] = 1; // Mark as path

    // Get and shuffle neighbors for random maze generation
    const neighbors = shuffle(getUnvisitedNeighbors(row, col, visited));

    for (const neighbor of neighbors) {
      if (!visited[neighbor.row][neighbor.col]) {
        // Carve path to neighbor
        const wallRow = row + neighbor.dir.dr / 2;
        const wallCol = col + neighbor.dir.dc / 2;
        grid[wallRow][wallCol] = 1; // Remove wall between cells

        // Recursively visit neighbor
        carvePath(neighbor.row, neighbor.col);
      }
    }
  };

  // Start carving from position (1, 1)
  carvePath(1, 1);

  // Place entrance at top
  let entranceCol = 1;
  // Find first path cell in second row
  for (let col = 1; col < cols - 1; col++) {
    if (grid[1][col] === 1) {
      entranceCol = col;
      break;
    }
  }
  grid[0][entranceCol] = 2; // Entrance

  // Place exit at bottom - find path cell in second-to-last row
  let exitCol = cols - 2;
  // Find last path cell in second-to-last row
  for (let col = cols - 2; col > 0; col--) {
    if (grid[rows - 2][col] === 1) {
      exitCol = col;
      break;
    }
  }
  grid[rows - 1][exitCol] = 3; // Exit

  return {
    grid,
    seed: mazeSeed,
    rows,
    cols,
    cellSize,
    sizeCategory: dimensions.sizeCategory,
    shape: dimensions.shape,
    totalWidth: dimensions.totalWidth,
    totalHeight: dimensions.totalHeight,
  };
};
