
import React from 'react';
import { Button } from "@/components/ui/button";

interface GameInfoProps {
  score: number;
  level: number;
  onRestart: () => void;
  gameOver: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({ score, level, onRestart, gameOver }) => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-2">Bubble Blast</h2>
        <div className="text-white mb-1">Score: <span className="font-bold">{score}</span></div>
        <div className="text-white mb-3">Level: <span className="font-bold">{level}</span></div>
        
        {gameOver && (
          <div className="mt-4">
            <div className="text-red-400 font-bold mb-2">Game Over!</div>
            <Button onClick={onRestart} variant="destructive" size="sm">
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInfo;
