import { useState, useEffect, useCallback, useRef } from 'react';
import { isValidPath, isJunction, getEntrancePosition, getExitPosition } from './mazeData';

// Custom hook to handle maze movement logic
const useMazeMovement = (mazeGrid, replayMoves = null) => {
  const [playerPosition, setPlayerPosition] = useState(() => getEntrancePosition(mazeGrid));
  const [isMoving, setIsMoving] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [trail, setTrail] = useState(() => [getEntrancePosition(mazeGrid)]);
  const [moveHistory, setMoveHistory] = useState([]);
  const moveQueueRef = useRef([]);
  const processingRef = useRef(false);
  const processNextMoveRef = useRef(null);
  const isReplayMode = replayMoves !== null;

  // Find the next junction or dead end in a given direction
  // Returns both the final position and the path taken
  const findNextStop = useCallback((startRow, startCol, direction) => {
    let row = startRow;
    let col = startCol;
    let deltaRow = 0;
    let deltaCol = 0;
    const pathTaken = [];

    // Set delta based on direction
    switch (direction) {
      case 'up':
        deltaRow = -1;
        break;
      case 'down':
        deltaRow = 1;
        break;
      case 'left':
        deltaCol = -1;
        break;
      case 'right':
        deltaCol = 1;
        break;
      default:
        return { row: startRow, col: startCol, path: [] };
    }

    // Check if we can move in this direction at all
    const nextRow = row + deltaRow;
    const nextCol = col + deltaCol;
    if (!isValidPath(mazeGrid, nextRow, nextCol)) {
      return { row, col, path: [] }; // Can't move, stay in place
    }

    // Move at least one step in the direction
    row = nextRow;
    col = nextCol;
    pathTaken.push({ row, col });

    // Keep moving until we hit a junction or dead end
    while (true) {
      // Try to continue in the same direction
      const continueRow = row + deltaRow;
      const continueCol = col + deltaCol;

      if (isValidPath(mazeGrid, continueRow, continueCol)) {
        // Check if current position is a junction before moving further
        if (isJunction(mazeGrid, row, col)) {
          break;
        }
        // Continue moving
        row = continueRow;
        col = continueCol;
        pathTaken.push({ row, col });
      } else {
        // Hit a wall, this is the end point
        break;
      }
    }

    return { row, col, path: pathTaken };
  }, [mazeGrid]);

  // Process the next move in the queue
  const processNextMove = useCallback(() => {
    if (processingRef.current || hasWon) return;
    if (moveQueueRef.current.length === 0) return;

    processingRef.current = true;
    setIsMoving(true);

    const direction = moveQueueRef.current.shift();

    setPlayerPosition((currentPos) => {
      const result = findNextStop(currentPos.row, currentPos.col, direction);

      // Only update position if we actually moved
      if (result.row !== currentPos.row || result.col !== currentPos.col) {
        // Record the move in history
        setMoveHistory(prev => [...prev, direction]);

        // After animation completes, add the full path to trail
        setTimeout(() => {
          setTrail(prev => [...prev, ...result.path]);

          // Check if player reached the exit
          const exitPos = getExitPosition(mazeGrid);
          if (result.row === exitPos.row && result.col === exitPos.col) {
            setHasWon(true);
          }

          processingRef.current = false;
          setIsMoving(false);

          // Process next move in queue if exists
          if (moveQueueRef.current.length > 0 && processNextMoveRef.current) {
            setTimeout(() => processNextMoveRef.current(), 0);
          }
        }, 120); // Match animation duration

        return { row: result.row, col: result.col };
      }

      processingRef.current = false;
      setIsMoving(false);
      return currentPos;
    });
  }, [findNextStop, mazeGrid, hasWon]);

  // Store reference to processNextMove
  processNextMoveRef.current = processNextMove;

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (event) => {
      if (hasWon || isReplayMode) return;

      let direction = null;
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return;
      }

      event.preventDefault();

      // Add to queue (max 3 moves ahead)
      if (moveQueueRef.current.length < 3) {
        moveQueueRef.current.push(direction);
      }

      // Start processing if not already processing
      if (!processingRef.current) {
        processNextMove();
      }
    },
    [hasWon, isReplayMode, processNextMove]
  );

  // Replay mode: instantly compute and display complete trail
  useEffect(() => {
    if (!isReplayMode || !replayMoves || replayMoves.length === 0) return;

    // Build the complete trail instantly
    let currentPos = getEntrancePosition(mazeGrid);
    const completeTrail = [currentPos];

    for (const direction of replayMoves) {
      const result = findNextStop(currentPos.row, currentPos.col, direction);
      if (result.row !== currentPos.row || result.col !== currentPos.col) {
        completeTrail.push(...result.path);
        currentPos = { row: result.row, col: result.col };
      }
    }

    // Set final position and complete trail instantly
    setPlayerPosition(currentPos);
    setTrail(completeTrail);
    setMoveHistory(replayMoves);

    // Check if final position is exit
    const exitPos = getExitPosition(mazeGrid);
    if (currentPos.row === exitPos.row && currentPos.col === exitPos.col) {
      setHasWon(true);
    }
  }, [isReplayMode, replayMoves, mazeGrid, findNextStop]);

  // Set up keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const resetGame = useCallback((newMazeGrid) => {
    const mazeToUse = newMazeGrid || mazeGrid;
    const entrance = getEntrancePosition(mazeToUse);
    setPlayerPosition(entrance);
    setTrail([entrance]);
    setMoveHistory([]);
    setHasWon(false);
    setIsMoving(false);
    moveQueueRef.current = [];
    processingRef.current = false;
  }, [mazeGrid]);

  return {
    playerPosition,
    hasWon,
    trail,
    moveHistory,
    resetGame,
  };
};

export default useMazeMovement;
