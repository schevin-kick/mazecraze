import { useState, useEffect, useCallback, useRef } from 'react';
import { getExitPosition } from './mazeData';

// BFS pathfinding to check if exit is reachable from player position
const isExitReachable = (grid, playerPos, exitPos) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const queue = [playerPos];
  visited[playerPos.row][playerPos.col] = true;

  while (queue.length > 0) {
    const current = queue.shift();

    // Check if we reached the exit
    if (current.row === exitPos.row && current.col === exitPos.col) {
      return true;
    }

    // Check all four directions
    const directions = [
      { row: current.row - 1, col: current.col },
      { row: current.row + 1, col: current.col },
      { row: current.row, col: current.col - 1 },
      { row: current.row, col: current.col + 1 },
    ];

    for (const next of directions) {
      if (next.row >= 0 && next.row < rows &&
          next.col >= 0 && next.col < cols &&
          !visited[next.row][next.col] &&
          grid[next.row][next.col] !== 0) {
        visited[next.row][next.col] = true;
        queue.push(next);
      }
    }
  }

  return false;
};

// Get all path cells (value 1) that aren't adjacent to player
const getValidPathCells = (grid, playerPos, bufferDistance = 2) => {
  const paths = [];
  for (let row = 1; row < grid.length - 1; row++) {
    for (let col = 1; col < grid[0].length - 1; col++) {
      if (grid[row][col] === 1) {
        // Calculate Manhattan distance from player
        const distance = Math.abs(row - playerPos.row) + Math.abs(col - playerPos.col);
        if (distance >= bufferDistance) {
          paths.push({ row, col });
        }
      }
    }
  }
  return paths;
};

// Get all wall cells (value 0) that aren't on the border
const getValidWallCells = (grid) => {
  const walls = [];
  for (let row = 2; row < grid.length - 2; row++) {
    for (let col = 2; col < grid[0].length - 2; col++) {
      if (grid[row][col] === 0) {
        walls.push({ row, col });
      }
    }
  }
  return walls;
};

// Shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const useDynamicMazeWalls = (initialGrid, playerPosition, isEnabled = false, hasWon = false, isReplayMode = false) => {
  const [mazeGrid, setMazeGrid] = useState(initialGrid);
  const [recentChanges, setRecentChanges] = useState([]);
  const [nextShiftTime, setNextShiftTime] = useState(null);
  const timerRef = useRef(null);
  const isEnabledRef = useRef(isEnabled);

  // Update ref when isEnabled changes
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  // Reset maze grid when initial grid changes
  useEffect(() => {
    setMazeGrid(initialGrid);
    setRecentChanges([]);
  }, [initialGrid]);

  const performWallShift = useCallback(() => {
    // Don't shift if disabled, game is won, or in replay mode
    if (!isEnabledRef.current || hasWon || isReplayMode) {
      return;
    }

    setMazeGrid((currentGrid) => {
      const newGrid = currentGrid.map(row => [...row]);
      const exitPos = getExitPosition(currentGrid);
      const changes = [];

      // Get valid cells for transformation
      const pathCells = getValidPathCells(currentGrid, playerPosition);
      const wallCells = getValidWallCells(currentGrid);

      if (pathCells.length === 0 || wallCells.length === 0) {
        return currentGrid; // Not enough cells to transform
      }

      // Randomly select 3-5 cells to transform
      const numChanges = Math.floor(Math.random() * 3) + 3; // 3-5 changes
      const shuffledPaths = shuffleArray(pathCells);
      const shuffledWalls = shuffleArray(wallCells);

      const pathsToWalls = shuffledPaths.slice(0, Math.min(numChanges, shuffledPaths.length));
      const wallsToPaths = shuffledWalls.slice(0, Math.min(numChanges, shuffledWalls.length));

      // Apply transformations tentatively
      for (const cell of pathsToWalls) {
        newGrid[cell.row][cell.col] = 0; // Convert path to wall
      }
      for (const cell of wallsToPaths) {
        newGrid[cell.row][cell.col] = 1; // Convert wall to path
      }

      // Validate that exit is still reachable
      if (!isExitReachable(newGrid, playerPosition, exitPos)) {
        // Revert changes - exit not reachable
        console.log('Wall shift cancelled - exit would be unreachable');
        return currentGrid;
      }

      // Record changes for animation
      const allChanges = [
        ...pathsToWalls.map(cell => ({ ...cell, type: 'toWall' })),
        ...wallsToPaths.map(cell => ({ ...cell, type: 'toPath' })),
      ];
      setRecentChanges(allChanges);

      // Clear recent changes after animation
      setTimeout(() => setRecentChanges([]), 1000);

      console.log(`Wall shift: ${pathsToWalls.length} new walls, ${wallsToPaths.length} new paths`);
      return newGrid;
    });
  }, [playerPosition, hasWon, isReplayMode]);

  // Schedule next wall shift
  const scheduleNextShift = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!isEnabled || hasWon || isReplayMode) {
      setNextShiftTime(null);
      return;
    }

    // Random interval between 3-6 seconds (faster tempo)
    const interval = (Math.random() * 3000) + 3000;
    const nextTime = Date.now() + interval;
    setNextShiftTime(nextTime);

    timerRef.current = setTimeout(() => {
      performWallShift();
      scheduleNextShift();
    }, interval);
  }, [isEnabled, hasWon, isReplayMode, performWallShift]);

  // Start/stop timer based on enabled state
  useEffect(() => {
    if (isEnabled && !hasWon && !isReplayMode) {
      scheduleNextShift();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setNextShiftTime(null);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isEnabled, hasWon, isReplayMode, scheduleNextShift]);

  return {
    mazeGrid,
    recentChanges,
    nextShiftTime,
  };
};

export default useDynamicMazeWalls;
