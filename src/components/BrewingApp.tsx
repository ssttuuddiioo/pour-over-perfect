import React, { useState, useRef, useEffect } from 'react';
// import GrindSelector from './GrindSelector'; // Assuming this is not used or will be re-evaluated
import { Notes } from './Notes';
import { CoffeeSettings } from '../types/brewing'; // BrewingPhase might not be needed
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';
import { ClipboardList, Info, Settings as SettingsIcon, X, Coffee, Sliders, SlidersHorizontal, Pencil } from 'lucide-react';
import ProPours from './ProPours';
// FlavorEQ import removed

const defaultCoffeeOptions = [15, 30];
const defaultRatioOptions = [15, 18];

const chimeUrl = 'https://assets.mixkit.co/active_storage/sfx/2870/2870.wav';
const softChimeUrl = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b6b2.mp3';

function InfoPage({ onBack }: { onBack: () => void }) {
  useEffect(() => {
    if (window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.draw('origen', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Tip Me',
        'floating-chat.donateButton.background-color': '#323842',
        'floating-chat.donateButton.text-color': '#fff'
      });
    }
  }, []);
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">About Pour Perfect</h2>
          <button onClick={onBack} className="btn btn-secondary">Back</button>
        </div>
        <div className="space-y-6 text-left">
          <div>
            <h3 className="text-lg font-semibold mb-1">Brew with Precision</h3>
            <p className="text-sm mb-3">Select your coffee and ratio. Adjust grind. Follow a dynamic timer tuned to your exact settings.</p>

            <h3 className="text-lg font-semibold mb-1">Capture the Cup</h3>
            <p className="text-sm mb-3">Save notes with one tap. Log what you brewed, how it tasted, and what you'd tweak.</p>

            <h3 className="text-lg font-semibold mb-1">Make It Yours</h3>
            <p className="text-sm mb-3">Customize the brew options to match your gear and habits. It remembers your preferences.</p>

            <h3 className="text-lg font-semibold mb-1">Always Ready</h3>
            <p className="text-sm mb-3">Works offline, on any device. Looks and feels like a native app. No login needed.</p>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-1">Why I made this</h3>
            <p className="text-sm mb-3">I wanted a simple, beautiful way to track and improve my home coffee brewing—without logins, ads, or distractions. I hope it helps you enjoy your coffee ritual even more!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({
  onBack,
  settingsDraft,
  setSettingsDraft,
  handleSettingsSave,
  closeSettings
}: {
  onBack: () => void,
  settingsDraft: any,
  setSettingsDraft: any,
  handleSettingsSave: (e: React.FormEvent) => void,
  closeSettings: () => void
}) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onBack} className="btn btn-secondary">Back</button>
        </div>
        <form onSubmit={handleSettingsSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Coffee options</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {settingsDraft.coffeeOptions.slice(0, 2).map((val: number, idx: number) => (
                <div key={idx} className="relative flex items-center">
                  <button
                    type="button"
                    className="absolute left-2 text-gray-400 hover:text-white"
                    onClick={() => setSettingsDraft((d: any) => ({
                      ...d,
                      coffeeOptions: d.coffeeOptions.map((x: number, i: number) => 
                        i === idx ? Math.max(10, parseFloat((x - 0.1).toFixed(1))) : x
                      )
                    }))}
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    min="10"
                    max="40"
                    step="0.1"
                    value={val}
                    onChange={(e) => setSettingsDraft((d: any) => ({
                      ...d,
                      coffeeOptions: d.coffeeOptions.map((x: number, i: number) => 
                        i === idx ? parseFloat(e.target.value) || x : x
                      )
                    }))}
                    className="w-full px-8 py-2 bg-gray-800 text-white rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="button"
                    className="absolute right-2 text-gray-400 hover:text-white"
                    onClick={() => setSettingsDraft((d: any) => ({
                      ...d,
                      coffeeOptions: d.coffeeOptions.map((x: number, i: number) => 
                        i === idx ? Math.min(40, parseFloat((x + 0.1).toFixed(1))) : x
                      )
                    }))}
                  >
                    +
                  </button>
                  <span className="absolute right-8 text-gray-400">g</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Ratio options</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {settingsDraft.ratioOptions.slice(0, 2).map((val: number, idx: number) => (
                <div key={idx} className="relative flex items-center">
                  <button
                    type="button"
                    className="absolute left-2 text-gray-400 hover:text-white"
                    onClick={() => setSettingsDraft((d: any) => ({
                      ...d,
                      ratioOptions: d.ratioOptions.map((x: number, i: number) => 
                        i === idx ? Math.max(14, parseFloat((x - 0.1).toFixed(1))) : x
                      )
                    }))}
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    min="14"
                    max="20"
                    step="0.1"
                    value={val}
                    onChange={(e) => setSettingsDraft((d: any) => ({
                      ...d,
                      ratioOptions: d.ratioOptions.map((x: number, i: number) => 
                        i === idx ? parseFloat(e.target.value) || x : x
                      )
                    }))}
                    className="w-full px-8 py-2 bg-gray-800 text-white rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="button"
                    className="absolute right-2 text-gray-400 hover:text-white"
                    onClick={() => setSettingsDraft((d: any) => ({
                      ...d,
                      ratioOptions: d.ratioOptions.map((x: number, i: number) => 
                        i === idx ? Math.min(20, parseFloat((x + 0.1).toFixed(1))) : x
                      )
                    }))}
                  >
                    +
                  </button>
                  <span className="absolute right-8 text-gray-400">1:</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Save
            </button>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={closeSettings}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CircularProgressBar({ 
  value, 
  max, 
  children, 
  radius = 60,
  stroke = 8,
  color = "#fff"
}: { 
  value: number, 
  max: number, 
  children?: React.ReactNode,
  radius?: number, 
  stroke?: number,
  color?: string 
}) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference * (1 - progress);
  return (
    <svg width={radius * 2} height={radius * 2} className="block mx-auto">
      <circle
        stroke="#2d3748"
        fill="none"
        strokeWidth={stroke}
        cx={radius}
        cy={radius}
        r={normalizedRadius}
      />
      <circle
        stroke={color}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease-out' }}
        cx={radius}
        cy={radius}
        r={normalizedRadius}
      />
      <foreignObject x={stroke} y={stroke} width={(radius - stroke) * 2} height={(radius - stroke) * 2}>
        <div className="flex flex-col items-center justify-center h-full w-full">
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}

function BrewTimerPage({
  elapsed,
  getStepInstruction,
  fullStepSequence,
  fullCurrentStep,
  fullStepEndTimes,
  handlePause,
  handleResume,
  handleReset,
  timerActive,
  timerPaused,
  finished,
  formatTime,
  onBack
}: any) {
  const totalTime = fullStepEndTimes[fullStepEndTimes.length - 1] || 1;
  const timeRemaining = Math.max(0, totalTime - elapsed);
  
  // Calculate current step progress
  const currentStepStartTime = fullCurrentStep === 0 ? 0 : fullStepEndTimes[fullCurrentStep - 1];
  const currentStepEndTime = fullStepEndTimes[fullCurrentStep] || totalTime;
  const currentStepDuration = currentStepEndTime - currentStepStartTime;
  const currentStepElapsed = Math.max(0, elapsed - currentStepStartTime);
  const currentStepRemaining = Math.max(0, currentStepDuration - currentStepElapsed);
  const currentStepProgress = currentStepDuration > 0 ? (currentStepElapsed / currentStepDuration) * 100 : 0;

  // Helper function to format time as "23s"
  const formatTimeSimple = (seconds: number) => {
    return `${Math.round(seconds)}s`;
  };

  // Helper function to extract target weight
  const extractTargetWeight = (waterText: string) => {
    if (waterText && waterText.includes('Pour to')) {
      return waterText.replace('Pour to ', '');
    }
    // Return empty for Wait and Drawdown steps
    return '';
  };

  return (
    <div className="text-white min-h-screen flex flex-col" style={{ backgroundColor: '#000000', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className="container mx-auto px-6 py-6 max-w-sm flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8">
          <button 
            onClick={onBack} 
            className="text-gray-400 hover:text-white text-lg font-medium"
            aria-label="Back"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Back
          </button>
        </header>

        {/* Large Timer Display */}
        <div className="text-center mb-12">
          <div className="text-4xl font-medium text-white font-roboto-mono tracking-tight">
            {formatTime(Math.ceil(timeRemaining))}
          </div>
        </div>

        {/* Vertical Step List */}
        <div className="flex-1 space-y-4">
          {fullStepSequence.slice(0, -1).map((step: any, index: number) => {
            const isActive = index === fullCurrentStep;
            const isCompleted = elapsed >= (fullStepEndTimes[index] || 0);
            const isFuture = index > fullCurrentStep;
            
            const stepStart = index === 0 ? 0 : fullStepEndTimes[index - 1];
            const stepEnd = fullStepEndTimes[index] || 0;
            const stepDuration = Math.max(0, stepEnd - stepStart);
            const stepElapsed = Math.max(0, elapsed - stepStart);
            const stepRemaining = Math.max(0, stepDuration - stepElapsed);
            const stepProgress = stepDuration > 0 ? Math.min((stepElapsed / stepDuration) * 100, 100) : 0;

            // Determine opacity based on state
            let opacity = 'opacity-40'; // Future steps
            if (isCompleted) opacity = 'opacity-60'; // Past steps
            if (isActive) opacity = 'opacity-100'; // Current step

            const targetWeight = extractTargetWeight(step.water);

            return (
              <div key={index} className={`${opacity} transition-opacity duration-300`}>
                {/* 3-Column Grid Layout */}
                <div className="grid grid-cols-3 text-center items-center py-3 relative">
                  {/* Left: Step name */}
                  <div className="text-left">
                    <span className="text-lg font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {step.label}
                    </span>
                  </div>

                  {/* Center: Target weight */}
                  <div>
                    <span className="text-lg font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {targetWeight}
                    </span>
                  </div>

                  {/* Right: Time - Show step countdown for active step, full duration for others */}
                  <div className="text-right">
                    <span className="text-lg font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {isActive && timerActive && !isCompleted ? 
                        formatTimeSimple(Math.ceil(stepRemaining)) : 
                        formatTimeSimple(stepDuration)
                      }
                    </span>
                  </div>

                  {/* Progress Line - Custom dotted styling */}
                  <div className="absolute bottom-0 left-0 w-full h-px">
                    {/* Base line - custom dotted for incomplete/current, solid for completed */}
                    {isCompleted ? (
                      <div className="w-full h-px bg-white" />
                    ) : (
                      <div 
                        className="w-full h-px"
                        style={{
                          backgroundImage: `radial-gradient(circle, #9CA3AF 1px, transparent 1px)`,
                          backgroundSize: '8px 1px',
                          backgroundRepeat: 'repeat-x'
                        }}
                      />
                    )}
                    
                    {/* Progress overlay for current step only */}
                    {isActive && !isCompleted && (
                      <div 
                        className={`absolute top-0 h-px bg-white transition-all duration-100 ease-out ${
                          step.label === 'Wait' || step.label === 'Drawdown' 
                            ? 'right-0' 
                            : 'left-0'
                        }`}
                        style={{ width: `${stepProgress}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Button */}
        <footer className="mt-12 pb-6">
          <button 
            className="w-full py-4 text-xl font-medium text-white transition-colors duration-150 hover:text-gray-300"
            onClick={timerActive && !timerPaused ? handlePause : handleResume}
            disabled={finished}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {timerActive && !timerPaused ? 'Pause' : 'Start'}
          </button>
        </footer>
      </div>
    </div>
  );
}

// FrenchPressTimerPage component removed

const BrewingApp: React.FC<{ onShowAbout?: () => void }> = ({ onShowAbout }) => {
  const [grindSize, setGrindSize] = useState<number>(6);
  const [coffeeOptions, setCoffeeOptions] = useState<number[]>(() => {
    const saved = localStorage.getItem('coffeeOptions');
    return saved ? JSON.parse(saved) : defaultCoffeeOptions;
  });
  const [ratioOptions, setRatioOptions] = useState<number[]>(() => {
    const saved = localStorage.getItem('ratioOptions');
    return saved ? JSON.parse(saved) : defaultRatioOptions;
  });
  const [coffeeSettings, setCoffeeSettings] = useState<CoffeeSettings>(() => {
    const saved = localStorage.getItem('coffeeSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, bloomRatio: parsed.bloomRatio || 2 }; 
    }
    return { amount: 15, ratio: 15, bloomRatio: 2 };
  });

  const [showNotes, setShowNotes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showProPours, setShowProPours] = useState(false);
  const [showBrewTimer, setShowBrewTimer] = useState(false);

  const [settingsDraft, setSettingsDraft] = useState({
    amount: coffeeSettings.amount,
    ratio: coffeeSettings.ratio,
    coffeeOptions: [...coffeeOptions],
    ratioOptions: [...ratioOptions],
  });
  const settingsRef = useRef<HTMLDivElement>(null);
  
  // Simplified timer state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const brewingTimings = calculateBrewTiming(
    grindSize, 
    coffeeSettings.amount, 
    coffeeSettings.ratio, 
    coffeeSettings.bloomRatio,
    50, // Default acidity for calculation (no EQ)
    50  // Default fruitiness for calculation (no EQ)
  );

  // Calculate step sequence
  const stepSequence = [
    { label: 'Bloom', water: `Pour to ${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
    { label: 'First Pour', water: `Pour to ${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
    { label: 'Wait', water: 'Let it steep', duration: brewingTimings.restDuration },
    { label: 'Second Pour', water: `Pour to ${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
    { label: 'Wait', water: 'Let it steep', duration: brewingTimings.secondRestDuration },
    { label: 'Final Pour', water: `Pour to ${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
    { label: 'Drawdown', water: 'Let coffee drip', duration: brewingTimings.drawdownDuration },
    { label: 'Finish', water: 'Enjoy your coffee!', duration: 0 }
  ];

  // Calculate step end times
  const stepEndTimes = stepSequence.reduce((acc, step, i) => {
    acc.push((acc[i - 1] || 0) + step.duration);
    return acc;
  }, [] as number[]);

  const totalTime = stepEndTimes[stepEndTimes.length - 1] || 0;
  const isFinished = elapsed >= totalTime;

  // Simple timer effect
  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 0.1;
          
          // Update current step and play chime on pour completion
          const newCurrentStep = stepEndTimes.findIndex(endTime => newElapsed < endTime);
          const actualNewStep = newCurrentStep === -1 ? stepSequence.length - 1 : newCurrentStep;
          
          // Play chime when a pour step is completed (not when moving to next step)
          if (actualNewStep !== currentStep) {
            const completedStepIndex = actualNewStep - 1;
            const completedStep = stepSequence[completedStepIndex];
            
            // Check if the completed step was a pour step
            const isPourStep = completedStep && (
              completedStep.label === 'Bloom' || 
              completedStep.label === 'First Pour' || 
              completedStep.label === 'Second Pour' || 
              completedStep.label === 'Final Pour' ||
              completedStep.label === 'Pour'
            );
            
            if (isPourStep && completedStepIndex >= 0) {
              // Play soft chime sound for pour completion
              try {
                const audio = new Audio(softChimeUrl);
                audio.volume = 0.3;
                audio.play().catch(() => {}); // Fail silently if audio can't play
              } catch (error) {
                // Fail silently
              }
              
              // Trigger haptic feedback if available
              if ('vibrate' in navigator) {
                navigator.vibrate(100);
              }
            }
          }
          
          setCurrentStep(actualNewStep);
          
          // Stop if finished
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
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isFinished, totalTime, stepEndTimes.length, stepSequence.length, currentStep]);

  const handleStart = () => {
    // Reset and show timer
    setElapsed(0);
    setCurrentStep(0);
    setIsRunning(false);
    setShowBrewTimer(true);
  };

  const handleTimerStart = () => {
    setIsRunning(true);
  };

  const handleTimerPause = () => {
    setIsRunning(false);
  };

  const handleTimerReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentStep(0);
  };

  const handleBack = () => {
    setShowBrewTimer(false);
    handleTimerReset();
  };

  const getStepInstruction = () => {
    if (isFinished) return 'Finished! Enjoy your coffee ☕';
    if (!showBrewTimer || !stepSequence[currentStep]) return `Total brew time: ${formatTime(brewingTimings.totalTime)}`;
    
    const step = stepSequence[currentStep];
    if (step.label === 'Finish') {
      return `Done! Total time: ${formatTime(totalTime)}`;
    }
    if (step.water) {
      return step.water;
    }
    return step.label;
  };

  useEffect(() => {
    if (showSettings && settingsRef.current) {
      const firstInput = settingsRef.current.querySelector('input');
      if (firstInput) (firstInput as HTMLInputElement).focus();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowSettings(false);
    }
    if (showSettings) {
      window.addEventListener('keydown', handleKey);
    } else {
      window.removeEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSettings]);
  
  const handleCoffeeAmountChange = (amount: number) => {
    const newSettings = { ...coffeeSettings, amount, bloomRatio: coffeeSettings.bloomRatio || 2 };
    setCoffeeSettings(newSettings);
    localStorage.setItem('coffeeSettings', JSON.stringify(newSettings));
  };

  const handleRatioChange = (ratio: number) => {
    const newSettings = { ...coffeeSettings, ratio, bloomRatio: coffeeSettings.bloomRatio || 2 };
    setCoffeeSettings(newSettings);
    localStorage.setItem('coffeeSettings', JSON.stringify(newSettings));
  };

  const openSettings = () => {
    setSettingsDraft({
      amount: coffeeSettings.amount,
      ratio: coffeeSettings.ratio,
      coffeeOptions: [...coffeeOptions],
      ratioOptions: [...ratioOptions],
    });
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      settingsDraft.amount < 10 || settingsDraft.amount > 40 ||
      settingsDraft.ratio < 14 || settingsDraft.ratio > 20
    ) return;
    const newCoffeeSettings = { 
        amount: settingsDraft.amount, 
        ratio: settingsDraft.ratio, 
        bloomRatio: coffeeSettings.bloomRatio || 2 
    };
    setCoffeeSettings(newCoffeeSettings);
    setCoffeeOptions(settingsDraft.coffeeOptions);
    setRatioOptions(settingsDraft.ratioOptions);
    localStorage.setItem('coffeeSettings', JSON.stringify(newCoffeeSettings));
    localStorage.setItem('coffeeOptions', JSON.stringify(settingsDraft.coffeeOptions));
    localStorage.setItem('ratioOptions', JSON.stringify(settingsDraft.ratioOptions));
    setShowSettings(false);
  };

  useEffect(() => {
    if (!showSettings) return;
    function trapFocus(e: KeyboardEvent) {
      if (!settingsRef.current) return;
      const focusable = settingsRef.current.querySelectorAll('input,button');
      if (!focusable.length) return;
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    window.addEventListener('keydown', trapFocus);
    return () => window.removeEventListener('keydown', trapFocus);
  }, [showSettings]);

  if (showInfo) {
    return <InfoPage onBack={() => setShowInfo(false)} />;
  }

  if (showSettings) {
    return <SettingsPage onBack={closeSettings} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} handleSettingsSave={handleSettingsSave} closeSettings={closeSettings} />;
  }

  if (showNotes) {
    return (
      <div className="w-full max-w-sm">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Brewing Notes</h2>
            <button 
              onClick={() => setShowNotes(false)}
              className="btn btn-secondary"
            >
              Back
            </button>
          </div>
          <Notes 
            brewingSettings={{
            grindSize,
            coffeeAmount: coffeeSettings.amount,
            waterRatio: coffeeSettings.ratio,
            totalWater: brewingTimings.thirdPourTarget 
            }}
          />
        </div>
      </div>
    );
  }

  if (showProPours) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col pl-0">
              <span className="text-lg font-bold leading-tight">Tetsu Kasuya</span>
              <span className="text-sm font-normal leading-tight">4:6 Method</span>
            </div>
            <button onClick={() => setShowProPours(false)} className="btn btn-secondary">Back</button>
          </div>
          <ProPours />
        </div>
      </div>
    );
  }
  
  if (showBrewTimer) {
    // Only BrewTimerPage is shown now
    return (
      <BrewTimerPage
        elapsed={elapsed}
        getStepInstruction={getStepInstruction}
        fullStepSequence={stepSequence}
        fullCurrentStep={currentStep}
        fullStepEndTimes={stepEndTimes}
        handlePause={handleTimerPause}
        handleResume={handleTimerStart}
        handleReset={handleTimerReset}
        timerActive={isRunning}
        timerPaused={!isRunning}
        finished={isFinished}
        formatTime={formatTime}
        onBack={handleBack}
      />
    );
  }
  
  return (
    <div className="antialiased" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <div className="container mx-auto px-4 py-4 max-w-md">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Pour Perfect</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowNotes(true)}
              className="btn-secondary-outline flex items-center"
              aria-label="Notes"
            >
              Notes
            </button>
            <button
              onClick={openSettings}
              className="btn-secondary-outline p-2"
              type="button"
              aria-label="Edit"
            >
              <span className="material-icons-outlined">edit</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Coffee Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Coffee</h2>
            <div className="grid grid-cols-2 gap-2">
              {coffeeOptions.slice(0, 2).map(amount => (
                <div
                  key={amount}
                  className={`${
                    coffeeSettings.amount === amount ? 'selected-card' : 'unselected-card'
                  } cursor-pointer transition-colors`}
                  onClick={() => handleCoffeeAmountChange(amount)}
                >
                  <span className="text-lg font-semibold">{amount}g</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ratio Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Ratio</h2>
            <div className="grid grid-cols-2 gap-2">
              {ratioOptions.slice(0, 2).map(ratio => (
                <div
                  key={ratio}
                  className={`${
                    coffeeSettings.ratio === ratio ? 'selected-card' : 'unselected-card'
                  } cursor-pointer transition-colors`}
                  onClick={() => handleRatioChange(ratio)}
                >
                  <span className="text-lg font-semibold">1:{ratio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grind Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Grind</h2>
            <div className="grid grid-cols-4 gap-2">
              {['Fine', 'Medium', 'Medium-coarse', 'Coarse'].map((label, idx) => {
                const grindMap = [3, 6, 7, 9];
                return (
                  <button
                    key={label}
                    className={`${
                      grindSize === grindMap[idx] ? 'selected-card' : 'unselected-card'
                    } text-xs font-medium transition-colors`}
                    onClick={() => setGrindSize(grindMap[idx])}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brew Time and Total Water */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-1 text-center">Brew Time</h3>
              <div className="input-display">
                <p className="text-xl font-semibold text-white">
                  {formatTime(brewingTimings.totalTime)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {coffeeSettings.amount}g • 1:{coffeeSettings.ratio}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-1 text-center">Total Water</h3>
              <div className="input-display">
                <p className="text-xl font-semibold text-white">
                  {brewingTimings.thirdPourTarget}g
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round(brewingTimings.pourVolume)}g per pour
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8">
          <button 
            className="btn-primary" 
            onClick={handleStart}
          >
            Ready
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BrewingApp;

// Removed mapGrindStringToValue as it's not used after GrindSelector removal
// Ensure all imports are used or remove them.
// Review any remaining console.logs or commented out code for cleanup.