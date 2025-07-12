import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';
import { CoffeeSettings } from '../types/brewing';
import AppleStylePicker from './AppleStylePicker';

// Helper components will be moved here directly to keep this file self-contained

function CompletionPrompt({ 
  onLogExperience, 
  onSkip 
}: { 
  onLogExperience: () => void, 
  onSkip: () => void 
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <div className="flex flex-col items-center w-full max-w-[430px] mx-auto px-4 py-12">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-3xl font-bold mb-4 text-black">Brew Complete!</h1>
        <p className="text-base text-gray-600 mb-8 text-center">
            How was your pour-over? Would you like to log this brewing experience?
          </p>
          <button 
          className="w-full py-2 mb-3 border border-gray-300 rounded-full text-sm font-medium transition-colors hover:border-[#ff6700] bg-black text-white"
            onClick={onLogExperience}
          >
            Log This Brew
          </button>
          <button 
          className="w-full py-2 border border-gray-300 rounded-full text-sm font-medium transition-colors hover:border-[#ff6700] bg-white text-black"
            onClick={onSkip}
          >
            Skip for Now
          </button>
      </div>
    </div>
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
  onBack,
  onDone,
  onSaveRecipe
}: any) {
  const isDarkMode = false; // Force light mode
  const navigate = useNavigate();
  const totalTime = fullStepEndTimes[fullStepEndTimes.length - 1] || 1;
  const timeRemaining = Math.max(0, totalTime - elapsed);
  
  const currentStepStartTime = fullCurrentStep > 0 ? fullStepEndTimes[fullCurrentStep - 1] : 0;
  const currentStepEndTime = fullStepEndTimes[fullCurrentStep] || 0;
  const currentStepDuration = currentStepEndTime - currentStepStartTime;
  const currentStepElapsed = elapsed - currentStepStartTime;
  const currentStepTimeRemaining = Math.ceil(Math.max(0, currentStepDuration - currentStepElapsed));

  const extractTargetWeight = (waterText: string) => {
    if (waterText && waterText.includes('Pour to')) return waterText.replace('Pour to ', '');
    return '';
  };

  React.useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
    return () => {
      document.body.style.backgroundColor = ''; // Revert to default
      document.body.style.color = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
       <nav className="fixed left-0 top-0 h-full z-50 pointer-events-none">
        <div className="h-full flex flex-col justify-between py-8 pl-3" style={{ marginLeft: 'env(safe-area-inset-left, 0)' }}>
          <button onClick={() => navigate('/')} className="p-3 text-base font-medium hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation text-black">origen</button>
          <button onClick={() => navigate('/about')} className="p-3 text-base font-medium hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation text-black">about</button>
          <button onClick={() => navigate('/coffee')} className="p-3 text-base font-medium hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation text-black">coffee</button>
          <button className="p-3 text-base font-medium text-[#ff6700] transition-colors pointer-events-auto touch-manipulation">timer</button>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="w-full max-w-[430px] mx-auto px-4 py-6 relative">
          <div className="flex flex-col w-full relative z-40">
            {/* Top Info Bar */}
            <div className="flex justify-between items-end mb-6 w-full">
              <div className="flex flex-col items-start">
                <div className="text-xs uppercase tracking-wider text-gray-400">Target time</div>
                <div className="text-2xl font-light mt-1">{formatTime(totalTime)}</div>
              </div>
              <div className="flex flex-col items-center flex-1">
                <div className="text-xs uppercase tracking-wider text-gray-400">Time left</div>
                <div className="text-2xl font-light mt-1">{formatTime(Math.ceil(timeRemaining))}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs uppercase tracking-wider text-gray-400">Current step</div>
                <div className="text-2xl font-light mt-1">{currentStepTimeRemaining}s</div>
              </div>
            </div>

            {/* Step List */}
            <div className="relative overflow-y-auto" style={{ minHeight: 206, maxHeight: 'calc(100vh - 238px)' }}>
              {(() => {
                const [stepOffsets, setStepOffsets] = React.useState<number[]>([]);
                const stepRefs = React.useRef<(HTMLDivElement | null)[]>([]);
                React.useEffect(() => {
                  setStepOffsets(
                    stepRefs.current.map(ref => (ref ? ref.offsetTop : 0))
                  );
                }, [fullStepSequence.length, elapsed]);
                const highlightTop = stepOffsets[fullCurrentStep] || 0;
                const highlightHeight = stepRefs.current[fullCurrentStep]?.offsetHeight || 56;
                return (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: highlightTop,
                        height: highlightHeight,
                        zIndex: 1,
                        transition: 'top 400ms cubic-bezier(0.4, 0, 0.2, 1), height 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: 'none',
                        borderRadius: 8,
                        border: '1px solid #ff6700',
                        background: 'linear-gradient(rgba(120,120,120,0.08), rgba(120,120,120,0.08)), #F3F4F6',
                        boxShadow: '0 2px 8px #0001',
                      }}
                    />
                    <div className="space-y-0.5 relative z-40">
                      {fullStepSequence.slice(0, -1).map((step: any, index: number) => {
                        const isActive = index === fullCurrentStep;
                        const isCompleted = elapsed >= (fullStepEndTimes[index] || 0);
                        const stepStart = index === 0 ? 0 : fullStepEndTimes[index - 1];
                        const stepEnd = fullStepEndTimes[index] || 0;
                        const stepDuration = Math.max(0, stepEnd - stepStart);
                        const stepElapsed = Math.max(0, elapsed - stepStart);
                        const stepProgress = stepDuration > 0 ? Math.min((stepElapsed / stepDuration) * 100, 100) : 0;
                        const targetWeight = extractTargetWeight(step.water);
                        return (
                          <div
                            key={index}
                            className="py-1 relative"
                            style={{ minHeight: 19 }}
                            ref={el => (stepRefs.current[index] = el)}
                          >
                            <div className="flex flex-col justify-between p-2 h-full" style={{ transition: 'background 0.3s, box-shadow 0.3s, border 0.3s' }}>
                              <div className="flex justify-between items-center">
                                <span style={{ color: isCompleted ? 'rgba(0,0,0,0.5)' : '#000', fontWeight: isActive ? 600 : 400 }}>{step.label}</span>
                                <span style={{ color: isCompleted ? 'rgba(0,0,0,0.5)' : '#000', fontWeight: isActive ? 600 : 400 }}>{targetWeight || `${Math.round(stepDuration)}s`}</span>
                              </div>
                              {index < fullStepSequence.length - 2 && (
                                <div className="relative w-full mt-0.5">
                                  <div 
                                    className="w-full h-[2px]"
                                    style={{
                                      backgroundImage: isCompleted ? 'none' : `radial-gradient(circle, #D1D5DB 1px, transparent 1px)`,
                                      backgroundColor: isCompleted ? '#E5E7EB' : 'transparent',
                                      backgroundSize: '8px 2px',
                                      backgroundRepeat: 'repeat-x'
                                    }}
                                  />
                                  {isActive && !isCompleted && (
                                    <div 
                                      className="absolute top-0 h-[2px] transition-all duration-100 ease-linear"
                                      style={{ width: `${stepProgress}%`, background: '#ff6700', transformOrigin: step.label.includes('Wait') || step.label.includes('Drawdown') ? 'right' : 'left' }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Buttons */}
            <div className="mt-12 flex flex-col items-center justify-center w-full">
              <div className="flex w-full justify-between gap-4">
                <button onClick={onBack} className="py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors text-black hover:bg-gray-50">Back</button>
                <button onClick={onDone} className="py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors text-black hover:bg-gray-50">Done</button>
                <button onClick={timerActive && !timerPaused ? handlePause : handleResume} className="py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors text-black hover:bg-gray-50" disabled={finished}>
                  {timerActive && !timerPaused ? 'Pause' : 'Start'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultCoffeeOptions = [15, 30];
const defaultRatioOptions = [15, 18];
const softChimeUrl = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b6b2.mp3';

const BrewingApp: React.FC = () => {
  const navigate = useNavigate();
  
  const loadSavedSettings = () => {
    const savedSettings = localStorage.getItem('coffeeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          amount: (parsed.amount >= 1 && parsed.amount <= 50) ? parsed.amount : 15.0,
          ratio: (parsed.ratio >= 1 && parsed.ratio <= 50) ? parsed.ratio : 15.0,
          bloomRatio: parsed.bloomRatio || 2
        };
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
    }
    return { amount: 15.0, ratio: 15.0, bloomRatio: 2 };
  };

  const [coffeeSettings, setCoffeeSettings] = useState<CoffeeSettings>(loadSavedSettings);
  const [grindSize, setGrindSize] = useState(6);
  const [showBrewTimer, setShowBrewTimer] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const brewingTimings = calculateBrewTiming(
    grindSize, 
    coffeeSettings.amount, 
    coffeeSettings.ratio, 
    coffeeSettings.bloomRatio
  );

  const stepSequence = [
    { label: 'Bloom', water: `Pour to ${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
    { label: 'First Pour', water: `Pour to ${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
    { label: 'Rest', water: 'Let it steep', duration: brewingTimings.restDuration },
    { label: 'Second Pour', water: `Pour to ${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
    { label: 'Rest', water: 'Let it steep', duration: brewingTimings.secondRestDuration },
    { label: 'Third Pour', water: `Pour to ${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
    { label: 'Drawdown', water: 'Let coffee drip', duration: brewingTimings.drawdownDuration },
    { label: 'Finish', water: 'Enjoy your coffee!', duration: 0 }
  ];

  const stepEndTimes = stepSequence.reduce((acc, step, i) => {
    acc.push((acc[i - 1] || 0) + step.duration);
    return acc;
  }, [] as number[]);

  const totalTime = stepEndTimes[stepEndTimes.length - 1] || 0;
  const isFinished = elapsed >= totalTime;

  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 0.1;
          const newCurrentStep = stepEndTimes.findIndex(endTime => newElapsed < endTime);
          const actualNewStep = newCurrentStep === -1 ? stepSequence.length - 1 : newCurrentStep;
          
          if (actualNewStep !== currentStep) {
            const completedStepIndex = actualNewStep - 1;
            const completedStep = stepSequence[completedStepIndex];
            const isPourStep = completedStep && (completedStep.label.includes('Pour') || completedStep.label.includes('Bloom'));
            if (isPourStep && completedStepIndex >= 0) {
              try {
                const audio = new Audio(softChimeUrl);
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch (error) {}
              if ('vibrate' in navigator) navigator.vibrate(100);
            }
          }
          
          setCurrentStep(actualNewStep);
          
          if (newElapsed >= totalTime) {
            setIsRunning(false);
            setShowBrewTimer(false); // Or show completion screen
            return totalTime;
          }
          
          return newElapsed;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isFinished, totalTime, stepEndTimes.length, stepSequence.length, currentStep]);

  const handleStart = () => {
    setElapsed(0);
    setCurrentStep(0);
    setIsRunning(false); // Will be started by BrewTimerPage
    setShowBrewTimer(true);
  };
  
  const handleTimerStart = () => setIsRunning(true);
  const handleTimerPause = () => setIsRunning(false);
  const handleTimerReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentStep(0);
  };
  const handleBack = () => {
    setShowBrewTimer(false);
    handleTimerReset();
  };
  const handleTimerDone = () => {
    setShowBrewTimer(false);
    handleTimerReset();
  };
  
  const getStepInstruction = () => {
    if (isFinished) return 'Finished! Enjoy your coffee ☕';
    if (!showBrewTimer || !stepSequence[currentStep]) return `Target brew time: ${formatTime(brewingTimings.totalTime)}`;
    const step = stepSequence[currentStep];
    const targetWeight = step.water.match(/(\d+g)/);
    if (targetWeight) return `Pour to ${targetWeight[0]}`;
    if (step.label === 'Finish') return `Done! Target time: ${formatTime(totalTime)}`;
    return step.label;
  };
  
  useEffect(() => {
    localStorage.setItem('coffeeSettings', JSON.stringify(coffeeSettings));
  }, [coffeeSettings]);

  if (showBrewTimer) {
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
        onDone={handleTimerDone}
        onSaveRecipe={() => { /* Implement save recipe functionality */ }}
      />
    );
  }

  // Main page UI
  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="fixed left-0 top-0 h-full z-30 pointer-events-none">
        <div className="h-full flex flex-col justify-between py-8 pl-3" style={{ marginLeft: 'env(safe-area-inset-left, 0)' }}>
          <button onClick={() => navigate('/')} className="p-3 text-base font-medium hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation text-black">origen</button>
          <button onClick={() => navigate('/about')} className="p-3 text-base font-medium hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation text-black">about</button>
          <button onClick={() => navigate('/coffee')} className="p-3 text-base font-medium hover:text-[#ff6700] transition-colors pointer-events-auto touch-manipulation text-black">coffee</button>
          <button onClick={() => navigate('/timer')} className="p-3 text-base font-medium text-[#ff6700] transition-colors pointer-events-auto touch-manipulation">timer</button>
        </div>
      </nav>
      
      <div className="h-full flex flex-col w-full max-w-[430px] mx-auto py-4 px-4 sm:px-6 md:px-8 relative z-20">
        <div className="flex items-center gap-3 mb-6 pt-4">
          <div className="w-[25px] h-[25px] rounded-full bg-[#ff6700]"></div>
          <h1 className="text-sm font-medium text-black">Pour Perfect</h1>
        </div>

        <main className="flex-1 space-y-6 relative z-30">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs text-black">Target Time</span>
              <div className="h-12 w-full flex items-center justify-center rounded-lg bg-gray-100">
                <span className="text-2xl font-normal text-black">{formatTime(brewingTimings.totalTime)}</span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs text-black">Target Water</span>
              <div className="h-12 w-full flex items-center justify-center rounded-lg bg-gray-100">
                <span className="text-2xl font-normal text-black">{Math.round(coffeeSettings.amount * coffeeSettings.ratio)}g</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 pb-1 px-2">
            <div className="flex flex-col items-center">
              <AppleStylePicker value={coffeeSettings.amount} onChange={(amount) => setCoffeeSettings(prev => ({ ...prev, amount }))} isDarkMode={false} label="Coffee (g)" />
            </div>
            <div className="flex flex-col items-center">
              <AppleStylePicker value={coffeeSettings.ratio} onChange={(ratio) => setCoffeeSettings(prev => ({ ...prev, ratio }))} isDarkMode={false} label="Ratio" />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-black">Grind Size</span>
              <span className="text-sm text-black">{grindSize.toFixed(1)}</span>
            </div>
            <div className="w-full relative">
              <div className="absolute w-full -top-3 flex justify-between">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={i + 1} className="flex flex-col items-center">
                    <div className="w-px h-2 bg-gray-500" />
                    <span className="text-xs mt-1 text-gray-500">{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="w-full relative h-1 mt-6">
                <div className="w-full h-1 rounded-full transition-all duration-150 ease-out" style={{ background: `linear-gradient(to right, #ff6700 0%, #ff6700 ${(grindSize - 1) * 10}%, #d1d5db ${(grindSize - 1) * 10}%, #d1d5db 100%)` }}/>
                <input type="range" min="1" max="11" step="0.1" value={grindSize} onChange={(e) => setGrindSize(Number(e.target.value))} className="absolute top-0 w-full h-4 -mt-1.5 appearance-none cursor-pointer bg-transparent simple-slider" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { /* Show notes maybe? */ }} className="h-12 w-full flex items-center justify-center rounded-lg transition-colors hover:opacity-80 bg-gray-100">
              <span className="text-2xl font-normal text-black">Notes</span>
            </button>
            <button onClick={handleStart} className="h-12 w-full flex items-center justify-center rounded-lg transition-colors hover:opacity-80 bg-gray-100">
              <span className="text-2xl font-normal text-black">Ready</span>
            </button>
          </div>
        </main>
        
        <div className="w-full flex justify-center mt-8 mb-2 relative z-30">
          <span className="text-xs text-gray-400">made by </span>
          <button onClick={() => navigate('/')} className="text-xs font-semibold ml-1 text-[#ff6700] hover:underline focus:outline-none" style={{ color: '#ff6700' }}>
            Origen
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrewingApp; 