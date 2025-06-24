import React, { useState, useRef, useEffect } from 'react';
// import GrindSelector from './GrindSelector'; // Assuming this is not used or will be re-evaluated
import { Notes } from './Notes';
import { CoffeeSettings } from '../types/brewing'; // BrewingPhase might not be needed
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';
import { ClipboardList, Info, Settings as SettingsIcon, X, Coffee, Sliders, SlidersHorizontal, Pencil } from 'lucide-react';
import ProPours from './ProPours';
import VerticalPicker from './VerticalPicker';
import BrewingGuide from './BrewingGuide';
import SettingsModal from './SettingsModal';
import NotesModal from './NotesModal';
// FlavorEQ import removed
import { useTheme } from '../context/ThemeContext';
import AppleStylePicker from './AppleStylePicker';

const defaultCoffeeOptions = [15, 30];
const defaultRatioOptions = [15, 18];

const chimeUrl = 'https://assets.mixkit.co/active_storage/sfx/2870/2870.wav';
const softChimeUrl = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b9b6b2.mp3';

function MeditativeColorField({ 
  currentStep, 
  stepProgress, 
  isActive, 
  stepLabel 
}: { 
  currentStep: number, 
  stepProgress: number, 
  isActive: boolean,
  stepLabel: string 
}) {
  // Color palettes for different phases
  const getPhaseColors = (label: string, progress: number) => {
    const isPourPhase = label === 'Bloom' || label === 'Pour';
    const isWaitPhase = label === 'Wait';
    const isDrawdown = label === 'Drawdown';
    
    if (isPourPhase) {
      // Warm, expanding colors for pouring phases
      const intensity = Math.min(progress / 100, 1);
      return {
        primary: `hsl(${25 + currentStep * 15}, ${60 + intensity * 40}%, ${40 + intensity * 30}%)`,
        secondary: `hsl(${35 + currentStep * 20}, ${70 + intensity * 30}%, ${50 + intensity * 20}%)`,
        accent: `hsl(${45 + currentStep * 10}, ${80 + intensity * 20}%, ${60 + intensity * 15}%)`
      };
    } else if (isWaitPhase) {
      // Cool, contracting colors for waiting phases
      const drain = 1 - (progress / 100);
      return {
        primary: `hsl(${200 + currentStep * 10}, ${40 + drain * 20}%, ${25 + drain * 15}%)`,
        secondary: `hsl(${220 + currentStep * 15}, ${50 + drain * 15}%, ${35 + drain * 10}%)`,
        accent: `hsl(${240 + currentStep * 5}, ${60 + drain * 10}%, ${45 + drain * 5}%)`
      };
    } else if (isDrawdown) {
      // Deep, settling colors for drawdown
      const settling = progress / 100;
      return {
        primary: `hsl(${280 + settling * 20}, ${30 + settling * 20}%, ${20 + settling * 10}%)`,
        secondary: `hsl(${260 + settling * 15}, ${40 + settling * 15}%, ${30 + settling * 8}%)`,
        accent: `hsl(${300 + settling * 10}, ${50 + settling * 10}%, ${40 + settling * 5}%)`
      };
    }
    
    // Default neutral state
    return {
      primary: 'hsl(0, 0%, 15%)',
      secondary: 'hsl(0, 0%, 20%)',
      accent: 'hsl(0, 0%, 25%)'
    };
  };

  const colors = getPhaseColors(stepLabel, stepProgress);
  const isPourPhase = stepLabel === 'Bloom' || stepLabel === 'Pour';
  const scale = isPourPhase ? 0.5 + (stepProgress / 100) * 0.5 : 1 - (stepProgress / 100) * 0.3;
  const opacity = isActive ? 0.8 : 0.3;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
      {/* Primary color field - largest, background */}
      <div 
        className="absolute inset-0 transition-all duration-[2000ms] ease-out"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.primary} 0%, ${colors.secondary} 70%, transparent 100%)`,
          opacity: opacity * 0.6,
          transform: `scale(${scale * 1.2})`,
        }}
      />
      
      {/* Secondary color field - medium, offset */}
      <div 
        className="absolute inset-0 transition-all duration-[1500ms] ease-out"
        style={{
          background: `radial-gradient(circle at 30% 60%, ${colors.secondary} 0%, transparent 60%)`,
          opacity: opacity * 0.8,
          transform: `scale(${scale}) translate(${isPourPhase ? '0%' : '5%'}, ${isPourPhase ? '0%' : '10%'})`,
        }}
      />
      
      {/* Accent color field - smallest, dynamic position */}
      <div 
        className="absolute inset-0 transition-all duration-[1000ms] ease-out"
        style={{
          background: `radial-gradient(circle at 70% 40%, ${colors.accent} 0%, transparent 40%)`,
          opacity: opacity,
          transform: `scale(${scale * 0.8}) translate(${isPourPhase ? '0%' : '-10%'}, ${isPourPhase ? '0%' : '-5%'})`,
        }}
      />

      {/* Subtle texture overlay for depth */}
      <div 
        className="absolute inset-0 transition-opacity duration-[3000ms]"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.02) 0%, transparent 30%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.01) 0%, transparent 40%),
            radial-gradient(circle at 40% 40%, rgba(0,0,0,0.05) 0%, transparent 20%)
          `,
          opacity: isActive ? 1 : 0.5,
        }}
      />
    </div>
  );
}

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

function SettingsPage({
  onBack,
  settingsDraft,
  setSettingsDraft,
  handleSettingsSave,
  closeSettings,
  isBrewLog = false,
  brewingSettings,
  currentCoffeeSettings,
  currentGrindSize
}: {
  onBack: () => void,
  settingsDraft: any,
  setSettingsDraft: any,
  handleSettingsSave: (e: React.FormEvent) => void,
  closeSettings: () => void,
  isBrewLog?: boolean,
  brewingSettings?: {
    grindSize: number,
    coffeeAmount: number,
    waterRatio: number,
    totalWater: number
  },
  currentCoffeeSettings?: {
    amount: number,
    ratio: number
  },
  currentGrindSize?: number
}) {
  const { isDarkMode } = useTheme();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setSettingsDraft((d: any) => ({
          ...d,
          coffeeDetails: {
            ...d.coffeeDetails,
            image: imageData
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoffeeDetailChange = (field: string, value: string) => {
    setSettingsDraft((d: any) => ({
      ...d,
      coffeeDetails: {
        ...d.coffeeDetails,
        [field]: value
      }
    }));
  };

  useEffect(() => {
    // Debug: log dose, ratio, and calculation results whenever they change
    const dose = currentCoffeeSettings?.amount as number;
    const ratio = currentCoffeeSettings?.ratio as number;
    const brewPlan = calculateBrewTiming(currentGrindSize || 6, dose, ratio, 2);
    console.log(`SCROLL dose ${dose.toFixed(1)} brew ${ratio.toFixed(1)} | total water: ${Math.round(dose * ratio)} | total time: ${brewPlan.totalTime}`);
  }, [currentCoffeeSettings?.amount, currentCoffeeSettings?.ratio, currentGrindSize, 2]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="h-full flex flex-col w-full max-w-[430px] mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {isBrewLog ? 'Log Your Brew' : 'Save'}
          </h1>
          <button onClick={onBack} className={`h-11 px-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg text-sm font-medium text-center transition-colors hover:border-[#ff6700]`}>
            Back
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-6 overflow-y-auto">
          <form onSubmit={handleSettingsSave} className="space-y-8">
            {/* Coffee Photo */}
            <div className="flex items-center space-x-4">
              <label htmlFor="coffee-image-upload" className="w-20 h-20 rounded-lg flex items-center justify-center border border-dashed border-gray-400 cursor-pointer">
                {settingsDraft.coffeeDetails?.image ? (
                  <img src={settingsDraft.coffeeDetails.image} alt="Coffee" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-sm text-gray-400">Photo</span>
                )}
              </label>
              <input type="file" id="coffee-image-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex-1">
                <button type="button" onClick={() => document.getElementById('coffee-image-upload')?.click()} className="h-11 px-4 border border-gray-300 rounded-lg text-sm font-medium">Change Photo</button>
              </div>
            </div>
            
            {/* Current Settings - moved under photo and renamed */}
            {(currentCoffeeSettings || brewingSettings) && (
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Brew Recipe
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Coffee: </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {isBrewLog ? brewingSettings?.coffeeAmount : currentCoffeeSettings?.amount}g
                    </span>
                  </div>
                  <div>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ratio: </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      1:{isBrewLog ? brewingSettings?.waterRatio : currentCoffeeSettings?.ratio}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Name
                </label>
                <input type="text" name="name" value={settingsDraft.coffeeDetails?.name || ''} onChange={(e) => handleCoffeeDetailChange('name', e.target.value)} className={`w-full bg-transparent border-0 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-400'} focus:ring-0 focus:border-[#ff6700] py-2`} />
              </div>
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Roaster
                </label>
                <input type="text" name="roaster" value={settingsDraft.coffeeDetails?.roaster || ''} onChange={(e) => handleCoffeeDetailChange('roaster', e.target.value)} className={`w-full bg-transparent border-0 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-400'} focus:ring-0 focus:border-[#ff6700] py-2`} />
              </div>
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Roast Date
                </label>
                <input type="date" name="roastDate" value={settingsDraft.coffeeDetails?.roastDate || ''} onChange={(e) => handleCoffeeDetailChange('roastDate', e.target.value)} className={`w-full bg-transparent border-0 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-400'} focus:ring-0 focus:border-[#ff6700] py-2`} />
              </div>
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Notes
                </label>
                <textarea 
                  name="notes" 
                  value={settingsDraft.coffeeDetails?.notes || ''} 
                  onChange={(e) => handleCoffeeDetailChange('notes', e.target.value)} 
                  className={`w-full bg-transparent border-0 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-400'} focus:ring-0 focus:border-[#ff6700] py-2 resize-none`} 
                  rows={3}
                  placeholder="Add notes about this coffee..."
                />
              </div>
            </div>

            {/* Brew Notes (if applicable) */}
            {isBrewLog && (
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Brew Notes
                </label>
                <textarea name="brewNotes" value={settingsDraft.brewNotes || ''} onChange={(e) => setSettingsDraft({ ...settingsDraft, brewNotes: e.target.value })} className={`w-full bg-transparent border-0 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-400'} focus:ring-0 focus:border-[#ff6700] py-2 resize-none`} rows={3} />
              </div>
            )}
            
            <button type="submit" className={`w-full h-11 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg text-sm font-medium text-center transition-colors hover:border-[#ff6700]`}>
              Save
            </button>
          </form>
        </main>
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
  onBack,
  onDone,
  onSaveRecipe
}: any) {
  const { isDarkMode } = useTheme();
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

  // Check if the second pour is finished (step 3 completed)
  const isSecondPourFinished = elapsed >= (fullStepEndTimes[3] || 0);

  return (
    <div className={`min-h-screen flex flex-col relative ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
      style={{ minHeight: '100vh', minWidth: '100vw' }}>
      <div
        className="flex flex-col items-center justify-center w-full h-full"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      >
        {/* Scaled content wrapper for 1180x1980 fit */}
        <div
          style={{
            width: 1180,
            height: 1980,
            maxWidth: '100vw',
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
            overflow: 'hidden',
            padding: '1rem',
          }}
        >
          {/* Timers below instructions */}
          <div className="flex flex-col w-full max-w-[430px] mx-auto px-4 py-6 relative z-10">
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
              {/* Animated highlight box */}
              {(() => {
                // Dynamic step offset measurement for perfect highlight alignment
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
                        background: isDarkMode
                          ? 'linear-gradient(rgba(60,60,60,0.2), rgba(60,60,60,0.2)), #000'
                          : 'linear-gradient(rgba(120,120,120,0.08), rgba(120,120,120,0.08)), #F3F4F6',
                        boxShadow: isDarkMode ? '0 2px 8px #0002' : '0 2px 8px #0001',
                      }}
                    />
                    <div className="space-y-0.5 relative z-10">
                      {fullStepSequence.slice(0, -1).map((step: any, index: number) => {
                        const isActive = index === fullCurrentStep;
                        const isCompleted = elapsed >= (fullStepEndTimes[index] || 0);
                        const stepStart = index === 0 ? 0 : fullStepEndTimes[index - 1];
                        const stepEnd = fullStepEndTimes[index] || 0;
                        const stepDuration = Math.max(0, stepEnd - stepStart);
                        const stepElapsed = Math.max(0, elapsed - stepStart);
                        const stepProgress = stepDuration > 0 ? Math.min((stepElapsed / stepDuration) * 100, 100) : 0;
                        const targetWeight = extractTargetWeight(step.water);
                        const stepTextColor = isActive ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'text-gray-500' : 'text-gray-400');
                        return (
                          <div
                            key={index}
                            className="py-1 relative"
                            style={{ minHeight: 19 }}
                            ref={el => (stepRefs.current[index] = el)}
                          >
                            <div className={`flex flex-col justify-between p-2 h-full`}
                              style={{ transition: 'background 0.3s, box-shadow 0.3s, border 0.3s' }}
                            >
                              <div className="flex justify-between items-center">
                                <span
                                  className={
                                    isCompleted
                                      ? 'text-base'
                                      : isActive
                                      ? 'text-base'
                                      : 'text-base'
                                  }
                                  style={{
                                    color: isCompleted
                                      ? (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                                      : (isDarkMode ? '#fff' : '#000'),
                                    fontWeight: isActive ? 600 : 400
                                  }}
                                >
                                  {step.label}
                                </span>
                                <span
                                  className={
                                    isCompleted
                                      ? 'text-base'
                                      : isActive
                                      ? 'text-base'
                                      : 'text-base'
                                  }
                                  style={{
                                    color: isCompleted
                                      ? (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                                      : (isDarkMode ? '#fff' : '#000'),
                                    fontWeight: isActive ? 600 : 400
                                  }}
                                >
                                  {targetWeight || `${Math.round(stepDuration)}s`}
                                </span>
                              </div>
                              {/* Progress/Separator Line - now inside the step box */}
                              {index < fullStepSequence.length - 2 && (
                                <div className="relative w-full mt-0.5">
                                  <div 
                                    className="w-full h-[2px]"
                                    style={{
                                      backgroundImage: isCompleted 
                                        ? 'none'
                                        : `radial-gradient(circle, ${isDarkMode ? '#6B7280' : '#D1D5DB'} 1px, transparent 1px)`,
                                      backgroundColor: isCompleted ? '#E5E7EB' : 'transparent',
                                      backgroundSize: '8px 2px',
                                      backgroundRepeat: 'repeat-x'
                                    }}
                                  />
                                  {isActive && !isCompleted && (
                                    <div 
                                      className="absolute top-0 h-[2px] transition-all duration-100 ease-linear"
                                      style={{ 
                                        width: `${stepProgress}%`,
                                        background: '#ff6700',
                                        transformOrigin: step.label.includes('Wait') || step.label.includes('Drawdown') ? 'right' : 'left'
                                      }}
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

            {/* Buttons always below the step list */}
            <div className="mt-12 flex flex-col items-center justify-center w-full max-w-[430px]">
              <div className="flex w-full justify-between gap-4">
                <button
                  onClick={onBack}
                  className={`py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors ${isDarkMode ? 'text-white hover:bg-gray-900' : 'text-black hover:bg-gray-50'}`}
                >
                  Back
                </button>
                <button
                  onClick={onDone}
                  className={`py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors ${isDarkMode ? 'text-white hover:bg-gray-900' : 'text-black hover:bg-gray-50'}`}
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    if (timerActive && !timerPaused) {
                      handlePause();
                    } else {
                      handleResume();
                    }
                  }}
                  className={`py-3 px-8 flex-1 rounded-full text-base font-medium transition-colors ${isDarkMode ? 'text-white hover:bg-gray-900' : 'text-black hover:bg-gray-50'}`}
                  disabled={finished}
                >
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

function NotesPage({ onBack, dose, ratio }: { onBack: () => void, dose: number, ratio: number }) {
  const { isDarkMode } = useTheme();
  const [notes, setNotes] = useState<any[]>([]);
  const [currentNote, setCurrentNote] = useState({
    coffeeType: '',
    roaster: '',
    date: new Date().toISOString().split('T')[0],
    brand: '',
    notes: `Dose: ${dose}g, Ratio: 1:${ratio}`
  });
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('coffeeNotes') || '[]');
    setNotes(savedNotes);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote = {
      ...currentNote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('coffeeNotes', JSON.stringify(updatedNotes));
    
    // Reset form
    setCurrentNote({
      coffeeType: '',
      roaster: '',
      date: new Date().toISOString().split('T')[0],
      brand: '',
      notes: `Dose: ${dose}g, Ratio: 1:${ratio}`
    });
    
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  const handleDelete = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('coffeeNotes', JSON.stringify(updatedNotes));
  };

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="h-full flex flex-col w-full max-w-[430px] mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center p-4 pb-2 flex-shrink-0">
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Notes</h1>
          <button onClick={onBack} className={`h-11 px-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg text-sm font-medium text-center transition-colors hover:border-[#ff6700]`}>
            Back
          </button>
        </header>

        {/* Success Message */}
        {showSavedMessage && (
          <div className="mx-4 mb-4 p-3 bg-green-600 text-white rounded-lg text-center flex-shrink-0">
            Note saved successfully!
          </div>
        )}

        {/* Main Content - Scrollable */}
        <main className="flex-1 px-4 pb-4 overflow-y-auto space-y-6">
          {/* Add New Note Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Coffee Type
              </label>
              <input
                type="text"
                value={currentNote.coffeeType}
                onChange={(e) => setCurrentNote({ ...currentNote, coffeeType: e.target.value })}
                placeholder="e.g., Ethiopian Yirgacheffe"
                className={`w-full p-3 border rounded-lg text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Roaster
              </label>
              <input
                type="text"
                value={currentNote.roaster}
                onChange={(e) => setCurrentNote({ ...currentNote, roaster: e.target.value })}
                placeholder="e.g., Blue Bottle Coffee"
                className={`w-full p-3 border rounded-lg text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date
              </label>
              <input
                type="date"
                value={currentNote.date}
                onChange={(e) => setCurrentNote({ ...currentNote, date: e.target.value })}
                className={`w-full p-3 border rounded-lg text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-black'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Brand
              </label>
              <input
                type="text"
                value={currentNote.brand}
                onChange={(e) => setCurrentNote({ ...currentNote, brand: e.target.value })}
                placeholder="e.g., Giant Steps"
                className={`w-full p-3 border rounded-lg text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes
              </label>
              <textarea
                value={currentNote.notes}
                onChange={(e) => setCurrentNote({ ...currentNote, notes: e.target.value })}
                placeholder="Tasting notes, brewing observations, etc."
                rows={4}
                className={`w-full p-3 border rounded-lg text-sm resize-none ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
              />
            </div>

            <button 
              type="submit"
              className="w-full h-11 bg-[#ff6700] text-white rounded-lg text-sm font-medium hover:bg-[#e55a00] transition-colors"
            >
              Save Note
            </button>
          </form>

          {/* Saved Notes */}
          {notes.length > 0 && (
            <div className="space-y-4">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Saved Notes
              </h2>
              {notes.map((note) => (
                <div key={note.id} className={`p-4 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {note.coffeeType}
                    </h3>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className={`text-xs px-2 py-1 rounded ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                  <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p><span className="font-medium">Roaster:</span> {note.roaster}</p>
                    <p><span className="font-medium">Brand:</span> {note.brand}</p>
                    <p><span className="font-medium">Date:</span> {new Date(note.date).toLocaleDateString()}</p>
                    {note.notes && (
                      <p><span className="font-medium">Notes:</span> {note.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <main className="flex-1 flex flex-col w-full max-w-[430px] mx-auto px-4 pt-8">
        <button
          onClick={onBack}
          className="text-base font-medium text-black mb-8 self-start"
        >
          Back
        </button>
        <p className="text-base leading-relaxed mb-16 text-black">
          Pour Perfect is a tool by Origen, a small-batch coffee project shaped by a chance encounter in the Andes Mountains, generous people, and a lot of learning along the way. From a hillside farm in Colombia to a co-roasting space in New York, Origen is fueled by curiosity and community.<br /><br />
          I built this tool to help me dial in my Hario v60 morning routine. Adjust the setting and the timer will guide you through the pour step by step, take notes, and experiment. There's no one perfect pour—just small tweaks and honest attempts.
        </p>
        <span className="w-[25px] h-[25px] rounded-full bg-[#ff6700] self-center" />
      </main>
    </div>
  );
}

const BrewingApp: React.FC<{ onShowAbout?: () => void }> = ({ onShowAbout }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  // Load initial settings from localStorage or use defaults
  const loadSavedSettings = () => {
    const savedSettings = localStorage.getItem('coffeeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          amount: (parsed.amount >= 1 && parsed.amount <= 50) ? parsed.amount : 1.0,
          ratio: (parsed.ratio >= 1 && parsed.ratio <= 50) ? parsed.ratio : 1.0,
          bloomRatio: parsed.bloomRatio || 2
        };
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
    }
    return { amount: 1.0, ratio: 1.0, bloomRatio: 2 };
  };

  const [coffeeSettings, setCoffeeSettings] = useState<CoffeeSettings>(loadSavedSettings);
  const [grindSize, setGrindSize] = useState(6);
  const [coffeeOptions, setCoffeeOptions] = useState<number[]>(() => {
    const saved = localStorage.getItem('coffeeOptions');
    return saved ? JSON.parse(saved) : defaultCoffeeOptions;
  });
  const [ratioOptions, setRatioOptions] = useState<number[]>(() => {
    const saved = localStorage.getItem('ratioOptions');
    return saved ? JSON.parse(saved) : defaultRatioOptions;
  });

  const [showNotes, setShowNotes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showProPours, setShowProPours] = useState(false);
  const [showBrewTimer, setShowBrewTimer] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [showBrewLog, setShowBrewLog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const [settingsDraft, setSettingsDraft] = useState<{
    amount: number;
    ratio: number;
    coffeeOptions: number[];
    ratioOptions: number[];
    brewNotes?: string;
    generalNotes?: string;
    coffeeDetails?: {
      name: string;
      roaster: string;
      roastDate: string;
      origin: string;
      variety: string;
      process: string;
      elevation: string;
      image: string;
    };
  }>({
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
    coffeeSettings.bloomRatio
  );

  // Calculate step sequence - Updated for 4-phase recipe (bloom + 3 pours)
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
              completedStep.label === 'Third Pour' ||
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
          
          // Stop if finished and go back to homepage
          if (newElapsed >= totalTime) {
            setIsRunning(false);
            setShowBrewTimer(false);
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
    setShowCompletionPrompt(false);
    setShowBrewLog(false);
    handleTimerReset();
  };

  const handleLogExperience = () => {
    setShowCompletionPrompt(false);
    setShowBrewLog(true);
    // Prepare settings draft for brew logging
    setSettingsDraft({
      ...settingsDraft,
      brewNotes: '',
      coffeeDetails: {
        name: localStorage.getItem('coffeeDetails_name') || '',
        roaster: localStorage.getItem('coffeeDetails_roaster') || '',
        roastDate: localStorage.getItem('coffeeDetails_roastDate') || '',
        origin: localStorage.getItem('coffeeDetails_origin') || '',
        variety: localStorage.getItem('coffeeDetails_variety') || '',
        process: localStorage.getItem('coffeeDetails_process') || '',
        elevation: localStorage.getItem('coffeeDetails_elevation') || '',
        image: localStorage.getItem('coffeeDetails_image') || ''
      }
    });
  };

  const handleSkipLog = () => {
    setShowCompletionPrompt(false);
    setShowBrewTimer(false);
    handleTimerReset();
  };

  const handleSaveRecipe = () => {
    // Take user directly to save page
    setShowBrewTimer(false);
    setShowSettings(true);
    // Prepare settings draft for saving the recipe
    const currentTime = new Date().toISOString();
    setSettingsDraft({
      ...settingsDraft,
      brewNotes: `Recipe saved from timer at ${formatTime(elapsed)}`,
      coffeeDetails: {
        name: localStorage.getItem('coffeeDetails_name') || '',
        roaster: localStorage.getItem('coffeeDetails_roaster') || '',
        roastDate: localStorage.getItem('coffeeDetails_roastDate') || '',
        origin: localStorage.getItem('coffeeDetails_origin') || '',
        variety: localStorage.getItem('coffeeDetails_variety') || '',
        process: localStorage.getItem('coffeeDetails_process') || '',
        elevation: localStorage.getItem('coffeeDetails_elevation') || '',
        image: localStorage.getItem('coffeeDetails_image') || ''
      }
    });
  };

  const handleTimerDone = () => {
    // Go back to homepage when Done is clicked
    setShowBrewTimer(false);
    handleTimerReset();
  };

  const getStepInstruction = () => {
    if (isFinished) return 'Finished! Enjoy your coffee ☕';
    if (!showBrewTimer || !stepSequence[currentStep]) return `Target brew time: ${formatTime(brewingTimings.totalTime)}`;
    
    const step = stepSequence[currentStep];
    const targetWeight = step.water.match(/(\d+g)/);
    if (targetWeight) {
      return `Pour to ${targetWeight[0]}`;
    }

    if (step.label === 'Finish') {
      return `Done! Target time: ${formatTime(totalTime)}`;
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
    setCoffeeSettings(prev => ({ ...prev, amount }));
  };

  const handleRatioChange = (ratio: number) => {
    setCoffeeSettings(prev => ({ ...prev, ratio }));
  };

  // Helper functions for real-time editing
  const handleCoffeeInputChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      handleCoffeeAmountChange(numValue);
    }
  };

  const handleRatioInputChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      handleRatioChange(numValue);
    }
  };

  const incrementCoffee = (delta: number) => {
    const newAmount = Math.max(0.1, parseFloat((coffeeSettings.amount + delta).toFixed(1)));
    handleCoffeeAmountChange(newAmount);
  };

  const incrementRatio = (delta: number) => {
    const newRatio = Math.max(0.1, parseFloat((coffeeSettings.ratio + delta).toFixed(1)));
    handleRatioChange(newRatio);
  };

  const openSettings = () => {
    setSettingsDraft({
      ...settingsDraft,
      // Coffee details and general notes
      coffeeDetails: {
        name: localStorage.getItem('coffeeDetails_name') || '',
        roaster: localStorage.getItem('coffeeDetails_roaster') || '',
        roastDate: localStorage.getItem('coffeeDetails_roastDate') || '',
        origin: localStorage.getItem('coffeeDetails_origin') || '',
        variety: localStorage.getItem('coffeeDetails_variety') || '',
        process: localStorage.getItem('coffeeDetails_process') || '',
        elevation: localStorage.getItem('coffeeDetails_elevation') || '',
        image: localStorage.getItem('coffeeDetails_image') || ''
      },
      generalNotes: localStorage.getItem('generalNotes') || ''
    });
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showBrewLog) {
      // Save brew log
      const brewLog = {
        brewingSettings: {
          grindSize,
          coffeeAmount: coffeeSettings.amount,
          waterRatio: coffeeSettings.ratio,
          totalWater: brewingTimings.thirdPourTarget
        },
        brewNotes: settingsDraft.brewNotes || '',
        coffeeDetails: settingsDraft.coffeeDetails || {},
        createdAt: new Date()
      };
      
      // Save to localStorage for now (we'll update the database service later)
      const existingLogs = JSON.parse(localStorage.getItem('brewLogs') || '[]');
      existingLogs.unshift(brewLog);
      localStorage.setItem('brewLogs', JSON.stringify(existingLogs));
      
      // Also save coffee details to regular storage
      if (settingsDraft.coffeeDetails) {
        Object.entries(settingsDraft.coffeeDetails).forEach(([key, value]) => {
          localStorage.setItem(`coffeeDetails_${key}`, value as string);
        });
      }
      
      // Close brew log and return to home
      setShowBrewLog(false);
      setShowBrewTimer(false);
      handleTimerReset();
    } else {
      // Save coffee details and general notes (regular settings)
      if (settingsDraft.coffeeDetails) {
        Object.entries(settingsDraft.coffeeDetails).forEach(([key, value]) => {
          localStorage.setItem(`coffeeDetails_${key}`, value as string);
        });
      }
      
      // Save general notes
      if (settingsDraft.generalNotes !== undefined) {
        localStorage.setItem('generalNotes', settingsDraft.generalNotes);
      }
      
      // Close settings
      setShowSettings(false);
    }
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

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('coffeeSettings', JSON.stringify(coffeeSettings));
  }, [coffeeSettings]);

  useEffect(() => {
    // Debug: log dose, ratio, and calculation results whenever they change
    const dose = coffeeSettings.amount as number;
    const ratio = coffeeSettings.ratio as number;
    const brewPlan = calculateBrewTiming(grindSize, dose, ratio, coffeeSettings.bloomRatio);
    console.log(`SCROLL dose ${dose.toFixed(1)} brew ${ratio.toFixed(1)} | total water: ${Math.round(dose * ratio)} | total time: ${brewPlan.totalTime}`);
  }, [coffeeSettings.amount, coffeeSettings.ratio, grindSize, coffeeSettings.bloomRatio]);

  if (showInfo) {
    return <InfoPage onBack={() => setShowInfo(false)} />;
  }

  if (showCompletionPrompt) {
    return (
      <CompletionPrompt 
        onLogExperience={handleLogExperience}
        onSkip={handleSkipLog}
      />
    );
  }

  if (showSettings || showBrewLog) {
    return (
      <SettingsPage 
        onBack={showBrewLog ? handleBack : closeSettings} 
        settingsDraft={settingsDraft} 
        setSettingsDraft={setSettingsDraft} 
        handleSettingsSave={handleSettingsSave} 
        closeSettings={closeSettings}
        isBrewLog={showBrewLog}
        brewingSettings={showBrewLog ? {
          grindSize,
          coffeeAmount: coffeeSettings.amount,
          waterRatio: coffeeSettings.ratio,
          totalWater: brewingTimings.thirdPourTarget
        } : undefined}
        currentCoffeeSettings={!showBrewLog ? {
          amount: coffeeSettings.amount,
          ratio: coffeeSettings.ratio
        } : undefined}
        currentGrindSize={!showBrewLog ? grindSize : undefined}
      />
    );
  }

  if (showNotes) {
    return <NotesPage onBack={() => setShowNotes(false)} dose={coffeeSettings.amount} ratio={coffeeSettings.ratio} />;
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
        onDone={handleTimerDone}
        onSaveRecipe={handleSaveRecipe}
      />
    );
  }
  
  if (showAbout) {
    return <AboutPage onBack={() => setShowAbout(false)} />;
  }
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="h-full flex flex-col w-full max-w-[430px] mx-auto py-4 px-4 sm:px-6 md:px-8 relative">
        {/* Header with Title and Dark Mode Toggle */}
        <div className="flex items-center gap-3 mb-6 pt-4">
          <button 
            onClick={toggleDarkMode}
            className="w-[25px] h-[25px] rounded-full bg-[#ff6700] hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Toggle dark mode"
          />
          <h1 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Pour Perfect</h1>
        </div>

        {/* Main Content - Simplified Layout */}
        <main className="flex-1 space-y-6">
          {/* Target Time and Water Display - Moved above scrollers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center space-y-1">
              <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-black'}`}>Target Time</span>
              <div className={`h-12 w-full flex items-center justify-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <span className={`text-2xl font-normal ${isDarkMode ? 'text-white' : 'text-black'}`}>{formatTime(brewingTimings.totalTime)}</span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-black'}`}>Target Water</span>
              <div className={`h-12 w-full flex items-center justify-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <span className={`text-2xl font-normal ${isDarkMode ? 'text-white' : 'text-black'}`}>{Math.round(coffeeSettings.amount * coffeeSettings.ratio)}g</span>
              </div>
            </div>
          </div>

          {/* Coffee and Ratio Pickers */}
          <div className="grid grid-cols-2 gap-10 pb-1 px-2">
            {/* Coffee Amount Picker */}
            <div className="flex flex-col items-center">
              <AppleStylePicker
                value={coffeeSettings.amount}
                onChange={(amount) => setCoffeeSettings(prev => ({ ...prev, amount }))}
                isDarkMode={isDarkMode}
                label="Coffee (g)"
              />
            </div>
            
            {/* Coffee Ratio Picker */}
            <div className="flex flex-col items-center">
              <AppleStylePicker
                value={coffeeSettings.ratio}
                onChange={(ratio) => setCoffeeSettings(prev => ({ ...prev, ratio }))}
                isDarkMode={isDarkMode}
                label="Ratio"
              />
            </div>
          </div>

          {/* Grind Size Slider - Simple Design */}
          <div className="flex flex-col space-y-4">
            {/* Label and value display - moved above */}
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Grind Size</span>
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {grindSize.toFixed(1)}
              </span>
            </div>
            
            <div className="w-full relative">
              {/* Tick marks for whole integers */}
              <div className="absolute w-full -top-3 flex justify-between">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={i + 1} className="flex flex-col items-center">
                    <div 
                      className={`w-px h-2 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
                    />
                    <span className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Track container */}
              <div className="w-full relative h-1 mt-6">
                {/* Single track with gradient fill */}
                <div 
                  className="w-full h-1 rounded-full transition-all duration-150 ease-out"
                  style={{ 
                    background: `linear-gradient(to right, #ff6700 0%, #ff6700 ${(grindSize - 1) * 10}%, ${isDarkMode ? '#4b5563' : '#d1d5db'} ${(grindSize - 1) * 10}%, ${isDarkMode ? '#4b5563' : '#d1d5db'} 100%)`
                  }}
                />
                
                {/* Slider input */}
                <input
                  type="range"
                  min="1"
                  max="11"
                  step="0.1"
                  value={grindSize}
                  onChange={(e) => setGrindSize(Number(e.target.value))}
                  className="absolute top-0 w-full h-4 -mt-1.5 appearance-none cursor-pointer bg-transparent simple-slider"
                />
              </div>
            </div>
          </div>

          {/* Two Main Buttons - Styled like Time and Water displays */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowNotes(true)}
              className={`h-12 w-full flex items-center justify-center rounded-lg transition-colors hover:opacity-80 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <span className={`text-2xl font-normal ${isDarkMode ? 'text-white' : 'text-black'}`}>Notes</span>
            </button>
            
            <button
              onClick={handleStart}
              className={`h-12 w-full flex items-center justify-center rounded-lg transition-colors hover:opacity-80 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <span className={`text-2xl font-normal ${isDarkMode ? 'text-white' : 'text-black'}`}>Ready</span>
            </button>
          </div>
        </main>
        
        {/* Footer: Made by origen - Better positioning */}
        <div className="w-full flex justify-center mt-8 mb-2">
          <span className="text-xs text-gray-400">made by </span>
          <button
            onClick={() => setShowAbout(true)}
            className="text-xs font-semibold ml-1 text-[#ff6700] hover:underline focus:outline-none"
            style={{ color: '#ff6700' }}
          >
            Origen
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrewingApp;