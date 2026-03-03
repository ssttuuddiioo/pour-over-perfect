import { useState, useRef, useEffect, useCallback } from 'react';
import { calculateBrewTiming } from '../utils/brewingCalculations';
import { CoffeeSettings } from '../types/brewing';

export interface StepInfo {
  label: string;
  water: string;
  duration: number;
}

interface UseBrewTimerProps {
  coffeeSettings: CoffeeSettings;
  grindSize: number;
  onStepComplete?: (stepIndex: number, step: StepInfo) => void;
}

interface UseBrewTimerReturn {
  // State
  elapsed: number;
  currentStep: number;
  isRunning: boolean;
  isFinished: boolean;
  showBrewTimer: boolean;
  
  // Computed values
  stepSequence: StepInfo[];
  stepEndTimes: number[];
  totalTime: number;
  brewingTimings: ReturnType<typeof calculateBrewTiming>;
  
  // Actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  done: () => void;
}

const SOFT_CHIME_URL = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b6b2.mp3';

export function useBrewTimer({ 
  coffeeSettings, 
  grindSize, 
  onStepComplete 
}: UseBrewTimerProps): UseBrewTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showBrewTimer, setShowBrewTimer] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStep = useRef(0);

  // Calculate brewing timings based on settings
  const brewingTimings = calculateBrewTiming(
    grindSize,
    coffeeSettings.amount,
    coffeeSettings.ratio,
    coffeeSettings.bloomRatio
  );

  // Build step sequence
  const stepSequence: StepInfo[] = [
    { label: 'Bloom', water: `Pour to ${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
    { label: 'First Pour', water: `Pour to ${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
    { label: 'Rest', water: 'Let it steep', duration: brewingTimings.restDuration },
    { label: 'Second Pour', water: `Pour to ${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
    { label: 'Rest', water: 'Let it steep', duration: brewingTimings.secondRestDuration },
    { label: 'Third Pour', water: `Pour to ${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
    { label: 'Drawdown', water: 'Let coffee drip', duration: brewingTimings.drawdownDuration },
    { label: 'Finish', water: 'Enjoy your coffee!', duration: 0 }
  ];

  // Calculate cumulative end times for each step
  const stepEndTimes = stepSequence.reduce((acc, step, i) => {
    acc.push((acc[i - 1] || 0) + step.duration);
    return acc;
  }, [] as number[]);

  const totalTime = stepEndTimes[stepEndTimes.length - 1] || 0;
  const isFinished = elapsed >= totalTime;

  // Play audio and haptic feedback
  const playFeedback = useCallback(() => {
    try {
      const audio = new Audio(SOFT_CHIME_URL);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      // Silent fail for audio
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 0.1;
          const newCurrentStep = stepEndTimes.findIndex(endTime => newElapsed < endTime);
          const actualNewStep = newCurrentStep === -1 ? stepSequence.length - 1 : newCurrentStep;

          // Check for step change
          if (actualNewStep !== previousStep.current) {
            const completedStepIndex = actualNewStep - 1;
            const completedStep = stepSequence[completedStepIndex];
            
            // Play feedback for pour steps
            const isPourStep = completedStep && (
              completedStep.label.includes('Pour') || 
              completedStep.label.includes('Bloom')
            );
            
            if (isPourStep && completedStepIndex >= 0) {
              playFeedback();
              onStepComplete?.(completedStepIndex, completedStep);
            }
            
            previousStep.current = actualNewStep;
          }

          setCurrentStep(actualNewStep);

          if (newElapsed >= totalTime) {
            setIsRunning(false);
            return totalTime;
          }

          return newElapsed;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isFinished, totalTime, stepEndTimes, stepSequence, playFeedback, onStepComplete]);

  // Actions
  const start = useCallback(() => {
    setElapsed(0);
    setCurrentStep(0);
    previousStep.current = 0;
    setIsRunning(true);
    setShowBrewTimer(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentStep(0);
    previousStep.current = 0;
  }, []);

  const done = useCallback(() => {
    setShowBrewTimer(false);
    setIsRunning(false);
    setElapsed(0);
    setCurrentStep(0);
    previousStep.current = 0;
  }, []);

  return {
    // State
    elapsed,
    currentStep,
    isRunning,
    isFinished,
    showBrewTimer,
    
    // Computed values
    stepSequence,
    stepEndTimes,
    totalTime,
    brewingTimings,
    
    // Actions
    start,
    pause,
    resume,
    reset,
    done
  };
}

export default useBrewTimer;


