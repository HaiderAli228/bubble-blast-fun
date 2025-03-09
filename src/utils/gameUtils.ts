
import { Bubble, BubbleColor } from "../types/game";

export const COLORS: BubbleColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
export const BUBBLE_SIZE = 40; // Bubble diameter in pixels
export const GRID_ROWS = 10;
export const GRID_COLS = 10;

// Generate a random color
export const getRandomColor = (): BubbleColor => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Initialize the game grid with bubbles
export const initializeGrid = (rows: number = 5): Bubble[] => {
  const bubbles: Bubble[] = [];
  
  for (let row = 0; row < rows; row++) {
    // For odd rows, the bubbles are offset
    const colCount = row % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
    
    for (let col = 0; col < colCount; col++) {
      bubbles.push({
        id: generateId(),
        color: getRandomColor(),
        row,
        col,
      });
    }
  }
  
  return bubbles;
};

// Calculate the x, y position from grid coordinates
export const getPositionFromCoords = (row: number, col: number): { x: number, y: number } => {
  // For odd rows, offset by half bubble width
  const xOffset = row % 2 === 0 ? 0 : BUBBLE_SIZE / 2;
  
  return {
    x: col * BUBBLE_SIZE + xOffset,
    y: row * BUBBLE_SIZE * 0.86, // Adjust for overlapping
  };
};

// Get grid coordinates from position
export const getCoordsFromPosition = (x: number, y: number): { row: number, col: number } => {
  const row = Math.round(y / (BUBBLE_SIZE * 0.86));
  const xOffset = row % 2 === 0 ? 0 : BUBBLE_SIZE / 2;
  const col = Math.round((x - xOffset) / BUBBLE_SIZE);
  
  return { row, col };
};

// Find connected bubbles of the same color (for popping)
export const findConnectedBubbles = (bubbles: Bubble[], startBubble: Bubble): Bubble[] => {
  const connected: Bubble[] = [];
  const visited = new Set<string>();
  
  const findConnected = (bubble: Bubble) => {
    const key = `${bubble.row}-${bubble.col}`;
    if (visited.has(key)) return;
    
    visited.add(key);
    connected.push(bubble);
    
    // Get all adjacent bubble positions
    const adjacentPositions = getAdjacentPositions(bubble);
    
    // Check each adjacent position
    adjacentPositions.forEach(({ row, col }) => {
      // Find bubble at this position
      const adjacentBubble = bubbles.find(b => b.row === row && b.col === col);
      
      // If there's a bubble and it's the same color, recursively find its connections
      if (adjacentBubble && adjacentBubble.color === bubble.color) {
        findConnected(adjacentBubble);
      }
    });
  };
  
  findConnected(startBubble);
  return connected;
};

// Get adjacent grid positions
export const getAdjacentPositions = (bubble: Bubble): { row: number, col: number }[] => {
  const { row, col } = bubble;
  const isEvenRow = row % 2 === 0;
  
  // Define adjacent positions based on whether the row is even or odd
  if (isEvenRow) {
    return [
      { row: row - 1, col: col - 1 }, // top-left
      { row: row - 1, col: col }, // top-right
      { row: row, col: col - 1 }, // left
      { row: row, col: col + 1 }, // right
      { row: row + 1, col: col - 1 }, // bottom-left
      { row: row + 1, col: col }, // bottom-right
    ];
  } else {
    return [
      { row: row - 1, col: col }, // top-left
      { row: row - 1, col: col + 1 }, // top-right
      { row: row, col: col - 1 }, // left
      { row: row, col: col + 1 }, // right
      { row: row + 1, col: col }, // bottom-left
      { row: row + 1, col: col + 1 }, // bottom-right
    ];
  }
};

// Calculate the trajectory for a bubble shot
export const calculateTrajectory = (angle: number, speed: number): { dx: number, dy: number } => {
  // Convert angle from degrees to radians
  const radians = (angle * Math.PI) / 180;
  
  return {
    dx: Math.sin(radians) * speed,
    dy: -Math.cos(radians) * speed, // Negative because y-axis is inverted in the DOM
  };
};

// Check if a bubble is floating (not connected to the ceiling)
export const findFloatingBubbles = (bubbles: Bubble[]): Bubble[] => {
  // First, find all bubbles connected to the ceiling (row 0)
  const anchored = new Set<string>();
  const allBubbleMap: Record<string, Bubble> = {};
  
  // Create a map of all bubbles by position
  bubbles.forEach(bubble => {
    const key = `${bubble.row}-${bubble.col}`;
    allBubbleMap[key] = bubble;
  });
  
  // Find all bubbles connected to the ceiling
  const checkAnchored = (bubble: Bubble) => {
    const key = `${bubble.row}-${bubble.col}`;
    if (anchored.has(key)) return;
    
    anchored.add(key);
    
    // Get adjacent positions
    const adjacentPositions = getAdjacentPositions(bubble);
    
    // Check each adjacent position
    adjacentPositions.forEach(({ row, col }) => {
      const adjKey = `${row}-${col}`;
      if (allBubbleMap[adjKey]) {
        checkAnchored(allBubbleMap[adjKey]);
      }
    });
  };
  
  // Start with bubbles at row 0 (ceiling)
  bubbles.filter(b => b.row === 0).forEach(checkAnchored);
  
  // Bubbles that are not anchored are floating
  return bubbles.filter(bubble => {
    const key = `${bubble.row}-${bubble.col}`;
    return !anchored.has(key);
  });
};

// Calculate score based on bubbles popped
export const calculateScore = (poppedCount: number): number => {
  // Base score per bubble
  const baseScore = 10;
  
  // Bonus for popping more bubbles at once
  let bonus = 0;
  if (poppedCount > 3) {
    bonus = (poppedCount - 3) * 5;
  }
  
  return poppedCount * baseScore + bonus;
};
