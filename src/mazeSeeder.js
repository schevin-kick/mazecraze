// Seeded Random Number Generator using Mulberry32 algorithm
// This ensures the same seed always produces the same sequence of random numbers

/**
 * Mulberry32 - A simple, fast, high-quality PRNG
 * @param {number} seed - A 32-bit integer seed
 * @returns {function} A function that returns random numbers between 0 and 1
 */
const mulberry32 = (seed) => {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

/**
 * Simple hash function to convert strings to numbers
 * @param {string} str - String to hash
 * @returns {number} A 32-bit hash
 */
export const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Create a seeded random number generator
 * @param {number|string} seed - Seed value (number or string)
 * @returns {function} Random number generator function
 */
export const createSeededRandom = (seed) => {
  const numericSeed = typeof seed === 'string' ? hashString(seed) : seed;
  return mulberry32(numericSeed);
};

/**
 * Generate a random seed based on current timestamp
 * @returns {number} A random seed
 */
export const generateRandomSeed = () => {
  return Math.floor(Math.random() * 2147483647);
};

/**
 * Fisher-Yates shuffle using seeded random
 * @param {Array} array - Array to shuffle
 * @param {function} random - Seeded random function
 * @returns {Array} Shuffled array
 */
export const seededShuffle = (array, random) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate maze dimensions based on seed
 * @param {number} seed - Seed for dimension generation
 * @returns {Object} { rows, cols, cellSize, sizeCategory, shape }
 */
export const generateMazeDimensions = (seed) => {
  const random = createSeededRandom(seed);

  // Determine size category: 0=small, 1=medium (no large to avoid scrolling)
  const sizeCategory = Math.floor(random() * 2);

  // Determine shape: 0=square, 1=landscape (no portrait to avoid vertical scrolling)
  const shapeType = Math.floor(random() * 2);

  let baseSize, cellSize, sizeLabel;

  // Size tiers (reduced max size)
  switch (sizeCategory) {
    case 0: // Small
      baseSize = 15 + Math.floor(random() * 3) * 2; // 15, 17, 19
      cellSize = 25 + Math.floor(random() * 3) * 2; // 25, 27, 29
      sizeLabel = 'Small';
      break;
    case 1: // Medium
      baseSize = 21 + Math.floor(random() * 4) * 2; // 21, 23, 25, 27
      cellSize = 20 + Math.floor(random() * 3) * 2; // 20, 22, 24
      sizeLabel = 'Medium';
      break;
    default:
      baseSize = 21;
      cellSize = 22;
      sizeLabel = 'Medium';
  }

  let rows, cols, shapeLabel;

  // Shape variants (landscape or square only, no portrait)
  switch (shapeType) {
    case 0: // Square
      rows = baseSize;
      cols = baseSize;
      shapeLabel = 'Square';
      break;
    case 1: // Landscape (wide)
      rows = baseSize;
      cols = baseSize + Math.floor(random() * 3 + 2) * 2; // Add 4-8 columns (even)
      shapeLabel = 'Landscape';
      break;
    default:
      rows = baseSize;
      cols = baseSize;
      shapeLabel = 'Square';
  }

  // Ensure odd numbers (required for maze generation algorithm)
  rows = rows % 2 === 0 ? rows + 1 : rows;
  cols = cols % 2 === 0 ? cols + 1 : cols;

  return {
    rows,
    cols,
    cellSize,
    sizeCategory: sizeLabel,
    shape: shapeLabel,
    totalWidth: cols * cellSize,
    totalHeight: rows * cellSize,
  };
};
