
import React, { useState, useEffect, useRef } from 'react';
import Bubble from './Bubble';
import Shooter from './Shooter';
import { GameState, Bubble as BubbleType } from '../types/game';
import {
  BUBBLE_SIZE,
  GRID_ROWS,
  GRID_COLS,
  getRandomColor,
  initializeGrid,
  getCoordsFromPosition,
  findConnectedBubbles,
  calculateTrajectory,
  findFloatingBubbles,
  calculateScore,
  generateId
} from '../utils/gameUtils';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const BubbleGame: React.FC = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    bubbles: initializeGrid(),
    activeBubble: {
      color: getRandomColor(),
      angle: 0
    },
    nextBubble: getRandomColor(),
    score: 0,
    gameOver: false,
    level: 1
  });
  
  const [shooting, setShooting] = useState(false);
  const [shootingBubble, setShootingBubble] = useState<{
    x: number;
    y: number;
    dx: number;
    dy: number;
    color: string;
  } | null>(null);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);
  
  // Animation loop for moving the shooting bubble
  useEffect(() => {
    if (shooting && shootingBubble && gameAreaRef.current) {
      const gameArea = gameAreaRef.current;
      const gameRect = gameArea.getBoundingClientRect();
      
      const animate = () => {
        setShootingBubble(prev => {
          if (!prev) return null;
          
          const newX = prev.x + prev.dx;
          const newY = prev.y + prev.dy;
          
          // Check for collision with walls
          if (newX < 0 || newX > gameRect.width - BUBBLE_SIZE) {
            return {
              ...prev,
              x: newX < 0 ? 0 : gameRect.width - BUBBLE_SIZE,
              dx: -prev.dx // Bounce off the wall
            };
          }
          
          // Check for collision with ceiling
          if (newY < 0) {
            handleBubbleCollision(newX, 0);
            return null;
          }
          
          // Check for collision with existing bubbles
          const { bubbles } = gameState;
          for (const bubble of bubbles) {
            const bubblePos = {
              x: bubble.col * BUBBLE_SIZE + (bubble.row % 2 === 1 ? BUBBLE_SIZE / 2 : 0),
              y: bubble.row * BUBBLE_SIZE * 0.86
            };
            
            const distance = Math.sqrt(
              Math.pow(newX + BUBBLE_SIZE / 2 - bubblePos.x - BUBBLE_SIZE / 2, 2) +
              Math.pow(newY + BUBBLE_SIZE / 2 - bubblePos.y - BUBBLE_SIZE / 2, 2)
            );
            
            if (distance < BUBBLE_SIZE) {
              handleBubbleCollision(newX, newY);
              return null;
            }
          }
          
          return {
            ...prev,
            x: newX,
            y: newY
          };
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [shooting, shootingBubble, gameState.bubbles]);
  
  const resetGame = () => {
    setGameState({
      bubbles: initializeGrid(),
      activeBubble: {
        color: getRandomColor(),
        angle: 0
      },
      nextBubble: getRandomColor(),
      score: 0,
      gameOver: false,
      level: 1
    });
    setShooting(false);
    setShootingBubble(null);
  };
  
  const handleAngleChange = (angle: number) => {
    setGameState(prev => ({
      ...prev,
      activeBubble: {
        ...prev.activeBubble,
        angle
      }
    }));
  };
  
  const handleShoot = () => {
    if (shooting || gameState.gameOver) return;
    
    // Add shooting sound effect
    const shootSound = new Audio('/shoot-sound.mp3');
    shootSound.volume = 0.5;
    shootSound.play().catch(() => {
      // fallback silently if audio can't play
      console.log('Audio playback failed');
    });
    
    setShooting(true);
    
    if (gameAreaRef.current) {
      const gameArea = gameAreaRef.current;
      const shooterX = gameArea.offsetWidth / 2 - BUBBLE_SIZE / 2;
      const shooterY = gameArea.offsetHeight - 150;
      
      const { dx, dy } = calculateTrajectory(gameState.activeBubble.angle, 8);
      
      setShootingBubble({
        x: shooterX,
        y: shooterY,
        dx,
        dy,
        color: gameState.activeBubble.color
      });
    }
  };
  
  const handleBubbleCollision = (x: number, y: number) => {
    if (!shootingBubble) return;
    
    // Convert pixel position to grid coordinates
    const { row, col } = getCoordsFromPosition(x, y);
    
    // Create new bubble at collision point
    const newBubble: BubbleType = {
      id: generateId(),
      color: shootingBubble.color as any,
      row,
      col
    };
    
    // Add new bubble to the grid
    const updatedBubbles = [...gameState.bubbles, newBubble];
    
    // Find connected bubbles of the same color
    const connected = findConnectedBubbles(updatedBubbles, newBubble);
    
    // Check if we have at least 3 connected bubbles to pop
    if (connected.length >= 3) {
      // Mark bubbles for popping animation
      const bubblesToPop = connected.map(b => ({ ...b, isPopping: true }));
      const remainingBubbles = updatedBubbles.filter(bubble => 
        !bubblesToPop.some(b => b.id === bubble.id)
      );
      
      // Update bubbles and score
      setGameState(prev => ({
        ...prev,
        bubbles: [...remainingBubbles, ...bubblesToPop],
      }));
      
      // Short timeout for popping animation
      setTimeout(() => {
        // After popping animation, find floating bubbles
        const floatingBubbles = findFloatingBubbles(remainingBubbles);
        
        // Remove popped bubbles and floating bubbles
        const finalBubbles = remainingBubbles.filter(bubble => 
          !floatingBubbles.some(b => b.id === bubble.id)
        );
        
        // Calculate and update score
        const scoreIncrease = calculateScore(connected.length) + 
          calculateScore(floatingBubbles.length);
        
        const newScore = gameState.score + scoreIncrease;
        
        // Check if level complete (no bubbles left)
        let newLevel = gameState.level;
        let newBubbles = finalBubbles;
        
        if (finalBubbles.length === 0) {
          newLevel = gameState.level + 1;
          newBubbles = initializeGrid(Math.min(5 + Math.floor(newLevel / 2), GRID_ROWS));
          
          toast({
            title: "Level Up!",
            description: `You've reached level ${newLevel}!`,
          });
        }
        
        // Update game state
        setGameState(prev => ({
          ...prev,
          bubbles: newBubbles,
          score: newScore,
          level: newLevel,
          activeBubble: {
            color: prev.nextBubble,
            angle: prev.activeBubble.angle
          },
          nextBubble: getRandomColor()
        }));
        
        setShooting(false);
        setShootingBubble(null);
      }, 300);
    } else {
      // If no bubbles to pop, just add the new bubble
      
      // Check if game over (bubbles reached the bottom)
      const isGameOver = updatedBubbles.some(bubble => 
        bubble.row >= GRID_ROWS - 2
      );
      
      if (isGameOver) {
        toast({
          title: "Game Over!",
          description: `Final Score: ${gameState.score}`,
          variant: "destructive"
        });
      }
      
      setGameState(prev => ({
        ...prev,
        bubbles: updatedBubbles,
        gameOver: isGameOver,
        activeBubble: {
          color: prev.nextBubble,
          angle: prev.activeBubble.angle
        },
        nextBubble: getRandomColor()
      }));
      
      setShooting(false);
      setShootingBubble(null);
    }
  };
  
  const gameAreaWidth = GRID_COLS * BUBBLE_SIZE;
  const gameAreaHeight = GRID_ROWS * BUBBLE_SIZE + 200; // Added space for shooter and button
  
  return (
    <div className="flex flex-col h-full">
      {/* App Bar */}
      <div className="bg-gray-900 p-4 flex justify-between items-center shadow-md border-b border-gray-700">
        <div className="text-xl font-bold text-white">Bubble Blast</div>
        <div className="flex gap-4">
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-gray-400 mr-2">Score:</span>
            <span className="text-white font-bold">{gameState.score}</span>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-gray-400 mr-2">Level:</span>
            <span className="text-white font-bold">{gameState.level}</span>
          </div>
          {gameState.gameOver && (
            <Button onClick={resetGame} variant="destructive" size="sm">
              Play Again
            </Button>
          )}
        </div>
      </div>
      
      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative game-background rounded-lg overflow-hidden shadow-2xl flex-grow"
        style={{ width: gameAreaWidth, height: gameAreaHeight }}
      >
        {/* Animated background elements */}
        <div className="absolute w-6 h-6 rounded-full bg-blue-500/20 animate-float" 
             style={{ top: '10%', left: '30%', animationDelay: '0s' }} />
        <div className="absolute w-4 h-4 rounded-full bg-purple-500/20 animate-float" 
             style={{ top: '20%', left: '70%', animationDelay: '0.5s' }} />
        <div className="absolute w-8 h-8 rounded-full bg-green-500/20 animate-float" 
             style={{ top: '50%', left: '80%', animationDelay: '1s' }} />
        <div className="absolute w-5 h-5 rounded-full bg-yellow-500/20 animate-float" 
             style={{ top: '70%', left: '20%', animationDelay: '1.5s' }} />
        
        {/* Render all bubbles */}
        {gameState.bubbles.map(bubble => (
          <Bubble key={bubble.id} bubble={bubble} />
        ))}
        
        {/* Render the shooting bubble if active */}
        {shootingBubble && (
          <div
            className={`absolute bubble bubble-${shootingBubble.color} shadow-lg`}
            style={{
              width: BUBBLE_SIZE,
              height: BUBBLE_SIZE,
              borderRadius: '50%',
              left: shootingBubble.x,
              top: shootingBubble.y,
              zIndex: 5,
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))'
            }}
          />
        )}
        
        {/* Shooter component with button */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center">
          <Shooter
            color={gameState.activeBubble.color}
            angle={gameState.activeBubble.angle}
            onAngleChange={handleAngleChange}
            onShoot={handleShoot}
            nextBubble={gameState.nextBubble}
          />
        </div>
      </div>
    </div>
  );
};

export default BubbleGame;
