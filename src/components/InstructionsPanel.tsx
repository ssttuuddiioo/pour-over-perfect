import React, { useEffect, useRef } from 'react';
import { RecipeStep } from '../types/brewing';

interface InstructionsPanelProps {
  steps: RecipeStep[];
  currentStep: number;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ steps, currentStep }) => {
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active step
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentStep]);

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg p-6 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">Instructions</h2>
        <p className="text-sm text-gray-600 mt-1">Follow each step as the timer progresses</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div
              key={index}
              ref={isActive ? activeStepRef : null}
              className={`
                p-4 rounded-lg border-l-4 transition-all duration-300
                ${isActive ? 'border-orange-500 bg-orange-50' : ''}
                ${isCompleted ? 'border-gray-300 bg-white opacity-50' : ''}
                ${isUpcoming ? 'border-gray-200 bg-white' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`
                    text-xs font-bold uppercase tracking-wide
                    ${isActive ? 'text-orange-600' : ''}
                    ${isCompleted ? 'text-gray-400' : ''}
                    ${isUpcoming ? 'text-gray-500' : ''}
                  `}>
                    Step {index + 1}
                  </span>
                  <span className={`
                    text-sm font-semibold
                    ${isActive ? 'text-black' : ''}
                    ${isCompleted ? 'text-gray-400' : ''}
                    ${isUpcoming ? 'text-gray-700' : ''}
                  `}>
                    {step.label}
                  </span>
                </div>
                
                <div className="flex flex-col items-end text-xs">
                  {step.waterTarget && (
                    <span className={`
                      font-medium
                      ${isActive ? 'text-orange-600' : ''}
                      ${isCompleted ? 'text-gray-400' : ''}
                      ${isUpcoming ? 'text-gray-500' : ''}
                    `}>
                      {step.waterTarget}g
                    </span>
                  )}
                  <span className={`
                    ${isActive ? 'text-gray-600' : ''}
                    ${isCompleted ? 'text-gray-400' : ''}
                    ${isUpcoming ? 'text-gray-500' : ''}
                  `}>
                    {step.duration}s
                  </span>
                </div>
              </div>

              <p className={`
                text-sm leading-relaxed
                ${isActive ? 'text-black font-medium' : ''}
                ${isCompleted ? 'text-gray-400' : ''}
                ${isUpcoming ? 'text-gray-600' : ''}
              `}>
                {step.instructions}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstructionsPanel;

