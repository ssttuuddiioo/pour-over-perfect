import React, { useState, useEffect } from 'react';
import { CoffeeSettings } from '../types/brewing';
import { calculateBrewTiming, formatTime } from '../utils/brewingCalculations';

interface FlavorPreferences {
  floral: number;
  acidity: number;
  fruitiness: number;
  bitterness: number;
}

interface FlavorEQProps {
  onBack: () => void;
  coffeeSettings: CoffeeSettings;
  grindSize: number;
  onApplySettings: (newSettings: CoffeeSettings, prefs: FlavorPreferences) => void;
  initialPrefs?: FlavorPreferences;
}

const FlavorEQ: React.FC<FlavorEQProps> = ({ 
  onBack, 
  coffeeSettings, 
  grindSize,
  onApplySettings,
  initialPrefs
}) => {
  // Default preferences (middle values)
  const defaultPrefs: FlavorPreferences = {
    floral: 50,
    acidity: 50,
    fruitiness: 50,
    bitterness: 50
  };

  const [prefs, setPrefs] = useState<FlavorPreferences>(initialPrefs || defaultPrefs);
  
  // Create a copy of settings that we can modify based on preferences
  const [adjustedSettings, setAdjustedSettings] = useState<CoffeeSettings>({
    ...coffeeSettings
  });

  // Compute the adjusted recipe whenever preferences change
  useEffect(() => {
    const newSettings = { ...coffeeSettings };
    
    // Apply floral: adjust bloom ratio (2.0 - 3.0)
    // Higher floral = more bloom water
    newSettings.bloomRatio = 2.0 + (prefs.floral / 100);
    
    // Apply bitterness: adjust water to coffee ratio (15 - 18)
    // Higher bitterness = more water (longer extraction)
    const baseRatio = 16; // baseline
    const ratioAdjustment = ((prefs.bitterness - 50) / 100) * 2; // -1 to +1
    newSettings.ratio = Math.max(15, Math.min(18, baseRatio + ratioAdjustment));
    
    setAdjustedSettings(newSettings);
  }, [prefs, coffeeSettings]);

  // Calculate the full brew timings based on adjusted settings
  const brewingTimings = calculateBrewTiming(
    grindSize, 
    adjustedSettings.amount, 
    adjustedSettings.ratio, 
    adjustedSettings.bloomRatio,
    prefs.acidity,
    prefs.fruitiness
  );

  // Handle slider change
  const handleSliderChange = (preference: keyof FlavorPreferences, value: number) => {
    setPrefs(prev => ({
      ...prev,
      [preference]: value
    }));
  };

  // Reset to defaults
  const handleReset = () => {
    setPrefs(defaultPrefs);
  };

  // Apply changes and go back
  const handleApply = () => {
    onApplySettings(adjustedSettings, prefs);
    onBack();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Flavor EQ</h2>
          <button onClick={onBack} className="btn btn-secondary">Back</button>
        </div>
        
        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-300">Floral</label>
              <span className="text-sm text-gray-400">{prefs.floral}</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={prefs.floral} 
              onChange={(e) => handleSliderChange('floral', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              Affects bloom water: {Math.round(adjustedSettings.amount * adjustedSettings.bloomRatio)}g
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-300">Acidity</label>
              <span className="text-sm text-gray-400">{prefs.acidity}</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={prefs.acidity} 
              onChange={(e) => handleSliderChange('acidity', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              Affects first pour speed: {formatTime(brewingTimings.firstPourDuration)}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-300">Fruitiness</label>
              <span className="text-sm text-gray-400">{prefs.fruitiness}</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={prefs.fruitiness} 
              onChange={(e) => handleSliderChange('fruitiness', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              Affects pour pattern: {Math.ceil(1 + prefs.fruitiness / 50)} pulses
            </p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-300">Bitterness</label>
              <span className="text-sm text-gray-400">{prefs.bitterness}</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={prefs.bitterness} 
              onChange={(e) => handleSliderChange('bitterness', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              Affects ratio: 1:{adjustedSettings.ratio.toFixed(1)}
            </p>
          </div>
        </div>
        
        {/* Recipe Preview */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md font-medium text-gray-200 mb-3">Recipe Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Bloom Water:</span>
              <span className="text-white">{Math.round(adjustedSettings.amount * adjustedSettings.bloomRatio)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">First Pour Total:</span>
              <span className="text-white">{brewingTimings.firstPourTarget}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Water-to-Coffee Ratio:</span>
              <span className="text-white">1:{adjustedSettings.ratio.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pour Pattern:</span>
              <span className="text-white">{brewingTimings.pulseCount} pulses</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Water:</span>
              <span className="text-white">{brewingTimings.thirdPourTarget}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Brew Time:</span>
              <span className="text-white">{formatTime(brewingTimings.totalTime)}</span>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button 
            onClick={handleReset}
            className="btn btn-secondary flex-1"
          >
            Reset
          </button>
          <button 
            onClick={handleApply}
            className="btn btn-primary flex-1"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlavorEQ; 