import React from 'react';

const MazeRenderer = ({ mazeGrid, cellSize }) => {
  const rows = mazeGrid.length;
  const cols = mazeGrid[0].length;

  const getCellClass = (cellValue) => {
    switch (cellValue) {
      case 0:
        return 'maze-wall';
      case 1:
        return 'maze-path';
      case 2:
        return 'maze-entrance';
      case 3:
        return 'maze-exit';
      default:
        return 'maze-path';
    }
  };

  return (
    <div
      className="maze-grid"
      style={{
        position: 'relative',
        width: cols * cellSize,
        height: rows * cellSize,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        border: '3px solid #333',
      }}
    >
      {mazeGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={getCellClass(cell)}
            style={{
              width: cellSize,
              height: cellSize,
              border: '1px solid #ddd',
            }}
          />
        ))
      )}
    </div>
  );
};

export default MazeRenderer;
