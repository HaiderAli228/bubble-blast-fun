
import React from 'react';
import { Bubble as BubbleType } from '../types/game';
import { BUBBLE_SIZE, getPositionFromCoords } from '../utils/gameUtils';

interface BubbleProps {
  bubble: BubbleType;
  onClick?: () => void;
}

const Bubble: React.FC<BubbleProps> = ({ bubble, onClick }) => {
  const { color, row, col, isPopping } = bubble;
  const { x, y } = getPositionFromCoords(row, col);
  
  return (
    <div
      className={`absolute bubble bubble-${color} ${isPopping ? 'popping' : ''}`}
      style={{
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: '50%',
        left: x,
        top: y,
        zIndex: isPopping ? 10 : 1,
      }}
      onClick={onClick}
    />
  );
};

export default Bubble;
