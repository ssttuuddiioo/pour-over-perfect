import React from 'react';

interface ProgressCircleProps {
  progress: number;
  phase?: string;
  children?: React.ReactNode;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ progress, phase, children }) => {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getPhaseColor = () => {
    if (phase === 'complete') return 'rgb(var(--color-gray-400))';
    return 'rgb(var(--color-gray-100))';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg 
        width={size} 
        height={size} 
        style={{ transform: 'rotate(-90deg)' }}
        className="absolute"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--color-gray-800))"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <svg 
        width={size} 
        height={size} 
        style={{ transform: 'rotate(-90deg)' }}
        className="absolute"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getPhaseColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-linear"
        />
      </svg>

      {/* Center content (timer, etc.) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressCircle;