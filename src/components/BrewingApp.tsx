import React, { useState, useRef, useEffect } from 'react';
// import GrindSelector from './GrindSelector'; // Assuming this is not used or will be re-evaluated
import { Notes } from './Notes';
import { CoffeeSettings } from '../types/brewing'; // BrewingPhase might not be needed
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';
import { ClipboardList, Info, Settings as SettingsIcon, X, Coffee, Sliders, SlidersHorizontal, Pencil } from 'lucide-react';
import ProPours from './ProPours';
import VerticalPicker from './VerticalPicker';
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

function CompletionPrompt({ 
  onLogExperience, 
  onSkip 
}: { 
  onLogExperience: () => void, 
  onSkip: () => void 
}) {
  return (
    <div className="antialiased h-screen flex items-center justify-center" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <div className="w-full max-w-md mx-auto text-center space-y-6" style={{ padding: '2rem' }}>
        <div className="space-y-4">
          <div className="text-6xl">☕</div>
          <h1 className="text-3xl font-bold text-white">Brew Complete!</h1>
          <p className="text-lg text-gray-400">
            How was your pour-over? Would you like to log this brewing experience?
          </p>
        </div>
        
        <div className="space-y-3">
          <button 
            className="btn-primary w-full" 
            onClick={onLogExperience}
          >
            Log This Brew
          </button>
          <button 
            className="btn-secondary w-full" 
            onClick={onSkip}
          >
            Skip for Now
          </button>
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
          <h1 className="text-3xl font-bold text-white">
            {isBrewLog ? 'Log Your Brew' : 'Coffee Details'}
          </h1>
          <button onClick={onBack} className="btn-secondary-outline">Back</button>
        </header>

        <form onSubmit={handleSettingsSave} className="flex-1 flex flex-col">
          {/* Main Content */}
          <main className="flex-1 space-y-6 overflow-y-auto">
            {/* Current Brewing Settings - Show for both regular details and brew log */}
            {(currentCoffeeSettings || brewingSettings) && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">
                  {isBrewLog ? 'Brewing Summary' : 'Current Settings'}
                </h2>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Coffee:</span>
                      <span className="text-white ml-2">
                        {isBrewLog ? brewingSettings?.coffeeAmount : currentCoffeeSettings?.amount}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ratio:</span>
                      <span className="text-white ml-2">
                        1:{isBrewLog ? brewingSettings?.waterRatio : currentCoffeeSettings?.ratio}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Grind:</span>
                      <span className="text-white ml-2">
                        {(() => {
                          const grind = isBrewLog ? brewingSettings?.grindSize : currentGrindSize;
                          return grind === 3 ? 'Fine' : 
                                 grind === 6 ? 'Medium' :
                                 grind === 7 ? 'Medium-coarse' : 'Coarse';
                        })()}
                      </span>
                    </div>
                    {isBrewLog && brewingSettings && (
                      <div>
                        <span className="text-gray-400">Total Water:</span>
                        <span className="text-white ml-2">{brewingSettings.totalWater}g</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Brewing Notes Section - Show for both regular details and brew log */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                {isBrewLog ? 'How was your brew?' : 'Brewing Notes'}
              </label>
              <p className="text-sm text-gray-400 mb-3">
                {isBrewLog 
                  ? 'Share your thoughts on taste, aroma, body, acidity, or what you\'d change next time...'
                  : 'Keep track of your brewing experiments, taste notes, and what works best with this coffee.'
                }
              </p>
              <textarea
                value={isBrewLog ? (settingsDraft.brewNotes || '') : (settingsDraft.generalNotes || '')}
                onChange={(e) => setSettingsDraft((d: any) => ({ 
                  ...d, 
                  [isBrewLog ? 'brewNotes' : 'generalNotes']: e.target.value 
                }))}
                placeholder={isBrewLog 
                  ? "How did it taste? What would you change next time?"
                  : "Record your brewing experiments, taste preferences, grind adjustments, etc."
                }
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 resize-none"
                rows={4}
              />
            </div>

            {/* Coffee Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                {isBrewLog ? 'Coffee Used' : 'Coffee Details'}
              </h2>
              {isBrewLog && (
                <p className="text-sm text-gray-400 mb-6">
                  Tell us about the coffee you just brewed with.
                </p>
              )}
              
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
              {isBrewLog ? 'Save Brew Log' : 'Save Coffee Details'}
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
      
      {/* New clean interface design */}
      <div className="w-full h-screen flex flex-col relative z-10" style={{ padding: '1.5rem 2rem' }}>
        {/* Top info bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Total time</div>
            <div className="text-2xl font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {formatTime(totalTime)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Time left</div>
            <div className="text-2xl font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {formatTime(Math.ceil(timeRemaining))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Current step</div>
            <div className="text-2xl font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {(() => {
                const currentStepStartTime = fullCurrentStep === 0 ? 0 : fullStepEndTimes[fullCurrentStep - 1];
                const currentStepEndTime = fullStepEndTimes[fullCurrentStep] || totalTime;
                const currentStepDuration = currentStepEndTime - currentStepStartTime;
                const currentStepElapsed = Math.max(0, elapsed - currentStepStartTime);
                const currentStepRemaining = Math.max(0, currentStepDuration - currentStepElapsed);
                return formatTimeSimple(Math.ceil(currentStepRemaining));
              })()}
            </div>
          </div>
        </div>

        {/* Step list */}
        <div className="flex-1 space-y-3 overflow-y-auto">
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
              <div key={index} className="relative">
                {/* Step content */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <span className={`text-xl font-medium ${isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-600'}`} 
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {step.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-medium ${isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-600'}`} 
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {targetWeight || formatTimeSimple(stepDuration)}
                    </span>
                  </div>
                </div>

                {/* Progress line */}
                <div className="absolute bottom-0 left-0 w-full h-px">
                  {/* Base line */}
                  <div 
                    className="w-full h-px"
                    style={{
                      backgroundImage: isCompleted 
                        ? 'none'
                        : `radial-gradient(circle, #4B5563 1px, transparent 1px)`,
                      backgroundColor: isCompleted ? '#ffffff' : 'transparent',
                      backgroundSize: '8px 1px',
                      backgroundRepeat: 'repeat-x'
                    }}
                  />
                  
                  {/* Progress overlay for current step */}
                  {isActive && !isCompleted && (
                    <div 
                      className="absolute top-0 h-px bg-white transition-all duration-100 ease-out"
                      style={{ 
                        width: `${stepProgress}%`,
                        transformOrigin: step.label === 'Wait' || step.label === 'Drawdown' ? 'right' : 'left'
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Buttons - Back and Start/Pause */}
        <footer className="mt-3 pb-3">
          <div className="flex items-center justify-center space-x-4 text-lg font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <button 
              onClick={onBack} 
              className="text-gray-400 hover:text-white transition-colors duration-150"
              aria-label="Back"
            >
              Back
            </button>
            <span className="text-gray-600">•</span>
            <button 
              className="text-white hover:text-gray-300 transition-colors duration-150"
              onClick={timerActive && !timerPaused ? handlePause : handleResume}
              disabled={finished}
            >
              {timerActive && !timerPaused ? 'Pause' : 'Start'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function HistoryPage({ onBack }: { onBack: () => void }) {
  const [brewLogs, setBrewLogs] = useState<any[]>([]);

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('brewLogs') || '[]');
    setBrewLogs(logs);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="antialiased h-screen" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
      <div className="h-full flex flex-col" style={{ padding: '1.5rem 0.8rem 0.4rem 0.8rem' }}>
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Brew History</h1>
            <p className="text-sm text-gray-400 mt-2">Your archived brewing experiences</p>
          </div>
          <button onClick={onBack} className="btn-secondary-outline">Back</button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {brewLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl opacity-50">📚</div>
              <h2 className="text-xl font-semibold text-gray-400">No brew logs yet</h2>
              <p className="text-gray-500">Complete a brew and log your experience to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {brewLogs.map((log, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                  {/* Coffee Image */}
                  <div className="flex-shrink-0">
                    {log.coffeeDetails?.image ? (
                      <img 
                        src={log.coffeeDetails.image} 
                        alt={log.coffeeDetails.name || 'Coffee'} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">☕</span>
                      </div>
                    )}
                  </div>

                  {/* Coffee Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {log.coffeeDetails?.name || 'Unnamed Coffee'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {log.coffeeDetails?.roaster && `${log.coffeeDetails.roaster} • `}
                      {formatDate(log.createdAt)}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{log.brewingSettings?.coffeeAmount}g</span>
                      <span>1:{log.brewingSettings?.waterRatio}</span>
                      <span>{log.brewingSettings?.totalWater}g water</span>
                    </div>
                    {log.brewNotes && (
                      <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                        {log.brewNotes}
                      </p>
                    )}
                  </div>

                  {/* Date Badge */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString('en-US', { 
                        weekday: 'short'
                      })}
                    </div>
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

const BrewingApp: React.FC<{ onShowAbout?: () => void }> = ({ onShowAbout }) => {
  // Load initial settings from localStorage or use defaults
  const loadSavedSettings = () => {
    const savedSettings = localStorage.getItem('coffeeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          amount: parsed.amount || 20,
          ratio: parsed.ratio || 16,
          bloomRatio: parsed.bloomRatio || 2
        };
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
    }
    return { amount: 20, ratio: 16, bloomRatio: 2 };
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
            setShowCompletionPrompt(true);
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
    return <HistoryPage onBack={() => setShowNotes(false)} />;
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
    <div className="min-h-screen bg-black text-white">
      <div className="h-full flex flex-col" style={{ padding: '1.5rem 0.8rem 0.4rem 0.8rem' }}>
        {/* Main Content - Optimized spacing */}
        <main className="flex-1 space-y-6">
          {/* Coffee Amount and Ratio Selection */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Coffee</div>
              <VerticalPicker
                items={Array.from({ length: 41 }, (_, i) => i + 10)}
                value={coffeeSettings.amount}
                onChange={handleCoffeeAmountChange}
                unit="g"
                hasDecimals={true}
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Ratio</div>
              <VerticalPicker
                items={Array.from({ length: 41 }, (_, i) => i + 10)}
                value={coffeeSettings.ratio}
                onChange={handleRatioChange}
                unit=":1"
                hasDecimals={true}
              />
            </div>
          </div>

          {/* Total Water Amount */}
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">Total Water</div>
            <div className="text-3xl font-semibold text-white">
              {brewingTimings.thirdPourTarget}g
            </div>
          </div>

          {/* Grind Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3">Grind</h2>
            <div className="grid grid-cols-4 gap-3">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2 text-center">Brew Time</h3>
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
              <h3 className="text-xs font-medium text-gray-400 mb-2 text-center">Total Water</h3>
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

          {/* Info and Ready Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={onShowAbout}
              className="btn-primary h-16 text-xl font-medium"
              type="button"
              aria-label="Info"
            >
              Info
            </button>
            <button 
              className="btn-primary h-16 text-xl font-medium"
              onClick={handleStart}
            >
              Ready
            </button>
          </div>

          {/* Add Details and Past Brews Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openSettings}
              className="btn-primary h-24 text-lg font-medium"
              type="button"
              aria-label="Add Details"
            >
              Add Details
            </button>
            <button 
              onClick={() => setShowNotes(true)}
              className="btn-primary h-24 text-lg font-medium"
              aria-label="Past Brews"
            >
              Past Brews
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BrewingApp;

// Removed mapGrindStringToValue as it's not used after GrindSelector removal
// Ensure all imports are used or remove them.
// Review any remaining console.logs or commented out code for cleanup.