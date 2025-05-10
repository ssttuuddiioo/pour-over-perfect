import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Check } from 'lucide-react';
import ProgressCircle from './ProgressCircle';
import { BrewingPhase, CoffeeSettings } from '../types/brewing';
import { BrewingTimings } from '../utils/brewingCalculations';

interface BrewingTimerProps {
  brewingTimings: BrewingTimings;
  currentPhase: BrewingPhase | null;
  onPhaseChange: (phase: BrewingPhase | null) => void;
  onStop: () => void;
  coffeeSettings: CoffeeSettings;
}

const BrewingTimer: React.FC<BrewingTimerProps> = ({ 
  brewingTimings, 
  currentPhase, 
  onPhaseChange, 
  onStop,
  coffeeSettings
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2870/2870.wav');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const getCurrentPhaseDuration = (): number => {
    switch (currentPhase) {
      case 'bloom': return brewingTimings.bloomDuration;
      case 'firstPour': return brewingTimings.firstPourDuration;
      case 'rest': return brewingTimings.restDuration;
      case 'secondPour': return brewingTimings.secondPourDuration;
      case 'secondRest': return brewingTimings.secondRestDuration;
      case 'thirdPour': return brewingTimings.thirdPourDuration;
      case 'drawdown': return brewingTimings.drawdownDuration;
      default: return 0;
    }
  };

  const getCurrentPhaseTarget = (): number => {
    switch (currentPhase) {
      case 'bloom': return brewingTimings.bloomWater;
      case 'firstPour': return brewingTimings.firstPourTarget;
      case 'secondPour': return brewingTimings.secondPourTarget;
      case 'thirdPour': return brewingTimings.thirdPourTarget;
      default: return 0;
    }
  };

  useEffect(() => {
    if (currentPhase && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
        setPhaseSeconds(prev => prev + 1);
        
        if (phaseSeconds >= getCurrentPhaseDuration() - 1) {
          playSound();

          switch (currentPhase) {
            case 'bloom':
              onPhaseChange('firstPour');
              break;
            case 'firstPour':
              onPhaseChange('rest');
              break;
            case 'rest':
              onPhaseChange('secondPour');
              break;
            case 'secondPour':
              onPhaseChange('secondRest');
              break;
            case 'secondRest':
              onPhaseChange('thirdPour');
              break;
            case 'thirdPour':
              onPhaseChange('drawdown');
              break;
            case 'drawdown':
              onPhaseChange(null);
              clearInterval(timerRef.current!);
              break;
          }
          setPhaseSeconds(0);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentPhase, isPaused, phaseSeconds, brewingTimings, onPhaseChange]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onStop();
  };

  const getPhaseInstructions = (): string => {
    switch (currentPhase) {
      case 'bloom':
        return `Pour ${brewingTimings.bloomWater}ml, saturating all grounds`;
      case 'firstPour':
        return `Pour to ${brewingTimings.firstPourTarget}ml total`;
      case 'rest':
        return "Let coffee drain completely";
      case 'secondPour':
        return `Pour to ${brewingTimings.secondPourTarget}ml total`;
      case 'secondRest':
        return "Let coffee drain again";
      case 'thirdPour':
        return `Pour remaining to ${brewingTimings.thirdPourTarget}ml total`;
      case 'drawdown':
        return "Final drawdown, wait for remaining water to filter";
      default:
        return "Brewing complete!";
    }
  };

  const getPhaseDisplayName = (): string => {
    switch (currentPhase) {
      case 'bloom': return "Bloom";
      case 'firstPour': return "First Pour";
      case 'rest': return "First Rest";
      case 'secondPour': return "Second Pour";
      case 'secondRest': return "Second Rest";
      case 'thirdPour': return "Third Pour";
      case 'drawdown': return "Drawdown";
      default: return "Complete";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <h3 className="text-lg mb-4">{getPhaseDisplayName()}</h3>
        <ProgressCircle 
          progress={(phaseSeconds / getCurrentPhaseDuration()) * 100}
          phase={currentPhase || 'complete'}
        />
      </div>
      
      <div className="flex justify-between text-sm">
        <div>
          <div className="text-gray-400">Phase</div>
          <div>{phaseSeconds}s / {getCurrentPhaseDuration()}s</div>
        </div>
        <div>
          <div className="text-gray-400">Total</div>
          <div>{seconds}s / {brewingTimings.totalTime}s</div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-300">{getPhaseInstructions()}</p>
      </div>
      
      <div className="flex gap-3">
        <button 
          className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
          onClick={togglePause}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        {currentPhase === 'drawdown' ? (
          <button 
            className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            onClick={() => onPhaseChange(null)}
          >
            <Check size={18} />
            Done
          </button>
        ) : (
          <button 
            className="flex-1 btn bg-gray-100 text-gray-900 hover:bg-gray-200 flex items-center justify-center gap-2"
            onClick={handleStop}
          >
            <StopCircle size={18} />
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default BrewingTimer;