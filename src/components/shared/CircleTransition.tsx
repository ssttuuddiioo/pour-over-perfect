import React from 'react';
import { useCircleTransition } from '../../context/CircleTransitionContext';

interface CircleTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

const CircleTransition: React.FC<CircleTransitionProps> = ({ className = '' }) => {
  const { circleRef } = useCircleTransition();

  return (
    <div
      ref={circleRef}
      className={`fixed bg-[#FF6700] rounded-full ${className}`}
      style={{
        pointerEvents: 'none',
        zIndex: 1,
        position: 'fixed',
        left: 0,
        top: 0,
        opacity: 0,
        transformOrigin: 'center center',
        margin: 0,
        padding: 0,
      }}
    />
  );
};

export default CircleTransition; 