import React, { useState, useCallback, useEffect } from 'react';
import MazeRenderer from './MazeRenderer';
import Player from './Player';
import Trail from './Trail';
import DynamicWall from './DynamicWall';
import useMazeMovement from './useMazeMovement';
import useDynamicMazeWalls from './useDynamicMazeWalls';
import { generateMaze } from './mazeGenerator';
import { DEFAULT_ROWS, DEFAULT_COLS } from './mazeData';
import { saveGame, getGameBySeed, createGameData } from './gameStorage';
import './Maze.css';

const Maze = () => {
  const [mazeData, setMazeData] = useState(() => {
    const result = generateMaze();
    console.log('Initial Maze Seed:', result.seed);
    console.log(`Dimensions: ${result.rows}×${result.cols} (${result.shape}, ${result.sizeCategory})`);
    console.log(`Cell Size: ${result.cellSize}px`);
    console.log(`Total Size: ${result.totalWidth}×${result.totalHeight} pixels`);
    return result;
  });
  const [seedInput, setSeedInput] = useState('');
  const [replayMoves, setReplayMoves] = useState(null);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [dynamicWallsEnabled, setDynamicWallsEnabled] = useState(false);

  // Dynamic walls feature - need to initialize before useMazeMovement to get current grid
  const [currentMazeGridState, setCurrentMazeGridState] = useState(mazeData.grid);

  const { playerPosition, hasWon, trail, moveHistory, resetGame } = useMazeMovement(
    currentMazeGridState,
    replayMoves
  );

  // Dynamic walls hook
  const { mazeGrid: dynamicMazeGrid, recentChanges, nextShiftTime } = useDynamicMazeWalls(
    mazeData.grid,
    playerPosition,
    dynamicWallsEnabled,
    hasWon,
    isReplayMode
  );

  // Update current maze grid when dynamic walls change
  useEffect(() => {
    const newGrid = dynamicWallsEnabled ? dynamicMazeGrid : mazeData.grid;
    setCurrentMazeGridState(newGrid);
  }, [dynamicWallsEnabled, dynamicMazeGrid, mazeData.grid]);

  // Save game when won
  useEffect(() => {
    if (hasWon && moveHistory.length > 0 && !isReplayMode) {
      const dimensions = {
        rows: mazeData.rows,
        cols: mazeData.cols,
        cellSize: mazeData.cellSize,
      };
      const gameData = createGameData(mazeData.seed, moveHistory, true, dimensions);
      saveGame(gameData);
      console.log('Game saved! Seed:', mazeData.seed, 'Moves:', moveHistory.length);
      console.log('Move sequence:', moveHistory);
    }
  }, [hasWon, moveHistory, mazeData, isReplayMode]);

  const generateNewMaze = useCallback((seed = null) => {
    const result = generateMaze(seed);
    console.log('Generated Maze with Seed:', result.seed);
    console.log(`Dimensions: ${result.rows}×${result.cols} (${result.shape}, ${result.sizeCategory})`);
    console.log(`Cell Size: ${result.cellSize}px`);
    console.log(`Total Size: ${result.totalWidth}×${result.totalHeight} pixels`);
    setMazeData(result);
    setReplayMoves(null);
    setIsReplayMode(false);
    setDynamicWallsEnabled(false);
    resetGame(result.grid);
  }, [resetGame]);

  const loadSeed = useCallback(() => {
    const seed = parseInt(seedInput, 10);
    if (isNaN(seed)) {
      alert('Please enter a valid numeric seed');
      return;
    }

    // Check if we have saved game data for this seed
    const savedGame = getGameBySeed(seed);
    if (savedGame && savedGame.moves) {
      console.log('Loading saved game - Seed:', seed);
      console.log('Replay moves:', savedGame.moves);
      const result = generateMaze(seed);
      console.log(`Dimensions: ${result.rows}×${result.cols} (${result.shape}, ${result.sizeCategory})`);
      setMazeData(result);
      setReplayMoves(savedGame.moves);
      setIsReplayMode(true);
      resetGame(result.grid);
    } else {
      console.log('No saved game found, generating new maze with seed:', seed);
      generateNewMaze(seed);
    }

    setSeedInput('');
  }, [seedInput, generateNewMaze, resetGame]);

  return (
    <div className="maze-container">
      <h1>Maze Game</h1>
      <div className="maze-instructions">
        {isReplayMode ? '👁️ Viewing Completed Game - Trail shows the solution path' : 'Use arrow keys to navigate. Move from junction to junction!'}
      </div>

      <div className="maze-seed-display">
        Seed: <span className="seed-value">{mazeData.seed}</span> | {mazeData.rows}×{mazeData.cols} ({mazeData.shape}, {mazeData.sizeCategory})
      </div>

      <div className="seed-input-container">
        <input
          type="text"
          placeholder="Enter seed to load..."
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadSeed()}
          className="seed-input"
        />
        <button onClick={loadSeed} className="load-seed-button">
          Load Seed
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => generateNewMaze()} className="generate-button">
          Generate New Maze
        </button>

        {!isReplayMode && (
          <button
            onClick={() => setDynamicWallsEnabled(!dynamicWallsEnabled)}
            className={dynamicWallsEnabled ? 'dynamic-walls-button active' : 'dynamic-walls-button'}
            disabled={hasWon}
          >
            {dynamicWallsEnabled ? '🔥 Dynamic Walls: ON' : '🧱 Dynamic Walls: OFF'}
          </button>
        )}
      </div>

      {dynamicWallsEnabled && nextShiftTime && !hasWon && (
        <div className="shift-timer">
          ⚡ Walls shifting soon...
        </div>
      )}

      <div className="maze-wrapper">
        <MazeRenderer mazeGrid={currentMazeGridState} cellSize={mazeData.cellSize} />
        <Trail trail={trail} cellSize={mazeData.cellSize} currentPlayerPosition={playerPosition} />
        <DynamicWall recentChanges={recentChanges} cellSize={mazeData.cellSize} />
        <Player position={playerPosition} cellSize={mazeData.cellSize} />
      </div>

      {hasWon && !isReplayMode && (
        <div className="win-message">
          <h2>🎉 Congratulations! You've escaped the maze!</h2>
          <button onClick={generateNewMaze} className="reset-button">
            New Maze
          </button>
        </div>
      )}
    </div>
  );
};

export default Maze;
