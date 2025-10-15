import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DynamicWall = ({ recentChanges, cellSize }) => {
  if (!recentChanges || recentChanges.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 8,
      }}
    >
      <AnimatePresence>
        {recentChanges.map((change, index) => (
          <motion.div
            key={`${change.row}-${change.col}-${index}`}
            initial={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 1],
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 1,
              times: [0, 0.3, 0.7, 1],
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: change.col * cellSize,
              top: change.row * cellSize,
              width: cellSize,
              height: cellSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              background:
                change.type === 'toWall'
                  ? 'radial-gradient(circle, rgba(231, 76, 60, 0.8) 0%, rgba(192, 57, 43, 0.6) 100%)'
                  : 'radial-gradient(circle, rgba(46, 204, 113, 0.8) 0%, rgba(39, 174, 96, 0.6) 100%)',
              boxShadow:
                change.type === 'toWall'
                  ? '0 0 20px rgba(231, 76, 60, 0.6)'
                  : '0 0 20px rgba(46, 204, 113, 0.6)',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1,
                ease: 'easeInOut',
              }}
              style={{
                fontSize: cellSize * 0.6,
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {change.type === 'toWall' ? '🧱' : '✨'}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DynamicWall;
