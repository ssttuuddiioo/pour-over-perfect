import React, { useState } from 'react';
import GrindSelector from './GrindSelector';
import BrewingTimer from './BrewingTimer';
import { Notes } from './Notes';
import { BrewingPhase, CoffeeSettings } from '../types/brewing';
import { calculateBrewTiming } from '../utils/brewingCalculations';
import { ClipboardList, Info } from 'lucide-react';

const BrewingApp: React.FC<{ onShowAbout?: () => void }> = ({ onShowAbout }) => {
  const [grindSize, setGrindSize] = useState<number>(6);
  const [isBrewActive, setIsBrewActive] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<BrewingPhase | null>(null);
  const [coffeeSettings, setCoffeeSettings] = useState<CoffeeSettings>({
    amount: 15,
    ratio: 15
  });
  const [showNotes, setShowNotes] = useState(false);
  
  const brewingTimings = calculateBrewTiming(grindSize, coffeeSettings.amount, coffeeSettings.ratio);
  
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
  };

  const handleRatioChange = (ratio: number) => {
    setCoffeeSettings(prev => ({ ...prev, ratio }));
  };

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
  
  return (
    <div className="w-full max-w-sm">
      <div className="card space-y-6">
        {!isBrewActive ? (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">Pour Perfect</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowNotes(true)}
                  className="btn btn-secondary p-2"
                >
                  <ClipboardList size={20} />
                </button>
                <button
                  onClick={onShowAbout}
                  className="btn btn-secondary p-2"
                  type="button"
                  aria-label="About"
                >
                  <Info size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-medium text-gray-400 mb-2">Coffee</h3>
                <div className="grid grid-cols-2 gap-1">
                  {[15, 20, 25, 30].map(amount => (
                    <button
                      key={amount}
                      className={`amount-btn ${
                        coffeeSettings.amount === amount ? 'amount-btn-active' : 'amount-btn-inactive'
                      }`}
                      onClick={() => handleCoffeeAmountChange(amount)}
                    >
                      {amount}g
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-400 mb-2">Ratio</h3>
                <div className="grid grid-cols-2 gap-1">
                  {[15, 16, 17, 18].map(ratio => (
                    <button
                      key={ratio}
                      className={`amount-btn ${
                        coffeeSettings.ratio === ratio ? 'amount-btn-active' : 'amount-btn-inactive'
                      }`}
                      onClick={() => handleRatioChange(ratio)}
                    >
                      1:{ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              Total water: {brewingTimings.thirdPourTarget}ml
            </div>

            <GrindSelector 
              grindSize={grindSize} 
              setGrindSize={setGrindSize} 
            />
            
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Bloom ({brewingTimings.bloomWater}ml)</span> 
                <span>{brewingTimings.bloomDuration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">First Pour ({brewingTimings.pourVolume}ml)</span> 
                <span>{brewingTimings.firstPourDuration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">First Rest</span> 
                <span>{brewingTimings.restDuration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Second Pour ({brewingTimings.pourVolume}ml)</span> 
                <span>{brewingTimings.secondPourDuration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Second Rest</span> 
                <span>{brewingTimings.secondRestDuration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Third Pour ({brewingTimings.pourVolume}ml)</span> 
                <span>{brewingTimings.thirdPourDuration}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Drawdown</span> 
                <span>{brewingTimings.drawdownDuration}s</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span>Total Time</span> 
                <span>{brewingTimings.totalTime}s</span>
              </div>
            </div>
            
            <button 
              className="btn btn-primary w-full"
              onClick={startBrewing}
            >
              Start
            </button>
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
    </div>
  );
};

export default BrewingApp;