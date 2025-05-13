import React, { useState, useRef, useEffect } from 'react';
import GrindSelector from './GrindSelector';
import BrewingTimer from './BrewingTimer';
import { Notes } from './Notes';
import { BrewingPhase, CoffeeSettings } from '../types/brewing';
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';
import { ClipboardList, Info, Settings as SettingsIcon, X, Coffee } from 'lucide-react';
import ProPours from './ProPours';

const defaultCoffeeOptions = [15, 20, 25, 30];
const defaultRatioOptions = [15, 16, 17, 18];

// Add chime audio refs at the top of BrewingApp
const chimeUrl = 'https://assets.mixkit.co/active_storage/sfx/2870/2870.wav';
const softChimeUrl = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b6b2.mp3';

function InfoPage({ onBack }: { onBack: () => void }) {
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

          {/* Custom Buy Me a Coffee Button */}
          <div className="pt-4">
            <a
              href="https://buy.stripe.com/aEU8zk2NocfZ7sIaEF"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Coffee size={20} />
              Buy me a coffee
            </a>
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
              {settingsDraft.coffeeOptions.map((val: number, idx: number) => (
                <div key={idx} className="relative flex items-center">
                  <div className="amount-btn amount-btn-inactive w-full flex items-center justify-between pr-6">
                    <button
                      type="button"
                      aria-label="Decrease grams"
                      className="text-xl font-bold text-white px-2 focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={() => setSettingsDraft((d: any) => ({
                        ...d,
                        coffeeOptions: d.coffeeOptions.map((x: number, i: number) => i === idx ? Math.max(10, parseFloat((x - 0.1).toFixed(1))) : x)
                      }))}
                    >
                      &minus;
                    </button>
                    <span className="text-lg font-bold text-white select-none">{val}g</span>
                    <button
                      type="button"
                      aria-label="Increase grams"
                      className="text-xl font-bold text-white px-2 focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={() => setSettingsDraft((d: any) => ({
                        ...d,
                        coffeeOptions: d.coffeeOptions.map((x: number, i: number) => i === idx ? Math.min(40, parseFloat((x + 0.1).toFixed(1))) : x)
                      }))}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove option"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-500 text-lg px-1"
                    onClick={() => setSettingsDraft((d: any) => ({ ...d, coffeeOptions: d.coffeeOptions.filter((_: any, i: number) => i !== idx) }))}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="amount-btn amount-btn-inactive flex items-center justify-center"
                onClick={() => setSettingsDraft((d: any) => ({ ...d, coffeeOptions: [...d.coffeeOptions, 15] }))}
                aria-label="Add coffee option"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Ratio options</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {settingsDraft.ratioOptions.map((val: number, idx: number) => (
                <div key={idx} className="relative flex items-center">
                  <div className="amount-btn amount-btn-inactive w-full flex items-center justify-between pr-6">
                    <button
                      type="button"
                      aria-label="Decrease ratio"
                      className="text-xl font-bold text-white px-2 focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={() => setSettingsDraft((d: any) => ({
                        ...d,
                        ratioOptions: d.ratioOptions.map((x: number, i: number) => i === idx ? Math.max(14, parseFloat((x - 0.1).toFixed(1))) : x)
                      }))}
                    >
                      &minus;
                    </button>
                    <span className="text-lg font-bold text-white select-none">1:{val}</span>
                    <button
                      type="button"
                      aria-label="Increase ratio"
                      className="text-xl font-bold text-white px-2 focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={() => setSettingsDraft((d: any) => ({
                        ...d,
                        ratioOptions: d.ratioOptions.map((x: number, i: number) => i === idx ? Math.min(20, parseFloat((x + 0.1).toFixed(1))) : x)
                      }))}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove ratio option"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-500 text-lg px-1"
                    onClick={() => setSettingsDraft((d: any) => ({ ...d, ratioOptions: d.ratioOptions.filter((_: any, i: number) => i !== idx) }))}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="amount-btn amount-btn-inactive flex items-center justify-center"
                onClick={() => setSettingsDraft((d: any) => ({ ...d, ratioOptions: [...d.ratioOptions, 15] }))}
                aria-label="Add ratio option"
              >
                +
              </button>
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

// Helper to map grind string to grindSize number
function mapGrindStringToValue(grind?: string): number {
  if (!grind) return 6;
  const g = grind.toLowerCase();
  if (g.includes('fine')) return 3;
  if (g.includes('medium-coarse')) return 7;
  if (g.includes('medium')) return 6;
  if (g.includes('coarse')) return 9;
  return 6;
}

// Add BrewTimerPage component for the timer, instruction, step list, and progress bars
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
  const isRest = getStepInstruction().toLowerCase().includes('rest') || getStepInstruction().toLowerCase().includes('drawdown');
  // --- Ultra-smooth progress bar refs ---
  const barRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Animate progress bars directly
  React.useEffect(() => {
    let raf: number;
    function animate() {
      for (let i = 0; i < fullStepSequence.length; i++) {
        const bar = barRefs.current[i];
        if (!bar) continue;
        const stepStart = i === 0 ? 0 : fullStepEndTimes[i - 1];
        const stepEnd = fullStepEndTimes[i];
        let progress = 0;
        if (elapsed >= stepEnd) progress = 100;
        else if (elapsed > stepStart) progress = Math.min(100, ((elapsed - stepStart) / (stepEnd - stepStart)) * 100);
        else progress = 0;
        bar.style.width = progress + '%';
      }
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [elapsed, fullStepSequence, fullStepEndTimes]);
  // --- End ultra-smooth progress bar refs ---

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="card p-4">
        {/* Top bar: Back/Stop button */}
        <div className="flex justify-between items-center mb-3">
          <button className="btn btn-secondary" onClick={onBack}>Back</button>
        </div>
        {/* Timer and instruction in a rectangle, instruction left, timer right */}
        <div className={`flex items-center justify-between mb-3 rounded-[4px] px-4 py-2 ${isRest ? 'bg-red-900' : 'bg-green-900'}`} style={{ minHeight: 48 }}>
          <span className={`text-sm font-semibold min-w-0 truncate ${isRest ? 'text-red-100' : 'text-green-100'}`}>{getStepInstruction()}</span>
          <span className={`text-2xl font-mono font-bold ml-4 ${isRest ? 'text-red-200' : 'text-green-200'}`}>{formatTime(Math.floor(elapsed))}</span>
        </div>
        {/* Brew Steps List (animated, all steps) */}
        <div className="flex flex-col gap-2 mt-2">
          {fullStepSequence.map((step: any, i: number) => {
            const isRest = step.label === 'Rest' || step.label === 'Drawdown';
            return (
              <div
                key={i}
                className={`flex flex-col bg-gray-800 rounded-[4px] px-4 py-2 font-bold transition-all duration-300 ${isRest ? 'text-red-200' : step.color}`}
                style={{ minHeight: 40 }}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{isRest ? `${step.label} ${step.emoji ? step.emoji : ''}` : step.label} {(!isRest && step.emoji) && <span role="img" aria-label={step.label}>{step.emoji}</span>}</span>
                  <span>{isRest ? formatTime(step.duration) : step.water}</span>
                  <span>{formatTime(i === fullStepSequence.length - 1 ? fullStepEndTimes[fullStepEndTimes.length - 1] : fullStepEndTimes[i])}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 mt-2 bg-gray-700 rounded-[4px] overflow-hidden">
                  <div
                    ref={el => barRefs.current[i] = el}
                    className={`h-full ${isRest ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* Timer Controls */}
        <div className="flex gap-2 mt-4">
          {timerActive && !timerPaused && (
            <button className="btn btn-secondary flex-1" onClick={handlePause}>Pause</button>
          )}
          {timerActive && timerPaused && (
            <button className="btn btn-primary flex-1" onClick={handleResume}>Resume</button>
          )}
          {(timerActive || elapsed > 0) && (
            <button className="btn btn-secondary flex-1" onClick={handleReset}>Reset</button>
          )}
        </div>
      </div>
    </div>
  );
}

const BrewingApp: React.FC<{ onShowAbout?: () => void }> = ({ onShowAbout }) => {
  const [grindSize, setGrindSize] = useState<number>(6);
  const [isBrewActive, setIsBrewActive] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<BrewingPhase | null>(null);
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
    return saved ? JSON.parse(saved) : { amount: 15, ratio: 15 };
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
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [finished, setFinished] = useState(false);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const softChimeRef = useRef<HTMLAudioElement | null>(null);
  const prevStepRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedElapsedRef = useRef<number>(0);
  
  const brewingTimings = calculateBrewTiming(grindSize, coffeeSettings.amount, coffeeSettings.ratio);

  // For timer/instruction logic, keep the full step sequence
  const fullStepSequence = [
    { label: 'Bloom', color: 'text-green-200', water: `${brewingTimings.bloomWater}ml`, duration: brewingTimings.bloomDuration },
    { label: 'Pour to', color: 'text-green-200', water: `${brewingTimings.firstPourTarget}ml`, duration: brewingTimings.firstPourDuration },
    { label: 'Rest', color: 'text-red-300', water: '', duration: brewingTimings.restDuration, emoji: '🧘' },
    { label: 'Pour to', color: 'text-green-200', water: `${brewingTimings.secondPourTarget}ml`, duration: brewingTimings.secondPourDuration },
    { label: 'Rest', color: 'text-red-300', water: '', duration: brewingTimings.secondRestDuration, emoji: '🧘' },
    { label: 'Pour to', color: 'text-green-200', water: `${brewingTimings.thirdPourTarget}ml`, duration: brewingTimings.thirdPourDuration },
    { label: 'Drawdown', color: 'text-red-300', water: '', duration: brewingTimings.drawdownDuration, emoji: '🧘' },
    { label: 'Total', color: 'text-gray-200', water: '', duration: 0, emoji: '☕' },
  ];
  const fullStepEndTimes = fullStepSequence.reduce((arr, step, i) => {
    arr.push((arr[i - 1] || 0) + (step.duration || 0));
    return arr;
  }, [] as number[]);
  const fullCurrentStepIdx = fullStepEndTimes.findIndex(end => elapsed < end);
  const fullCurrentStep = fullCurrentStepIdx === -1 ? fullStepSequence.length - 1 : fullCurrentStepIdx;

  // Timer effect (real-world clock for perfect accuracy)
  useEffect(() => {
    let raf: number;
    function animate() {
      if (timerActive && !timerPaused && !finished && startTimeRef.current !== null) {
        const now = Date.now();
        const elapsedSec = accumulatedElapsedRef.current + (now - startTimeRef.current) / 1000;
        if (elapsedSec < fullStepEndTimes[fullStepEndTimes.length - 1]) {
          setElapsed(elapsedSec);
          raf = requestAnimationFrame(animate);
        } else {
          setElapsed(fullStepEndTimes[fullStepEndTimes.length - 1]);
          setTimerActive(false);
          setFinished(true);
        }
      }
    }
    if (timerActive && !timerPaused && !finished) {
      raf = requestAnimationFrame(animate);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [timerActive, timerPaused, fullStepEndTimes, finished]);

  // Start, Pause, Resume, Reset logic for real-world clock
  const handleStart = () => {
    setTimerActive(true);
    setTimerPaused(false);
    setFinished(false);
    setElapsed(0);
    accumulatedElapsedRef.current = 0;
    startTimeRef.current = Date.now();
    setShowBrewTimer(true);
  };
  const handlePause = () => {
    setTimerPaused(true);
    setTimerActive(false);
    if (startTimeRef.current !== null) {
      accumulatedElapsedRef.current += (Date.now() - startTimeRef.current) / 1000;
      startTimeRef.current = null;
    }
  };
  const handleResume = () => {
    setTimerPaused(false);
    setTimerActive(true);
    startTimeRef.current = Date.now();
  };
  const handleReset = () => {
    setTimerActive(false);
    setTimerPaused(false);
    setElapsed(0);
    setFinished(false);
    accumulatedElapsedRef.current = 0;
    startTimeRef.current = null;
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
  
  const startBrewing = () => {
    setIsBrewActive(true);
    setCurrentPhase('bloom');
  };
  
  const stopBrewing = () => {
    setIsBrewActive(false);
    setCurrentPhase(null);
  };
  
  const handlePhaseChange = (phase: BrewingPhase | null) => {
    setCurrentPhase(phase);
    if (phase === null) {
      setIsBrewActive(false);
    }
  };

  const handleCoffeeAmountChange = (amount: number) => {
    setCoffeeSettings(prev => ({ ...prev, amount }));
    localStorage.setItem('coffeeSettings', JSON.stringify({ ...coffeeSettings, amount }));
  };

  const handleRatioChange = (ratio: number) => {
    setCoffeeSettings(prev => ({ ...prev, ratio }));
    localStorage.setItem('coffeeSettings', JSON.stringify({ ...coffeeSettings, ratio }));
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
    setCoffeeSettings({ amount: settingsDraft.amount, ratio: settingsDraft.ratio });
    setCoffeeOptions(settingsDraft.coffeeOptions);
    setRatioOptions(settingsDraft.ratioOptions);
    localStorage.setItem('coffeeSettings', JSON.stringify({ amount: settingsDraft.amount, ratio: settingsDraft.ratio }));
    localStorage.setItem('coffeeOptions', JSON.stringify(settingsDraft.coffeeOptions));
    localStorage.setItem('ratioOptions', JSON.stringify(settingsDraft.ratioOptions));
    setShowSettings(false);
  };

  // Focus trap for modal
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

  // Update getStepInstruction to use fullStepSequence
  const getStepInstruction = () => {
    if (finished) return 'Finished! Enjoy your coffee ☕';
    const step = fullStepSequence[fullCurrentStep];
    if (step.label === 'Rest' || step.label === 'Drawdown') {
      return `${step.label} ${step.emoji || ''} until ${formatTime(fullStepEndTimes[fullCurrentStep])}`;
    }
    if (step.label === 'Total') {
      return `Done! Total time: ${formatTime(fullStepEndTimes[fullStepEndTimes.length - 1])}`;
    }
    if (step.label === 'Bloom') {
      return `Bloom with ${step.water}`;
    }
    if (step.label === 'Pour to') {
      return `Pour to ${step.water} by ${formatTime(fullStepEndTimes[fullCurrentStep])}`;
    }
    return '';
  };

  const handleBack = () => {
    setShowBrewTimer(false);
    handleReset();
  };

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
    return (
      <BrewTimerPage
        elapsed={elapsed}
        getStepInstruction={getStepInstruction}
        fullStepSequence={fullStepSequence}
        fullCurrentStep={fullCurrentStep}
        fullStepEndTimes={fullStepEndTimes}
        handlePause={handlePause}
        handleResume={handleResume}
        handleReset={handleReset}
        timerActive={timerActive}
        timerPaused={timerPaused}
        finished={finished}
        formatTime={formatTime}
        onBack={handleBack}
      />
    );
  }
  
  return (
    <div className="w-full max-w-sm">
      <div className="card space-y-6">
        {!isBrewActive ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">Pour Perfect</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowNotes(true)}
                  className="btn btn-secondary p-2"
                  aria-label="Notes"
                >
                  <span role="img" aria-label="Notes" className="text-lg">🗒️</span>
                </button>
                <button
                  onClick={() => setShowProPours(true)}
                  className="btn btn-secondary p-2"
                  aria-label="Pro Pours"
                >
                  <span role="img" aria-label="Pro Pours" className="text-lg">🏆</span>
                </button>
                <button
                  onClick={openSettings}
                  className="btn btn-secondary p-2"
                  type="button"
                  aria-label="Settings"
                >
                  <span role="img" aria-label="Settings" className="text-lg">⚙️</span>
                </button>
              <button 
                  onClick={() => setShowInfo(true)}
                className="btn btn-secondary p-2"
                  type="button"
                  aria-label="Info"
              >
                  <span role="img" aria-label="Info" className="text-lg">ℹ️</span>
              </button>
              </div>
            </div>
            {/* Coffee and Ratio Selectors */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 mb-1 ml-1">Coffee</span>
                <div className="grid grid-cols-2 gap-2">
                  {coffeeOptions.map(amount => (
                    <button
                      key={amount}
                      className={`w-full px-0 py-2 rounded-[4px] text-sm font-semibold transition-colors bg-gray-800 ${coffeeSettings.amount === amount ? 'text-white border-2 border-green-400' : 'text-gray-300 border border-transparent'}`}
                      onClick={() => handleCoffeeAmountChange(amount)}
                    >
                      {amount}g
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 mb-1 ml-1">Ratio</span>
                <div className="grid grid-cols-2 gap-2">
                  {ratioOptions.map(ratio => (
                    <button
                      key={ratio}
                      className={`w-full px-0 py-2 rounded-[4px] text-sm font-semibold transition-colors bg-gray-800 ${coffeeSettings.ratio === ratio ? 'text-white border-2 border-green-400' : 'text-gray-300 border border-transparent'}`}
                      onClick={() => handleRatioChange(ratio)}
                    >
                      1:{ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Grind Selector */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-300">Grind</span>
              </div>
              <div className="flex gap-2">
                {['Fine', 'Medium', 'Medium-coarse', 'Coarse'].map((label, idx) => {
                  const grindMap = [3, 6, 7, 9];
                  return (
                    <button
                      key={label}
                      className={`flex-1 px-0 py-2 rounded-[4px] text-sm font-semibold transition-colors bg-gray-800 ${grindSize === grindMap[idx] ? 'text-white border-2 border-green-400' : 'text-gray-300 border border-transparent'}`}
                      onClick={() => setGrindSize(grindMap[idx])}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              </div>
            {/* Brew Time and Total Water - compact row */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-medium text-gray-400 mb-1">Brew Time</span>
                <div className="w-full bg-gray-800 rounded-[4px] px-0 py-2 text-base font-bold text-center text-white">{formatTime(brewingTimings.totalTime)}</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-medium text-gray-400 mb-1">Total Water</span>
                <div className="w-full bg-gray-800 rounded-[4px] px-0 py-2 text-base font-bold text-center text-white">{brewingTimings.thirdPourTarget}ml</div>
              </div>
            </div>
            {/* Timer and instruction in a rectangle, instruction left, timer right */}
            <div className="flex items-center justify-between mb-3 bg-green-900 rounded-[4px] px-4 py-2" style={{ minHeight: 48 }}>
              <span className="text-sm text-green-100 font-semibold min-w-0 truncate">{getStepInstruction()}</span>
              <span className="text-2xl font-mono font-bold text-green-200 ml-4">{formatTime(Math.floor(elapsed))}</span>
            </div>
            {!showBrewTimer && (
              <button className="btn btn-primary w-full mt-4" onClick={handleStart}>
                Start
              </button>
            )}
          </>
        ) : (
          <BrewingTimer 
            brewingTimings={brewingTimings}
            currentPhase={currentPhase}
            onPhaseChange={handlePhaseChange}
            onStop={stopBrewing}
            coffeeSettings={coffeeSettings}
          />
        )}
      </div>
      {/* Add fade-in-scale animation */}
      <style>{`
        .animate-fade-in-scale {
          animation: fadeInScale 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default BrewingApp;