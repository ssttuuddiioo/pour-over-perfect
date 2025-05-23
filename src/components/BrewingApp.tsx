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
  const progress = Math.min(elapsed, totalTime);

  return (
    <div className="w-full max-w-sm mx-auto pt-8">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors" aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col items-center mb-4">
        <CircularProgressBar value={progress} max={totalTime}>
          <div className="flex flex-col items-center justify-center h-full w-full">
            <span className="text-2xl font-mono font-bold text-white">{formatTime(Math.ceil(totalTime - elapsed))}</span>
            <span className="text-xs text-gray-400 mt-1">remaining</span>
          </div>
        </CircularProgressBar>
        <div className="mt-2 text-center">
          <div className="text-base font-semibold text-white mb-1">{fullStepSequence[fullCurrentStep]?.label}</div>
          <div className="text-xs text-gray-400">{getStepInstruction()}</div>
        </div>
      </div>
      <ol className="mb-4 px-1 space-y-1.5">
        {fullStepSequence.map((s: any, i: number) => {
          const stepStart = i === 0 ? 0 : fullStepEndTimes[i - 1];
          const stepEnd = fullStepEndTimes[i] || 0;
          const stepDuration = Math.max(0, stepEnd - stepStart);
          const stepElapsed = Math.max(0, elapsed - stepStart);
          const currentStepProgress = stepDuration > 0 ? Math.min(stepElapsed / stepDuration, 1) : (elapsed >= stepEnd ? 1 : 0);
          const isCurrent = i === fullCurrentStep;
          const isCompleted = elapsed >= stepEnd;

          return (
            <li
              key={i}
              className={`flex items-center p-2 rounded-md text-sm font-normal ${
                isCurrent ? 'bg-gray-700 text-white' :
                (isCompleted ? 'bg-gray-800 opacity-70 text-gray-500' :
                               'text-gray-400 bg-gray-800')
              }`}
            >
              <div className="flex-shrink-0 mr-2">
                <CircularProgressBar 
                  value={currentStepProgress * 100} 
                  max={100} 
                  radius={18}
                  stroke={2.5}
                  color={isCurrent ? (s.label === 'Pour to' || s.label === 'Bloom to' ? '#38bdf8' : s.label === 'Wait' || s.label === 'Drawdown' ? '#f59e0b' : '#4b5563') : (isCompleted ? '#374151' : '#4b5563')} 
                >
                  <span className={`text-[10px] ${isCurrent ? 'text-white font-medium' : (isCompleted ? 'text-gray-600' : 'text-gray-400')}`}>{i + 1}</span>
                </CircularProgressBar>
              </div>
              <div className="flex-grow min-w-0 flex items-baseline overflow-hidden">
                <span className={`truncate ${isCurrent ? 'text-base font-medium' : 'text-sm'}`}>{s.label}</span>
                {s.water && <span className={`ml-1.5 text-xs flex-shrink-0 ${isCurrent ? 'text-sky-300' : (isCompleted ? 'text-gray-600' : 'text-gray-400')}`}>({s.water})</span>}
              </div>
              <span className={`text-xs font-mono ml-2 flex-shrink-0 ${isCurrent ? 'text-gray-200' : (isCompleted ? 'text-gray-600' : 'text-gray-400')}`}>{formatTime(stepDuration)}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex gap-2 mt-4">
        <button
          className={`btn flex-1 rounded-lg ${
            timerActive && !timerPaused ? "bg-gray-700 hover:bg-gray-600" : "bg-sky-500 hover:bg-sky-600"
          } text-white`}
          onClick={timerActive && !timerPaused ? handlePause : handleResume}
          disabled={finished}
        >
          {timerActive && !timerPaused ? "Pause" : "Start"}
        </button>
        <button
          className="btn flex-1 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          onClick={handleReset}
        >Restart</button>
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
    { label: 'Bloom to', water: `${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
    { label: 'Pour to', water: `${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
    { label: 'Wait', duration: brewingTimings.restDuration },
    { label: 'Pour to', water: `${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
    { label: 'Wait', duration: brewingTimings.secondRestDuration },
    { label: 'Pour to', water: `${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
    { label: 'Drawdown', duration: brewingTimings.drawdownDuration },
    { label: 'Total', duration: 0 }
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
          
          // Update current step
          const newCurrentStep = stepEndTimes.findIndex(endTime => newElapsed < endTime);
          setCurrentStep(newCurrentStep === -1 ? stepSequence.length - 1 : newCurrentStep);
          
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
  }, [isRunning, isFinished, totalTime, stepEndTimes.length, stepSequence.length]);

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
    if (step.label === 'Wait' || step.label === 'Drawdown') {
      return step.label;
    }
    if (step.label === 'Total') {
      return `Done! Total time: ${formatTime(totalTime)}`;
    }
    if (step.water) {
      return `${step.label} ${step.water}`;
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="w-full max-w-sm">
        <div className="card space-y-6">
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">Pour Perfect</h1>
              <div className="flex gap-2">
                {/* Button to access FlavorEQ could be removed here if it existed */}
                <button 
                  onClick={() => setShowNotes(true)}
                  className="btn btn-secondary px-3 py-1 text-sm"
                  aria-label="Notes"
                >
                  Notes
                </button>
                <button
                  onClick={openSettings}
                  className="btn btn-secondary p-2"
                  type="button"
                  aria-label="Edit"
                >
                  <Pencil size={20} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 mb-1">Coffee</span>
                <div className="flex gap-2">
                  {coffeeOptions.map(amount => ( // Using state coffeeOptions
                    <button
                      key={amount}
                      className={`w-1/2 aspect-square px-0 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        coffeeSettings.amount === amount 
                          ? 'bg-gray-700 text-white border border-white' 
                          : 'bg-gray-800 text-gray-300'
                      }`}
                      onClick={() => handleCoffeeAmountChange(amount)}
                    >
                      {amount}g
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 mb-1">Ratio</span>
                <div className="flex gap-2">
                  {ratioOptions.map(ratio => ( // Using state ratioOptions
                    <button
                      key={ratio}
                      className={`w-1/2 aspect-square px-0 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        coffeeSettings.ratio === ratio 
                          ? 'bg-gray-700 text-white border border-white' 
                          : 'bg-gray-800 text-gray-300'
                      }`}
                      onClick={() => handleRatioChange(ratio)}
                    >
                      1:{ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-300">Grind</span>
              </div>
              <div className="flex gap-2">
                {['Fine', 'Medium', 'Medium-coarse', 'Coarse'].map((label, idx) => {
                  const grindMap = [3, 6, 7, 9]; // Consider making this a constant
                  return (
                    <button
                      key={label}
                      className={`w-1/4 aspect-square px-0 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        grindSize === grindMap[idx] 
                          ? 'bg-gray-700 text-white border border-white' 
                          : 'bg-gray-800 text-gray-300'
                      }`}
                      onClick={() => setGrindSize(grindMap[idx])}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-medium text-gray-400 mb-1">Brew Time</span>
                <div className="w-full rounded-lg px-0 py-2 text-base font-bold text-center text-white bg-gray-700">
                  {formatTime(brewingTimings.totalTime)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {coffeeSettings.amount}g • 1:{coffeeSettings.ratio}
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-medium text-gray-400 mb-1">Total Water</span>
                <div className="w-full rounded-lg px-0 py-2 text-base font-bold text-center text-white bg-gray-700">
                  {brewingTimings.thirdPourTarget}g
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(brewingTimings.pourVolume)}g per pour
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!showBrewTimer && (
                <button 
                  className="btn btn-primary flex-1 rounded-lg" 
                  onClick={handleStart}
                >
                  Ready
                </button>
              )}
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default BrewingApp;

// Removed mapGrindStringToValue as it's not used after GrindSelector removal
// Ensure all imports are used or remove them.
// Review any remaining console.logs or commented out code for cleanup.