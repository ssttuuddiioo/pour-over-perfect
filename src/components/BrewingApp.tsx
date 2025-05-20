import React, { useState, useRef, useEffect } from 'react';
import GrindSelector from './GrindSelector';
// import BrewingTimer from './BrewingTimer'; // Removed import
import { Notes } from './Notes';
import { BrewingPhase, CoffeeSettings } from '../types/brewing';
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';
import { ClipboardList, Info, Settings as SettingsIcon, X, Coffee, Sliders, SlidersHorizontal } from 'lucide-react';
import ProPours from './ProPours';
import FlavorEQ from './FlavorEQ';

const defaultCoffeeOptions = [15, 20, 25, 30];
const defaultRatioOptions = [15, 16, 17, 18];

// Add chime audio refs at the top of BrewingApp
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Brewing Method</label>
            <div className="flex gap-2">
              <button
                className={`btn flex-1 ${settingsDraft.brewingMethod === 'v60' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSettingsDraft((d: any) => ({ ...d, brewingMethod: 'v60' }))}
              >
                V60
              </button>
              <button
                className={`btn flex-1 ${settingsDraft.brewingMethod === 'frenchPress' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSettingsDraft((d: any) => ({ ...d, brewingMethod: 'frenchPress' }))}
              >
                French Press
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
  onBack,
  isFlavorEQActive
}: any) {
  // Get contextual instructions based on current step
  const getContextualInstructions = () => {
    if (!fullStepSequence[fullCurrentStep]) return "";
    const currentStep = fullStepSequence[fullCurrentStep];
    const stepDuration = currentStep.duration;
    const stepEndTime = fullStepEndTimes[fullCurrentStep];
    const timeRemaining = Math.max(0, stepEndTime - elapsed);
    
    if (currentStep.label === 'Bloom to') {
      return `Pour ${currentStep.water} of water quickly (${formatTime(stepDuration)}). Saturate all grounds and stir gently to ensure even extraction.`;
    } else if (currentStep.label === 'Pour to') {
      return `Pour slowly to ${currentStep.water} total (${formatTime(stepDuration)}). Use spiral motions from center outward to maintain even extraction.`;
    } else if (currentStep.label === 'Wait') {
      return `Allow coffee to drain for ${formatTime(stepDuration)}. This helps with even extraction before the next pour.`;
    } else if (currentStep.label === 'Drawdown') {
      return `Final drain (${formatTime(stepDuration)}). Your brew is almost ready!`;
    } else if (currentStep.label === 'Total') {
      return `All done! Total brew time: ${formatTime(fullStepEndTimes[fullStepEndTimes.length - 2])}. Enjoy your perfectly brewed coffee.`;
    }
    return "";
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-10">
        <div className="max-w-sm mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className={`text-xl font-mono font-bold ${isFlavorEQActive ? 'text-green-400' : 'text-blue-500'}`}>
              {formatTime(Math.floor(elapsed))}
              {isFlavorEQActive && (
                <span className="text-[10px] font-normal ml-1 px-1 py-0.5 rounded bg-green-900/40 text-green-300">EQ</span>
              )}
            </div>
            
            <div className="text-sm font-medium text-gray-200 flex-1 text-right truncate ml-3">
              {getStepInstruction()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="card p-4 mt-12">
        {/* Start Button with instructions (moved to top and condensed) */}
        {!timerActive && elapsed === 0 && (
          <div className="mb-4 bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-sm font-medium">Ready to brew</h3>
              <button 
                className="btn btn-primary py-1 px-4 text-sm"
                onClick={handleResume}
              >
                Start
              </button>
            </div>
          </div>
        )}
      
        {/* Instruction Card (shows at top after starting) */}
        {timerActive && (
          <div className={`${isFlavorEQActive ? 'bg-gradient-to-r from-gray-800 to-green-900/40' : 'bg-gray-800'} rounded-[4px] p-3 mb-4 sticky top-0 z-10`}>
            <h3 className={`text-sm font-medium ${isFlavorEQActive ? 'text-green-300' : 'text-gray-400'} mb-1`}>Instructions</h3>
            <p className="text-white">{getContextualInstructions()}</p>
          </div>
        )}
        
        {/* Brew Steps List - show all steps */}
        <div className="flex flex-col gap-2 mb-6">
          {fullStepSequence.map((step: any, i: number) => {
            const stepStart = i === 0 ? 0 : fullStepEndTimes[i - 1];
            const stepEnd = fullStepEndTimes[i];
            const progress = Math.max(0, Math.min(100, ((elapsed - stepStart) / (stepEnd - stepStart)) * 100));
            
            // Add a highlight class for the current step
            const isCurrentStep = i === fullCurrentStep;
            
            // Determine background color based on step type
            let bgColorClass = 'bg-gray-800';
            if (step.label.includes('Pour') || step.label.includes('Bloom')) {
              bgColorClass = isFlavorEQActive 
                ? 'bg-gradient-to-r from-blue-900 to-green-900' 
                : 'bg-blue-900/60';
            } else if (step.label === 'Wait' || step.label === 'Drawdown') {
              bgColorClass = 'bg-amber-500';
            }
            
            // Determine progress bar color
            const progressBarColor = step.label.includes('Pour') || step.label.includes('Bloom') 
              ? isFlavorEQActive ? 'bg-gradient-to-r from-blue-400 to-green-400' : 'bg-blue-500' 
              : step.label === 'Wait' || step.label === 'Drawdown' 
                ? 'bg-amber-400' 
                : 'bg-blue-500';
            
            // Add opacity classes with transition
            const opacityClass = isCurrentStep ? 'opacity-100' : 'opacity-75';

            return (
              <div
                key={i}
                className={`flex flex-col ${bgColorClass} rounded-[4px] px-4 py-2 font-bold ${isCurrentStep ? 'border-2 border-white' : ''} ${opacityClass} transition-opacity duration-300`}
                style={{ minHeight: 40 }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>
                      {step.label === 'Pour to' 
                        ? `Pour to ${step.water}`
                        : step.label === 'Wait'
                        ? 'Wait'
                        : step.label === 'Drawdown'
                        ? 'Drawdown'
                        : step.label === 'Bloom to'
                        ? `Bloom to ${step.water}`
                        : step.label}
                    </span>
                    {step.emoji && <span role="img" aria-label={step.label}>{step.emoji}</span>}
                  </div>
                  <span>{formatTime(stepEnd)}</span>
                </div>
                <div className="w-full h-1 mt-2 bg-gray-700 rounded-[4px] overflow-hidden">
                  <div
                    className={`h-full ${progressBarColor}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2">
          <button 
            className={`btn flex-1 flex items-center justify-center gap-2 ${
              timerActive && !timerPaused ? (isFlavorEQActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary') : 'btn-secondary'
            }`}
            onClick={handlePause}
            disabled={!timerActive || timerPaused}
            aria-label="Pause"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
          <button 
            className={`btn flex-1 flex items-center justify-center gap-2 ${
              timerPaused ? (isFlavorEQActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary') : 'btn-secondary'
            }`}
            onClick={handleResume}
            disabled={!timerPaused}
            aria-label="Play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Add FrenchPressTimerPage component
function FrenchPressTimerPage({
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
  isFlavorEQActive
}: any) {
  // Get contextual instructions based on current step
  const getContextualInstructions = () => {
    if (!fullStepSequence[fullCurrentStep]) return "";
    const currentStep = fullStepSequence[fullCurrentStep];
    const stepDuration = currentStep.duration;
    const stepEndTime = fullStepEndTimes[fullCurrentStep];
    const timeRemaining = Math.max(0, stepEndTime - elapsed);
    
    if (currentStep.label === 'Bloom') {
      return `Pour ${currentStep.water} of water (94°C) in a circular motion to saturate all grounds`;
    } else if (currentStep.label === 'Pour') {
      return `Pour remaining water (94°C) in a circular motion`;
    } else if (currentStep.label === 'Stir') {
      return `Stir gently to ensure even extraction`;
    } else if (currentStep.label === 'Wait') {
      return `Wait for extraction (${formatTime(stepDuration)})`;
    } else if (currentStep.label === 'Press') {
      return `Press the plunger down slowly and steadily`;
    } else if (currentStep.label === 'Serve') {
      return `Pour and serve immediately`;
    }
    return "";
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-10">
        <div className="max-w-sm mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className={`text-xl font-mono font-bold ${isFlavorEQActive ? 'text-green-400' : 'text-blue-500'}`}>
              {formatTime(Math.floor(elapsed))}
              {isFlavorEQActive && (
                <span className="text-[10px] font-normal ml-1 px-1 py-0.5 rounded bg-green-900/40 text-green-300">EQ</span>
              )}
            </div>
            
            <div className="text-sm font-medium text-gray-200 flex-1 text-right truncate ml-3">
              {getStepInstruction()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card p-4 mt-12">
        {/* Start Button */}
        {!timerActive && elapsed === 0 && (
          <div className="mb-4 bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-sm font-medium">Ready to brew</h3>
              <button 
                className="btn btn-primary py-1 px-4 text-sm"
                onClick={handleResume}
              >
                Start
              </button>
            </div>
          </div>
        )}
      
        {/* Instruction Card */}
        {timerActive && (
          <div className={`${isFlavorEQActive ? 'bg-gradient-to-r from-gray-800 to-green-900/40' : 'bg-gray-800'} rounded-[4px] p-3 mb-4 sticky top-0 z-10`}>
            <h3 className={`text-sm font-medium ${isFlavorEQActive ? 'text-green-300' : 'text-gray-400'} mb-1`}>Instructions</h3>
            <p className="text-white">{getContextualInstructions()}</p>
          </div>
        )}
        
        {/* Brew Steps List */}
        <div className="flex flex-col gap-2 mb-6">
          {fullStepSequence.map((step: any, i: number) => {
            const stepStart = i === 0 ? 0 : fullStepEndTimes[i - 1];
            const stepEnd = fullStepEndTimes[i];
            const progress = Math.max(0, Math.min(100, ((elapsed - stepStart) / (stepEnd - stepStart)) * 100));
            const isCurrentStep = i === fullCurrentStep;
            
            // Determine background color based on step type
            let bgColorClass = 'bg-gray-800';
            if (step.label === 'Pour' || step.label === 'Bloom') {
              bgColorClass = isFlavorEQActive 
                ? 'bg-gradient-to-r from-blue-900 to-green-900' 
                : 'bg-blue-900/60';
            } else if (step.label === 'Wait') {
              bgColorClass = 'bg-amber-500';
            } else if (step.label === 'Stir' || step.label === 'Press') {
              bgColorClass = 'bg-purple-900/60';
            }
            
            // Determine progress bar color
            const progressBarColor = step.label === 'Pour' || step.label === 'Bloom'
              ? isFlavorEQActive ? 'bg-gradient-to-r from-blue-400 to-green-400' : 'bg-blue-500'
              : step.label === 'Wait'
                ? 'bg-amber-400'
                : step.label === 'Stir' || step.label === 'Press'
                  ? 'bg-purple-400'
                  : 'bg-blue-500';
            
            const opacityClass = isCurrentStep ? 'opacity-100' : 'opacity-75';

            return (
              <div
                key={i}
                className={`flex flex-col ${bgColorClass} rounded-[4px] px-4 py-2 font-bold ${isCurrentStep ? 'border-2 border-white' : ''} ${opacityClass} transition-opacity duration-300`}
                style={{ minHeight: 40 }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{step.label}</span>
                    {step.emoji && <span role="img" aria-label={step.label}>{step.emoji}</span>}
                  </div>
                  <span>{formatTime(stepEnd)}</span>
                </div>
                <div className="w-full h-1 mt-2 bg-gray-700 rounded-[4px] overflow-hidden">
                  <div
                    className={`h-full ${progressBarColor}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2">
          <button 
            className={`btn flex-1 flex items-center justify-center gap-2 ${
              timerActive && !timerPaused ? (isFlavorEQActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary') : 'btn-secondary'
            }`}
            onClick={handlePause}
            disabled={!timerActive || timerPaused}
            aria-label="Pause"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
          <button 
            className={`btn flex-1 flex items-center justify-center gap-2 ${
              timerPaused ? (isFlavorEQActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary') : 'btn-secondary'
            }`}
            onClick={handleResume}
            disabled={!timerPaused}
            aria-label="Play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

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
      // Ensure bloomRatio exists, default if not
      return { ...parsed, bloomRatio: parsed.bloomRatio || 2 }; 
    }
    return { amount: 15, ratio: 15, bloomRatio: 2 }; // Added bloomRatio
  });
  // Keep track of original settings separately from flavor-adjusted settings
  const [originalSettings, setOriginalSettings] = useState<CoffeeSettings>({
    amount: coffeeSettings.amount,
    ratio: coffeeSettings.ratio,
    bloomRatio: 2
  });
  const [showNotes, setShowNotes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showProPours, setShowProPours] = useState(false);
  const [showBrewTimer, setShowBrewTimer] = useState(false);
  const [showFlavorEQ, setShowFlavorEQ] = useState(false);
  const [isFlavorEQActive, setIsFlavorEQActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('isFlavorEQActive');
    return saved ? JSON.parse(saved) : false;
  });
  const [flavorPrefs, setFlavorPrefs] = useState({
    floral: 50,
    acidity: 50,
    fruitiness: 50,
    bitterness: 50
  });
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
  const [brewingMethod, setBrewingMethod] = useState('v60');
  const [isFrenchPress, setIsFrenchPress] = useState(false);
  const [fullStepSequence, setFullStepSequence] = useState<any[]>([]);
  const [fullStepEndTimes, setFullStepEndTimes] = useState<number[]>([]);
  const [fullCurrentStep, setFullCurrentStep] = useState(0);
  
  const brewingTimings = calculateBrewTiming(
    grindSize, 
    coffeeSettings.amount, 
    isFlavorEQActive ? coffeeSettings.ratio : originalSettings.ratio, 
    isFlavorEQActive ? coffeeSettings.bloomRatio : originalSettings.bloomRatio,
    isFlavorEQActive ? flavorPrefs.acidity : 50,
    isFlavorEQActive ? flavorPrefs.fruitiness : 50
  );

  // Calculate original brew timings for comparison when EQ is active
  const originalBrewingTimings = isFlavorEQActive ? calculateBrewTiming(
    grindSize,
    coffeeSettings.amount,
    originalSettings.ratio,
    originalSettings.bloomRatio,
    50, // default acidity
    50  // default fruitiness
  ) : brewingTimings;

  // Update step sequence when brewing timings change
  useEffect(() => {
    if (!isFrenchPress) {
      const newStepSequence = [
        { label: 'Bloom to', color: 'text-sky-400', water: `${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
        { label: 'Pour to', color: 'text-sky-400', water: `${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
        { label: 'Wait', color: 'text-amber-500', water: '', duration: brewingTimings.restDuration },
        { label: 'Pour to', color: 'text-sky-400', water: `${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
        { label: 'Wait', color: 'text-amber-500', water: '', duration: brewingTimings.secondRestDuration },
        { label: 'Pour to', color: 'text-sky-400', water: `${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
        { label: 'Drawdown', color: 'text-amber-500', water: '', duration: brewingTimings.drawdownDuration },
        { label: 'Total', color: 'text-gray-200', water: '', duration: 0, emoji: '☕' }
      ];
      setFullStepSequence(newStepSequence);
      
      // Calculate step end times
      const newStepEndTimes = newStepSequence.reduce((arr, step, i) => {
        arr.push((arr[i - 1] || 0) + (step.duration || 0));
        return arr;
      }, [] as number[]);
      setFullStepEndTimes(newStepEndTimes);
    }
  }, [brewingTimings, isFrenchPress]);

  // Update current step based on elapsed time
  useEffect(() => {
    if (fullStepEndTimes.length > 0) {
      const currentStepIndex = fullStepEndTimes.findIndex(end => elapsed < end);
      setFullCurrentStep(currentStepIndex === -1 ? fullStepSequence.length - 1 : currentStepIndex);
    }
  }, [elapsed, fullStepEndTimes, fullStepSequence.length]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (timerActive && !timerPaused && !finished) {
      startTimeRef.current = Date.now();
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        if (startTimeRef.current !== null) {
          const newElapsed = accumulatedElapsedRef.current + (currentTime - startTimeRef.current) / 1000;
          setElapsed(newElapsed);
          
          // Find current step
          const currentStepIndex = fullStepEndTimes.findIndex(endTime => newElapsed < endTime);
          if (currentStepIndex !== -1) {
            setFullCurrentStep(currentStepIndex);
          } else {
            setFullCurrentStep(fullStepSequence.length - 1);
            setFinished(true);
            setTimerActive(false);
          }
        }
      }, 100);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerActive, timerPaused, finished, fullStepEndTimes, fullStepSequence.length]);

  // Start, Pause, Resume, Reset logic for real-world clock
  const handleStart = () => {
    // Reset timer state
    setTimerActive(false);
    setTimerPaused(false);
    setFinished(false);
    setElapsed(0);
    setFullCurrentStep(0);
    accumulatedElapsedRef.current = 0;
    startTimeRef.current = null;
    
    // Update step sequence based on brewing method
    if (isFrenchPress) {
      setFullStepSequence([
        { label: 'Preheat', duration: 45, instruction: 'Pour hot water into the press and let it sit for 45 seconds, then discard' },
        { label: 'Add Coffee', duration: 15, instruction: `Add ${coffeeSettings.amount}g of ground coffee to the press` },
        { label: 'Bloom', duration: 45, instruction: `Pour ${Math.round(coffeeSettings.amount * coffeeSettings.ratio * 0.25)}g of water (94°C) to saturate the grounds` },
        { label: 'Stir', duration: 15, instruction: 'Gently stir to break up the crust and ensure even extraction' },
        { label: 'Pour', duration: 45, instruction: `Add remaining ${Math.round(coffeeSettings.amount * coffeeSettings.ratio * 0.75)}g of water and stir again` },
        { label: 'Steep', duration: 300, instruction: 'Allow coffee to steep for 5 minutes' },
        { label: 'Press', duration: 45, instruction: 'Press the plunger down slowly and evenly, taking about 45 seconds' },
        { label: 'Serve', duration: 30, instruction: 'Pour and serve immediately to prevent over-extraction', emoji: '☕' }
      ]);
    } else {
      setFullStepSequence([
        { label: 'Bloom to', water: `${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
        { label: 'Pour to', water: `${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
        { label: 'Wait', duration: brewingTimings.restDuration },
        { label: 'Pour to', water: `${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
        { label: 'Wait', duration: brewingTimings.secondRestDuration },
        { label: 'Pour to', water: `${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
        { label: 'Drawdown', duration: brewingTimings.drawdownDuration },
        { label: 'Total', duration: 0, emoji: '☕' }
      ]);
    }

    // Calculate step end times
    const newStepEndTimes = fullStepSequence.reduce((arr, step, i) => {
      arr.push((arr[i - 1] || 0) + (step.duration || 0));
      return arr;
    }, [] as number[]);
    setFullStepEndTimes(newStepEndTimes);

    // Show the appropriate timer page
    setShowBrewTimer(true);
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
    setCoffeeSettings(prev => ({ ...prev, amount, bloomRatio: prev.bloomRatio || 2 }));
    setOriginalSettings(prev => ({ ...prev, amount }));
    localStorage.setItem('coffeeSettings', JSON.stringify({ ...coffeeSettings, amount, bloomRatio: coffeeSettings.bloomRatio || 2 }));
  };

  const handleRatioChange = (ratio: number) => {
    setCoffeeSettings(prev => ({ ...prev, ratio, bloomRatio: prev.bloomRatio || 2 }));
    
    // When flavor EQ is off, set the original ratio too 
    if (!isFlavorEQActive) {
      setOriginalSettings(prev => ({ ...prev, ratio }));
    }
    
    localStorage.setItem('coffeeSettings', JSON.stringify({ ...coffeeSettings, ratio, bloomRatio: coffeeSettings.bloomRatio || 2 }));
  };

  const handleApplyFlavorSettings = (newSettings: CoffeeSettings, newPrefs: any) => {
    // Store the original values before applying EQ changes
    setOriginalSettings({
      amount: coffeeSettings.amount,
      ratio: coffeeSettings.ratio,
      bloomRatio: 2 // Default bloom ratio
    });
    
    setCoffeeSettings(newSettings);
    setFlavorPrefs(newPrefs);
    setIsFlavorEQActive(true);
    localStorage.setItem('coffeeSettings', JSON.stringify(newSettings));
    localStorage.setItem('flavorPrefs', JSON.stringify(newPrefs));
    localStorage.setItem('isFlavorEQActive', JSON.stringify(true));
    localStorage.setItem('originalSettings', JSON.stringify({
      amount: coffeeSettings.amount,
      ratio: coffeeSettings.ratio,
      bloomRatio: 2
    }));
  };

  const toggleFlavorEQ = () => {
    const newStatus = !isFlavorEQActive;
    setIsFlavorEQActive(newStatus);
    
    if (!newStatus) {
      // When turning off, we keep the adjusted settings in storage but use original values for calculation
      setOriginalSettings({
        amount: coffeeSettings.amount,
        ratio: originalSettings.ratio, // Keep original ratio
        bloomRatio: 2 // Reset to default
      });
    }
    
    localStorage.setItem('isFlavorEQActive', JSON.stringify(newStatus));
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
    // Preserve existing bloomRatio or default to 2 if not present
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

  // Update getStepInstruction to handle both methods
  const getStepInstruction = () => {
    if (finished) return 'Finished! Enjoy your coffee ☕';
    if (!showBrewTimer) return `Total brew time: ${formatTime(brewingTimings.totalTime)}`;
    
    const step = fullStepSequence[fullCurrentStep];
    if (isFrenchPress) {
      if (step.label === 'Preheat') {
        return 'Preheat the press with hot water (45s)';
      } else if (step.label === 'Add Coffee') {
        return `Add ${coffeeSettings.amount}g of coffee (coarse grind)`;
      } else if (step.label === 'Bloom') {
        return `Pour ${Math.round(coffeeSettings.amount * coffeeSettings.ratio * 0.25)}g of water (94°C)`;
      } else if (step.label === 'Stir') {
        return 'Stir gently to break crust and ensure even extraction';
      } else if (step.label === 'Pour') {
        return `Add remaining ${Math.round(coffeeSettings.amount * coffeeSettings.ratio * 0.75)}g of water`;
      } else if (step.label === 'Steep') {
        return 'Steep for 5 minutes';
      } else if (step.label === 'Press') {
        return 'Press slowly and evenly (45s)';
      } else if (step.label === 'Serve') {
        return 'Serve immediately to prevent over-extraction';
      }
    } else {
      if (step.label === 'Wait' || step.label === 'Drawdown') {
        return `${step.label} ${step.emoji || ''}`;
      }
      if (step.label === 'Total') {
        return `Done! Total time: ${formatTime(fullStepEndTimes[fullStepEndTimes.length - 1])}`;
      }
      if (step.label === 'Bloom to') {
        return `Bloom to ${step.water}`;
      }
      if (step.label === 'Pour to') {
        return `Pour to ${step.water}`;
      }
    }
    return '';
  };

  const handleBack = () => {
    setShowBrewTimer(false);
    handleReset();
  };

  // Update brewing method handler
  const handleBrewingMethodChange = (method: string) => {
    setBrewingMethod(method);
    setIsFrenchPress(method === 'frenchPress');
    // Reset timer and state when changing method
    setElapsed(0);
    setTimerActive(false);
    setTimerPaused(false);
    setFinished(false);
  };

  // Update getStepSequence to handle French Press with new steps
  const getStepSequence = () => {
    if (isFrenchPress) {
      return [
        { label: 'Preheat', duration: 45, instruction: 'Pour hot water into the press and let it sit for 45 seconds, then discard' },
        { label: 'Add Coffee', duration: 15, instruction: `Add ${coffeeSettings.amount}g of ground coffee to the press` },
        { label: 'Bloom', duration: 45, instruction: `Pour ${Math.round(coffeeSettings.amount * coffeeSettings.ratio * 0.25)}g of water (94°C) to saturate the grounds` },
        { label: 'Stir', duration: 15, instruction: 'Gently stir to break up the crust and ensure even extraction' },
        { label: 'Pour', duration: 45, instruction: `Add remaining ${Math.round(coffeeSettings.amount * coffeeSettings.ratio * 0.75)}g of water and stir again` },
        { label: 'Steep', duration: 300, instruction: 'Allow coffee to steep for 5 minutes' },
        { label: 'Press', duration: 45, instruction: 'Press the plunger down slowly and evenly, taking about 45 seconds' },
        { label: 'Serve', duration: 30, instruction: 'Pour and serve immediately to prevent over-extraction', emoji: '☕' }
      ];
    }
    return [
      { label: 'Bloom to', water: `${brewingTimings.bloomWater}g`, duration: brewingTimings.bloomDuration },
      { label: 'Pour to', water: `${brewingTimings.firstPourTarget}g`, duration: brewingTimings.firstPourDuration },
      { label: 'Wait', duration: brewingTimings.restDuration },
      { label: 'Pour to', water: `${brewingTimings.secondPourTarget}g`, duration: brewingTimings.secondPourDuration },
      { label: 'Wait', duration: brewingTimings.secondRestDuration },
      { label: 'Pour to', water: `${brewingTimings.thirdPourTarget}g`, duration: brewingTimings.thirdPourDuration },
      { label: 'Drawdown', duration: brewingTimings.drawdownDuration },
      { label: 'Total', duration: 0, emoji: '☕' }
    ];
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

  if (showInfo) {
    return <InfoPage onBack={() => setShowInfo(false)} />;
  }

  if (showSettings) {
    return <SettingsPage onBack={closeSettings} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} handleSettingsSave={handleSettingsSave} closeSettings={closeSettings} />;
  }

  if (showFlavorEQ) {
    return (
      <FlavorEQ 
        onBack={() => setShowFlavorEQ(false)}
        coffeeSettings={coffeeSettings}
        grindSize={grindSize}
        onApplySettings={handleApplyFlavorSettings}
        initialPrefs={flavorPrefs}
      />
    );
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
    if (isFrenchPress) {
      return (
        <FrenchPressTimerPage
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
          isFlavorEQActive={isFlavorEQActive}
        />
      );
    }
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
        isFlavorEQActive={isFlavorEQActive}
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
                <span className="text-xs font-medium text-gray-400 mb-1 g-1">Coffee</span>
                <div className="grid grid-cols-2 gap-2">
                  {coffeeOptions.map(amount => {
                    // Show both original and EQ values when EQ is active
                    const isOriginalAmount = originalSettings.amount === amount;
                    const isEQAmount = coffeeSettings.amount === amount;
                    const isSelected = isFlavorEQActive ? isEQAmount : isOriginalAmount;

                    return (
                      <button
                        key={amount}
                        className={`relative w-full px-0 py-2 rounded-[4px] text-sm font-semibold transition-colors ${
                          isSelected ? (isFlavorEQActive ? 'border-2 border-green-500 text-white' : 'border-2 border-blue-500 text-white') : 'text-gray-300 border border-transparent'
                        } ${!isSelected ? 'bg-gray-800' : (isFlavorEQActive ? 'bg-green-900/60' : 'bg-blue-900/60')}`}
                        onClick={() => handleCoffeeAmountChange(amount)}
                      >
                        {/* Show original value as blue overlay when EQ is active */}
                        {isFlavorEQActive && isOriginalAmount && !isEQAmount && (
                          <div className="absolute inset-0 border-2 border-blue-500 opacity-30 rounded-[3px] bg-blue-900/30"></div>
                        )}
                        {amount}g
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-400 mb-1 g-1">Ratio</span>
                <div className="grid grid-cols-2 gap-2">
                  {ratioOptions.map(ratio => {
                    // Show both original and EQ values when EQ is active
                    const isOriginalRatio = originalSettings.ratio === ratio;
                    const isEQRatio = coffeeSettings.ratio === ratio;
                    const isSelected = isFlavorEQActive ? isEQRatio : isOriginalRatio;

                    return (
                      <button
                        key={ratio}
                        className={`relative w-full px-0 py-2 rounded-[4px] text-sm font-semibold transition-colors ${
                          isSelected ? (isFlavorEQActive ? 'border-2 border-green-500 text-white' : 'border-2 border-blue-500 text-white') : 'text-gray-300 border border-transparent'
                        } ${!isSelected ? 'bg-gray-800' : (isFlavorEQActive ? 'bg-green-900/60' : 'bg-blue-900/60')}`}
                        onClick={() => handleRatioChange(ratio)}
                      >
                        {/* Show original value as blue overlay when EQ is active */}
                        {isFlavorEQActive && isOriginalRatio && !isEQRatio && (
                          <div className="absolute inset-0 border-2 border-blue-500 opacity-30 rounded-[3px] bg-blue-900/30"></div>
                        )}
                        1:{ratio}
                      </button>
                    );
                  })}
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
                      className={`flex-1 px-0 py-2 rounded-[4px] text-sm font-semibold transition-colors bg-gray-800 ${grindSize === grindMap[idx] ? 'text-white border-2 border-blue-500' : 'text-gray-300 border border-transparent'}`}
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
                <div className={`w-full relative rounded-[4px] px-0 py-2 text-base font-bold text-center text-white ${isFlavorEQActive ? 'bg-green-900/60 border-2 border-green-500' : 'bg-blue-900/60 border-2 border-blue-500'}`}>
                  {formatTime(brewingTimings.totalTime)}
                  
                  {/* Show original brew time as overlay when EQ is active */}
                  {isFlavorEQActive && originalBrewingTimings.totalTime !== brewingTimings.totalTime && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/30 border-2 border-blue-500 opacity-30 rounded-[3px]">
                      {formatTime(originalBrewingTimings.totalTime)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {coffeeSettings.amount}g • 1:{isFlavorEQActive ? coffeeSettings.ratio : originalSettings.ratio}
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-medium text-gray-400 mb-1">Total Water</span>
                <div className={`w-full relative rounded-[4px] px-0 py-2 text-base font-bold text-center text-white ${isFlavorEQActive ? 'bg-green-900/60 border-2 border-green-500' : 'bg-blue-900/60 border-2 border-blue-500'}`}>
                  {brewingTimings.thirdPourTarget}g
                  
                  {/* Show original water amount as overlay when EQ is active */}
                  {isFlavorEQActive && originalBrewingTimings.thirdPourTarget !== brewingTimings.thirdPourTarget && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/30 border-2 border-blue-500 opacity-30 rounded-[3px]">
                      {originalBrewingTimings.thirdPourTarget}g
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(brewingTimings.pourVolume)}g per pour
                  {isFlavorEQActive && originalBrewingTimings.pourVolume !== brewingTimings.pourVolume && (
                    <span className="text-blue-400 opacity-30 ml-1">({Math.round(originalBrewingTimings.pourVolume)}g)</span>
                  )}
                </div>
              </div>
            </div>
            {/* Flavor EQ Status Indicator - always visible */}
            <div className={`p-2 ${isFlavorEQActive ? 'bg-green-900/30' : 'bg-gray-800'} rounded-md mb-2 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Sliders size={16} className={isFlavorEQActive ? "text-green-300" : "text-gray-400"} />
                <div>
                  <span className={`text-xs font-medium ${isFlavorEQActive ? 'text-green-300' : 'text-gray-300'}`}>
                    Flavor EQ {isFlavorEQActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="text-xs text-gray-400">
                    {isFlavorEQActive ? 'Custom flavor profile applied' : 'Standard brewing parameters'}
                  </div>
                </div>
              </div>
              <button 
                className="text-xs text-green-300 underline"
                onClick={() => setShowFlavorEQ(true)}
              >
                Edit
              </button>
            </div>

            {/* French Press Toggle */}
            <div className="p-2 bg-gray-800 rounded-md mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee size={16} className={isFrenchPress ? "text-purple-300" : "text-gray-400"} />
                <div>
                  <span className={`text-xs font-medium ${isFrenchPress ? 'text-purple-300' : 'text-gray-300'}`}>
                    French Press {isFrenchPress ? 'Active' : 'Inactive'}
                  </span>
                  <div className="text-xs text-gray-400">
                    {isFrenchPress ? 'Immersion brewing method' : 'Pour-over brewing method'}
                  </div>
                </div>
              </div>
              <button 
                className={`text-xs ${isFrenchPress ? 'text-purple-300' : 'text-gray-400'} underline`}
                onClick={() => handleBrewingMethodChange(isFrenchPress ? 'v60' : 'frenchPress')}
              >
                {isFrenchPress ? 'Switch to V60' : 'Switch to French Press'}
              </button>
            </div>
            
            {/* Ready Button */}
            <div className="flex gap-2">
              {!showBrewTimer && (
                <button 
                  className={`btn ${isFrenchPress ? 'bg-purple-600 hover:bg-purple-700' : 'btn-primary'} flex-1`} 
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