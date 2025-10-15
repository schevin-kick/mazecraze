import React from 'react';
import { motion } from 'framer-motion';

const Trail = ({ trail, cellSize, currentPlayerPosition }) => {
  if (!trail || trail.length < 2) return null;

  // Create trail that ends at current player position (animated)
  const trailWithPlayer = [...trail];

  // If the player is currently at a different position than the last trail point,
  // add the current animated position as the last point
  const lastTrailPos = trail[trail.length - 1];
  if (currentPlayerPosition &&
      (currentPlayerPosition.row !== lastTrailPos.row ||
       currentPlayerPosition.col !== lastTrailPos.col)) {
    trailWithPlayer.push(currentPlayerPosition);
  }

  // Convert trail positions to SVG path
  const pathData = trailWithPlayer.map((pos, index) => {
    const x = pos.col * cellSize + cellSize / 2;
    const y = pos.row * cellSize + cellSize / 2;
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <defs>
        <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3498db" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#9b59b6" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <motion.path
        d={pathData}
        stroke="url(#trailGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ d: pathData }}
        transition={{ duration: 0.15, ease: 'linear' }}
      />
    </svg>
  );
};

export default Trail;
