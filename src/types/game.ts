
export type BubbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Bubble {
  id: string;
  color: BubbleColor;
  row: number;
  col: number;
  isPopping?: boolean;
  isMoving?: boolean;
  velocity?: {
    x: number;
    y: number;
  };
}

export interface GameState {
  bubbles: Bubble[];
  activeBubble: {
    color: BubbleColor;
    angle: number;
  };
  nextBubble: BubbleColor;
  score: number;
  gameOver: boolean;
  level: number;
  highScore?: number;
}
