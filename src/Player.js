import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Player = ({ position, cellSize }) => {
  // Memoize static calculations
  const { circleSize, centerOffset } = useMemo(() => {
    const size = cellSize * 0.6;
    const offset = (cellSize - size) / 2;
    return { circleSize: size, centerOffset: offset };
  }, [cellSize]);

  // Memoize position calculation
  const animatePos = useMemo(() => ({
    x: position.col * cellSize + centerOffset,
    y: position.row * cellSize + centerOffset,
  }), [position.col, position.row, cellSize, centerOffset]);

  return (
    <motion.div
      className="player"
      animate={animatePos}
      transition={{
        type: 'tween',
        ease: 'linear',
        duration: 0.12,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: circleSize,
        height: circleSize,
        zIndex: 10,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          border: '2px solid #45a049',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </motion.div>
  );
};

export default Player;
