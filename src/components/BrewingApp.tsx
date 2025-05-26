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

  return (
    <div className="antialiased h-screen" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <div className="h-full flex flex-col" style={{ padding: '2rem 4rem' }}>
        {/* Header - matching home page */}
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Coffee Details</h1>
          <button onClick={onBack} className="btn-secondary-outline">Back</button>
        </header>

        <form onSubmit={handleSettingsSave} className="flex-1 flex flex-col">
          {/* Main Content - Coffee Details Only */}
          <main className="flex-1 space-y-6 overflow-y-auto">
            {/* Coffee Details Section */}
            <div>
              <p className="text-sm text-gray-400 mb-6">
                Track details about your current coffee beans. This information helps you remember what works best for different origins and roasts.
              </p>
              
              {/* Coffee Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Coffee Photo</label>
                <div className="flex items-center space-x-4">
                  {settingsDraft.coffeeDetails?.image && (
                    <img 
                      src={settingsDraft.coffeeDetails.image} 
                      alt="Coffee" 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="coffee-image-upload"
                    />
                    <label 
                      htmlFor="coffee-image-upload"
                      className="btn-secondary inline-block cursor-pointer"
                    >
                      {settingsDraft.coffeeDetails?.image ? 'Change Photo' : 'Add Photo'}
                    </label>
                    {settingsDraft.coffeeDetails?.image && (
                      <button
                        type="button"
                        onClick={() => handleCoffeeDetailChange('image', '')}
                        className="ml-2 text-gray-400 hover:text-white text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Coffee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Name
                    <span className="text-xs text-gray-500 block">Producer or blend name</span>
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.coffeeDetails?.name || ''}
                    onChange={(e) => handleCoffeeDetailChange('name', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="e.g. Blue Mountain Reserve"
                  />
                </div>

                {/* Roaster */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Roaster
                    <span className="text-xs text-gray-500 block">Who roasted it</span>
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.coffeeDetails?.roaster || ''}
                    onChange={(e) => handleCoffeeDetailChange('roaster', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="e.g. Local Coffee Co."
                  />
                </div>

                {/* Roast Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Roast Date
                    <span className="text-xs text-gray-500 block">Important for freshness</span>
                  </label>
                  <input
                    type="date"
                    value={settingsDraft.coffeeDetails?.roastDate || ''}
                    onChange={(e) => handleCoffeeDetailChange('roastDate', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                </div>

                {/* Origin */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Origin
                    <span className="text-xs text-gray-500 block">Country / Region / Farm</span>
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.coffeeDetails?.origin || ''}
                    onChange={(e) => handleCoffeeDetailChange('origin', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="e.g. Jamaica, Blue Mountains"
                  />
                </div>

                {/* Variety */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Variety
                    <span className="text-xs text-gray-500 block">Coffee plant variety</span>
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.coffeeDetails?.variety || ''}
                    onChange={(e) => handleCoffeeDetailChange('variety', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="e.g. Caturra, Geisha, Bourbon"
                  />
                </div>

                {/* Process */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Process
                    <span className="text-xs text-gray-500 block">How beans were processed</span>
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.coffeeDetails?.process || ''}
                    onChange={(e) => handleCoffeeDetailChange('process', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="e.g. Washed, Natural, Honey"
                  />
                </div>

                {/* Elevation */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Elevation
                    <span className="text-xs text-gray-500 block">Growing altitude in meters or feet</span>
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.coffeeDetails?.elevation || ''}
                    onChange={(e) => handleCoffeeDetailChange('elevation', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    placeholder="e.g. 1,200m or 4,000ft"
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Footer - matching home page */}
          <footer className="mt-6 space-y-3">
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Save Coffee Details
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={closeSettings}
            >
              Cancel
            </button>
          </footer>
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
    <div className="text-white min-h-screen flex flex-col relative" style={{ backgroundColor: '#000000', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Meditative Color Field Visualization */}
      <MeditativeColorField 
        currentStep={fullCurrentStep}
        stepProgress={currentStepProgress}
        isActive={timerActive}
        stepLabel={fullStepSequence[fullCurrentStep]?.label || ''}
      />
      
      {/* OPTIMIZED: Removed padding, max width, adjusted spacing for 2556x1179 */}
      <div className="w-full h-screen flex flex-col relative z-10" style={{ padding: '2rem 4rem' }}>
        {/* Header - Reduced margin */}
        <header className="mb-4">
          <button 
            onClick={onBack} 
            className="text-gray-400 hover:text-white text-lg font-medium"
            aria-label="Back"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Back
          </button>
        </header>

        {/* Large Timer Display - Reduced margin */}
        <div className="text-center mb-6">
          <div className="text-5xl font-medium text-white font-roboto-mono tracking-tight">
            {formatTime(Math.ceil(timeRemaining))}
          </div>
        </div>

        {/* Vertical Step List - Optimized for landscape display */}
        <div className="flex-1 space-y-2 overflow-y-auto">
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
                {/* 3-Column Grid Layout - Reduced padding */}
                <div className="grid grid-cols-3 text-center items-center py-2 relative">
                  {/* Left: Step name */}
                  <div className="text-left">
                    <span className="text-xl font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {step.label}
                    </span>
                  </div>

                  {/* Center: Target weight */}
                  <div>
                    <span className="text-xl font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {targetWeight}
                    </span>
                  </div>

                  {/* Right: Time - Show step countdown for active step, full duration for others */}
                  <div className="text-right">
                    <span className="text-xl font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
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

        {/* Bottom Button - Reduced margin */}
        <footer className="mt-6 pb-4">
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
      // Coffee details only
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
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save coffee details only
    if (settingsDraft.coffeeDetails) {
      Object.entries(settingsDraft.coffeeDetails).forEach(([key, value]) => {
        localStorage.setItem(`coffeeDetails_${key}`, value);
      });
    }
    
    // Close settings
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
    <div className="antialiased h-screen" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      {/* REMOVED: container mx-auto px-4 py-4 max-w-md - now full width/height */}
      <div className="h-full flex flex-col" style={{ padding: '2rem 4rem' }}>
        {/* Header - Reduced margin */}
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Pour Perfect</h1>
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

        {/* Main Content - Optimized spacing */}
        <main className="flex-1 space-y-4">
          {/* Coffee Section - Now Editable */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Coffee</h2>
            <div className="relative">
              <div className="selected-card flex items-center">
                <button
                  type="button"
                  className="absolute left-2 text-gray-400 hover:text-white z-10 text-lg"
                  onClick={() => incrementCoffee(-0.1)}
                >
                  &minus;
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  value={coffeeSettings.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow any input while typing, validate on blur
                    if (value === '' || !isNaN(parseFloat(value))) {
                      const tempSettings = { ...coffeeSettings, amount: value === '' ? 0 : parseFloat(value) || coffeeSettings.amount };
                      setCoffeeSettings(tempSettings);
                    }
                  }}
                  onBlur={(e) => {
                    const numValue = parseFloat(e.target.value);
                    if (isNaN(numValue) || numValue <= 0) {
                      // Reset to previous valid value if invalid
                      setCoffeeSettings({ ...coffeeSettings });
                    } else {
                      handleCoffeeInputChange(e.target.value);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-transparent text-center text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded no-spinners"
                  style={{ 
                    padding: '0.75rem 3rem',
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2 text-gray-400 hover:text-white z-10 text-lg"
                  onClick={() => incrementCoffee(0.1)}
                >
                  +
                </button>
                <span className="absolute right-8 text-gray-400 text-sm pointer-events-none">g</span>
              </div>
            </div>
          </div>

          {/* Ratio Section - Now Editable */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Ratio</h2>
            <div className="relative">
              <div className="selected-card flex items-center">
                <button
                  type="button"
                  className="absolute left-2 text-gray-400 hover:text-white z-10 text-lg"
                  onClick={() => incrementRatio(-0.1)}
                >
                  &minus;
                </button>
                <span className="absolute left-8 text-gray-400 text-sm pointer-events-none z-5">1:</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={coffeeSettings.ratio}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow any input while typing, validate on blur
                    if (value === '' || !isNaN(parseFloat(value))) {
                      const tempSettings = { ...coffeeSettings, ratio: value === '' ? 0 : parseFloat(value) || coffeeSettings.ratio };
                      setCoffeeSettings(tempSettings);
                    }
                  }}
                  onBlur={(e) => {
                    const numValue = parseFloat(e.target.value);
                    if (isNaN(numValue) || numValue <= 0) {
                      // Reset to previous valid value if invalid
                      setCoffeeSettings({ ...coffeeSettings });
                    } else {
                      handleRatioInputChange(e.target.value);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-transparent text-center text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded no-spinners"
                  style={{ 
                    padding: '0.75rem 3rem',
                    paddingLeft: '4rem',
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2 text-gray-400 hover:text-white z-10 text-lg"
                  onClick={() => incrementRatio(0.1)}
                >
                  +
                </button>
              </div>
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

        {/* Footer - Reduced margin */}
        <footer className="mt-6">
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