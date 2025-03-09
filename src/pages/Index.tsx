
import React from 'react';
import BubbleGame from '../components/BubbleGame';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-game-background p-2">
      <div className="flex-grow flex flex-col overflow-hidden">
        <BubbleGame />
      </div>
      
      <div className="mt-4 text-white/70 text-center max-w-md mx-auto">
        <details className="mb-2">
          <summary className="text-lg font-semibold cursor-pointer">How to Play</summary>
          <div className="p-3 bg-black/30 rounded-md mt-2">
            <p className="mb-2">1. Move your mouse or finger to aim the shooter</p>
            <p className="mb-2">2. Click the "SHOT" button to launch a bubble</p>
            <p>3. Match 3 or more of the same color to pop them</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default Index;
