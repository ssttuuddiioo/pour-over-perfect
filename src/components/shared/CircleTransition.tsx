import React from 'react';
import { useCircleTransition } from '../../context/CircleTransitionContext';

interface CircleTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

const CircleTransition: React.FC<CircleTransitionProps> = ({ children, className = '' }) => {
  const { circleRef, circleState, navigateWithTransition } = useCircleTransition();

  return (
    <>
      {/* Fixed circle that transitions between states */}
      <div
        ref={circleRef}
        className={`fixed bg-[#FF6700] rounded-full flex items-center justify-center z-10 ${className}`}
        style={{
          pointerEvents: circleState.isTransitioning ? 'none' : 'auto'
        }}
      >
        {/* Circle content can vary based on mode */}
        {circleState.mode === 'front' && (
          <div className="text-white text-center">
            {children}
          </div>
        )}
        {circleState.mode === 'timer' && (
          <div 
            onClick={() => navigateWithTransition('/')}
            className="text-white text-center cursor-pointer hover:text-orange-200 transition-colors"
          >
            <div className="text-4xl mb-2">⏱</div>
            <div className="text-sm font-medium">Timer</div>
          </div>
        )}
      </div>
    </>
  );
};

export default CircleTransition; 