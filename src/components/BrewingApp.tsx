import React, { useState, useRef, useEffect } from 'react';
import GrindSelector from './GrindSelector';
import BrewingTimer from './BrewingTimer';
import { Notes } from './Notes';
import { BrewingPhase, CoffeeSettings } from '../types/brewing';
import { calculateBrewTiming } from '../utils/brewingCalculations';
import { ClipboardList, Info, Settings as SettingsIcon, X } from 'lucide-react';

const defaultCoffeeOptions = [15, 20, 25, 30];
const defaultRatioOptions = [15, 16, 17, 18];

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
            <a href="https://github.com/ssttuuddiioo/pour-over-perfect" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-sm">View on GitHub / Roadmap</a>
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
            <div className="flex flex-wrap gap-2 mb-2">
              {settingsDraft.coffeeOptions.map((val: number, idx: number) => (
                <div key={idx} className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
                  <input
                    type="number"
                    min={10}
                    max={40}
                    step={0.1}
                    value={val}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      setSettingsDraft((d: any) => ({
                        ...d,
                        coffeeOptions: d.coffeeOptions.map((x: number, i: number) => i === idx ? v : x)
                      }));
                    }}
                    className="w-16 bg-gray-800 text-gray-100 border border-gray-700 rounded"
                  />
                  <button type="button" aria-label="Remove" onClick={() => setSettingsDraft((d: any) => ({ ...d, coffeeOptions: d.coffeeOptions.filter((_: any, i: number) => i !== idx) }))}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary px-2 py-1" onClick={() => setSettingsDraft((d: any) => ({ ...d, coffeeOptions: [...d.coffeeOptions, 15] }))}>+</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Ratio options</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settingsDraft.ratioOptions.map((val: number, idx: number) => (
                <div key={idx} className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
                  <input
                    type="number"
                    min={14}
                    max={20}
                    step={0.1}
                    value={val}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      setSettingsDraft((d: any) => ({
                        ...d,
                        ratioOptions: d.ratioOptions.map((x: number, i: number) => i === idx ? v : x)
                      }));
                    }}
                    className="w-16 bg-gray-800 text-gray-100 border border-gray-700 rounded"
                  />
                  <button type="button" aria-label="Remove" onClick={() => setSettingsDraft((d: any) => ({ ...d, ratioOptions: d.ratioOptions.filter((_: any, i: number) => i !== idx) }))}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary px-2 py-1" onClick={() => setSettingsDraft((d: any) => ({ ...d, ratioOptions: [...d.ratioOptions, 15] }))}>+</button>
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
  const [settingsDraft, setSettingsDraft] = useState({
    amount: coffeeSettings.amount,
    ratio: coffeeSettings.ratio,
    coffeeOptions: [...coffeeOptions],
    ratioOptions: [...ratioOptions],
  });
  const settingsRef = useRef<HTMLDivElement>(null);

  const brewingTimings = calculateBrewTiming(grindSize, coffeeSettings.amount, coffeeSettings.ratio);

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
                  aria-label="Notes"
                >
                  Notes
                </button>
                <button
                  onClick={openSettings}
                  className="btn btn-secondary p-2"
                  type="button"
                  aria-label="Settings"
                >
                  <SettingsIcon size={20} />
                </button>
                <button
                  onClick={() => setShowInfo(true)}
                  className="btn btn-secondary p-2"
                  type="button"
                  aria-label="Info"
                >
                  <Info size={20} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-medium text-gray-400 mb-2">Coffee</h3>
                <div className="grid grid-cols-2 gap-1">
                  {coffeeOptions.map(amount => (
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
                  {ratioOptions.map(ratio => (
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