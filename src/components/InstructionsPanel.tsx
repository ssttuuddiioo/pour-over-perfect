import React, { useEffect, useRef } from 'react';

interface InstructionStep {
  label: string;
  duration: number;
  water?: string;
  type?: string;
  instructions?: string;
}

interface InstructionsPanelProps {
  steps: InstructionStep[];
  currentStep: number;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ steps, currentStep }) => {
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep active step visible
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentStep]);

  return (
    <div className="h-full bg-gray-50 rounded-lg p-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-black mb-6 sticky top-0 bg-gray-50 pb-2 border-b-2 border-black">
        Instructions
      </h2>
      
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div
              key={index}
              ref={isActive ? activeStepRef : null}
              className={`
                bg-white rounded-lg p-4 border-l-4 transition-all
                ${isActive ? 'border-orange-500 bg-orange-50 shadow-md' : ''}
                ${isCompleted ? 'border-gray-300 opacity-50' : ''}
                ${isUpcoming ? 'border-gray-200' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className={`
                  text-base
                  ${isActive ? 'font-bold text-black' : ''}
                  ${isCompleted ? 'font-normal text-gray-500' : ''}
                  ${isUpcoming ? 'font-normal text-gray-700' : ''}
                `}>
                  {index + 1}. {step.label}
                </h3>
                <span className={`
                  text-sm
                  ${isActive ? 'font-semibold text-orange-600' : ''}
                  ${isCompleted ? 'text-gray-400' : ''}
                  ${isUpcoming ? 'text-gray-500' : ''}
                `}>
                  {step.duration}s
                </span>
              </div>
              
              {step.instructions && (
                <p className={`
                  text-sm leading-relaxed
                  ${isActive ? 'text-black' : ''}
                  ${isCompleted ? 'text-gray-500' : ''}
                  ${isUpcoming ? 'text-gray-600' : ''}
                `}>
                  {step.instructions}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstructionsPanel;

