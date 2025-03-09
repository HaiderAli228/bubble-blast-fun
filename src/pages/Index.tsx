
import React from 'react';
import BubbleGame from '../components/BubbleGame';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-game-background p-4">
      <h1 className="text-4xl font-bold mb-6 text-white text-center">Bubble Blast</h1>
      
      <div className="max-w-full overflow-auto p-4">
        <BubbleGame />
      </div>
      
      <div className="mt-6 text-white/70 text-center max-w-md">
        <h2 className="text-xl font-semibold mb-2">How to Play</h2>
        <p className="mb-2">Aim and shoot bubbles to match 3 or more of the same color.</p>
        <p>Click or tap to shoot. Move your mouse or finger to aim.</p>
      </div>
    </div>
  );
};

export default Index;
