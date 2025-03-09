
import React from 'react';
import { BubbleColor } from '../types/game';
import { BUBBLE_SIZE } from '../utils/gameUtils';
import { Button } from "@/components/ui/button";

interface ShooterProps {
  color: BubbleColor;
  angle: number;
  onAngleChange: (angle: number) => void;
  onShoot: () => void;
  nextBubble: BubbleColor;
}

const Shooter: React.FC<ShooterProps> = ({ 
  color, 
  angle, 
  onAngleChange, 
  onShoot, 
  nextBubble 
}) => {
  const handleMouseMove = (e: React.MouseEvent) => {
    const shooterElem = e.currentTarget;
    const rect = shooterElem.getBoundingClientRect();
    
    // Calculate center of shooter
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle between center and mouse position
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    // Calculate angle in degrees (0 is straight up)
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    
    // Limit the angle between -85 and 85 degrees
    angle = Math.max(-85, Math.min(85, angle));
    
    onAngleChange(angle);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const shooterElem = e.currentTarget;
    const rect = shooterElem.getBoundingClientRect();
    
    // Calculate center of shooter
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle between center and touch position
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    
    // Calculate angle in degrees (0 is straight up)
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    
    // Limit the angle between -85 and 85 degrees
    angle = Math.max(-85, Math.min(85, angle));
    
    onAngleChange(angle);
  };
  
  return (
    <div className="shooter-container flex flex-col items-center">
      <div 
        className="relative bottom-0 left-1/2 transform -translate-x-1/2"
        style={{ height: '150px', width: '150px' }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Shooter base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-800 rounded-full" />
        
        {/* Shooter arm */}
        <div 
          className="absolute bottom-8 left-1/2 h-20 w-2 bg-gray-700 origin-bottom transform -translate-x-1/2"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        >
          {/* Active bubble */}
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bubble bubble-${color}`}
            style={{ width: BUBBLE_SIZE, height: BUBBLE_SIZE, borderRadius: '50%' }}
          />
        </div>
        
        {/* Next bubble preview */}
        <div className="absolute bottom-0 right-0 transform translate-x-16">
          <div className="text-white text-xs mb-1">Next:</div>
          <div 
            className={`bubble bubble-${nextBubble}`}
            style={{ width: BUBBLE_SIZE * 0.7, height: BUBBLE_SIZE * 0.7, borderRadius: '50%' }}
          />
        </div>
      </div>
      
      {/* Shot button */}
      <Button 
        onClick={onShoot}
        className="shot-button mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition-transform active:scale-95 animate-pulse"
      >
        SHOT
      </Button>
    </div>
  );
};

export default Shooter;
