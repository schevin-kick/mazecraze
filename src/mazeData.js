// Grid dimensions
export const CELL_SIZE = 20; // pixels (reduced from 50 to fit more on screen)
export const DEFAULT_ROWS = 31; // increased for more complexity
export const DEFAULT_COLS = 31; // increased for more complexity

// Find entrance position in a maze grid
export const getEntrancePosition = (mazeGrid) => {
  const rows = mazeGrid.length;
  const cols = mazeGrid[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (mazeGrid[row][col] === 2) {
        return { row, col };
      }
    }
  }
  return { row: 0, col: 1 }; // fallback
};

// Find exit position in a maze grid
export const getExitPosition = (mazeGrid) => {
  const rows = mazeGrid.length;
  const cols = mazeGrid[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (mazeGrid[row][col] === 3) {
        return { row, col };
      }
    }
  }
  return { row: rows - 1, col: cols - 2 }; // fallback
};

// Check if a cell is a valid path (not a wall)
export const isValidPath = (mazeGrid, row, col) => {
  const rows = mazeGrid.length;
  const cols = mazeGrid[0].length;

  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    return false;
  }
  return mazeGrid[row][col] !== 0;
};

// Check if a position is a junction (has more than 2 valid directions)
export const isJunction = (mazeGrid, row, col) => {
  if (!isValidPath(mazeGrid, row, col)) return false;

  const directions = [
    { row: row - 1, col }, // up
    { row: row + 1, col }, // down
    { row, col: col - 1 }, // left
    { row, col: col + 1 }, // right
  ];

  const validDirections = directions.filter(dir =>
    isValidPath(mazeGrid, dir.row, dir.col)
  ).length;

  return validDirections > 2;
};
