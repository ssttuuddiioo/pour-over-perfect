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
  const [lastPhase, setLastPhase] = useState<BrewingPhase | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const softAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2870/2870.wav');
    softAudioRef.current = new Audio('https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b6b2.mp3'); // Example soft chime
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (softAudioRef.current) softAudioRef.current.pause();
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };
  const playSoftSound = () => {
    if (softAudioRef.current) {
      softAudioRef.current.currentTime = 0;
      softAudioRef.current.play().catch(e => console.error("Error playing soft sound:", e));
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

  // requestAnimationFrame timer logic
  useEffect(() => {
    let raf: number;
    let lastFrame: number | null = null;
    if (currentPhase && !isPaused) {
      if (!startTimeRef.current) startTimeRef.current = performance.now() - seconds * 1000;
      if (!phaseStartTimeRef.current) phaseStartTimeRef.current = performance.now() - phaseSeconds * 1000;
      const tick = (now: number) => {
        if (!lastFrame) lastFrame = now;
        const elapsed = now - startTimeRef.current!;
        const phaseElapsed = now - phaseStartTimeRef.current!;
        setSeconds(Math.floor(elapsed / 1000));
        setPhaseSeconds(Math.floor(phaseElapsed / 1000));
        if (phaseElapsed >= getCurrentPhaseDuration() * 1000) {
          // Play chime depending on next phase
          let nextPhase: BrewingPhase | null = null;
          switch (currentPhase) {
            case 'bloom': nextPhase = 'firstPour'; break;
            case 'firstPour': nextPhase = 'rest'; break;
            case 'rest': nextPhase = 'secondPour'; break;
            case 'secondPour': nextPhase = 'secondRest'; break;
            case 'secondRest': nextPhase = 'thirdPour'; break;
            case 'thirdPour': nextPhase = 'drawdown'; break;
            case 'drawdown': nextPhase = null; break;
          }
          if (nextPhase === 'rest' || nextPhase === 'secondRest') {
            playSoftSound();
          } else {
            playSound();
          }
          setLastPhase(currentPhase);
          setPhaseSeconds(0);
          phaseStartTimeRef.current = now;
          onPhaseChange(nextPhase);
          if (!nextPhase) {
            startTimeRef.current = null;
            phaseStartTimeRef.current = null;
            return;
          }
        } else {
          raf = requestAnimationFrame(tick);
        }
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      startTimeRef.current = null;
      phaseStartTimeRef.current = null;
    };
  }, [currentPhase, isPaused, brewingTimings, onPhaseChange]);

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