import React, { useState, useRef, useEffect } from 'react';

// Simple SVG pour-over dripper icon
const DripperIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2">
    <ellipse cx="18" cy="8" rx="10" ry="4" fill="#fff" fillOpacity="0.12" />
    <path d="M8 8c0 4 2 12 10 12s10-8 10-12" stroke="#fff" strokeWidth="2" fill="none" />
    <ellipse cx="18" cy="8" rx="10" ry="4" stroke="#fff" strokeWidth="2" fill="none" />
    <rect x="13" y="20" width="10" height="2" rx="1" fill="#fff" fillOpacity="0.12" />
    <rect x="13" y="20" width="10" height="2" rx="1" stroke="#fff" strokeWidth="1.5" fill="none" />
    <rect x="15" y="22" width="6" height="6" rx="3" fill="#fff" fillOpacity="0.12" />
    <rect x="15" y="22" width="6" height="6" rx="3" stroke="#fff" strokeWidth="1.5" fill="none" />
  </svg>
);

// Define the new phase/step breakdown
const steps = [
  { phase: 1, label: 'Pour 60ml hot water', duration: 10, color: 'green' },
  { phase: 1, label: 'Wait', duration: 20, color: 'red' },
  { phase: 2, label: 'Pour 60ml more (now 120ml total)', duration: 10, color: 'green' },
  { phase: 2, label: 'Wait and add cold water to kettle', duration: 35, color: 'red' },
  { phase: 3, label: 'Pour 60ml cooler water (now 180ml total)', duration: 10, color: 'green' },
  { phase: 3, label: 'Wait', duration: 10, color: 'red' },
  { phase: 4, label: 'Pour 60ml cooler water (now 240ml total)', duration: 10, color: 'green' },
  { phase: 4, label: 'Wait and open the switch', duration: 10, color: 'red' },
  { phase: 5, label: 'Pour final 40ml (now 280ml total)', duration: 10, color: 'green' },
  { phase: 5, label: 'Wait for drawdown to finish', duration: 55, color: 'red' },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const ProPours: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0].duration);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (running && !paused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, paused, timeLeft]);

  // Step advance effect
  useEffect(() => {
    if (running && timeLeft === 0) {
      if (stepIdx < steps.length - 1) {
        setStepIdx(stepIdx + 1);
        setTimeLeft(steps[stepIdx + 1].duration);
      } else {
        setRunning(false);
      }
    }
  }, [timeLeft, running, stepIdx]);

  // Reset on exit
  useEffect(() => {
    return () => {
      setStepIdx(0);
      setTimeLeft(steps[0].duration);
      setRunning(false);
      setPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Controls
  const start = () => {
    setRunning(true);
    setPaused(false);
  };
  const pause = () => setPaused(true);
  const resume = () => setPaused(false);
  const reset = () => {
    setRunning(false);
    setPaused(false);
    setStepIdx(0);
    setTimeLeft(steps[0].duration);
  };

  const currentStep = steps[stepIdx];
  const phaseNumber = currentStep.phase;
  const isPour = currentStep.color === 'green';
  const isRest = currentStep.color === 'red';
  const colorClass = isPour ? 'text-green-200' : isRest ? 'text-yellow-200' : '';
  const barColorClass = (color: string) => color === 'red' ? 'bg-yellow-400' : 'bg-green-400';
  const timerBgClass = isPour ? 'bg-green-900' : isRest ? 'bg-yellow-900' : '';
  const timerTextClass = isPour ? 'text-green-200' : isRest ? 'text-yellow-200' : '';

  return (
    <div className="w-full">
      <div className="card w-full mb-6 px-4 py-4">
        <div className="flex flex-col items-start mb-2">
          <div className="text-xs text-gray-400 mb-2">
            <span>Method by Philocoffea, founded by World Brewers Cup Champion Tetsu Kasuya. <a href="https://en.philocoffea.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Learn more</a>.</span>
          </div>
          <div className="text-sm text-gray-300 mb-2 text-left">
            Tetsu Kasuya's 4:6 method uses 5 pours: the first <b>2 pours</b> build sweetness and acidity, the last <b>3 pours</b> adjust body and strength.
          </div>
          {/* Original info grid */}
          <div className="flex flex-col gap-1 w-full mb-2">
            <div className="flex gap-2 w-full">
              <div className="flex-1 bg-gray-700 rounded px-2 py-1 flex items-center justify-between whitespace-nowrap">
                <span>Coffee</span> <span className="ml-1">20g</span>
              </div>
              <div className="flex-1 bg-gray-700 rounded px-2 py-1 flex items-center justify-between whitespace-nowrap">
                <span>Water</span> <span className="ml-1">300ml</span>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <div className="flex-1 bg-gray-700 rounded px-2 py-1 flex items-center justify-between whitespace-nowrap">
                <span>Grind</span> <span className="ml-1">Medium-coarse</span>
              </div>
              <div className="flex-1 bg-gray-700 rounded px-2 py-1 flex items-center justify-between whitespace-nowrap">
                <span>Brew Time</span> <span className="ml-1">3:30</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1 pl-0">5 pours, 20g coffee, 300ml water</div>
          </div>
        </div>
        {/* Timer/Phase Interface - both in one rectangle, no parens or 'hot water', not bold */}
        <div className={`flex flex-row items-center justify-center gap-0 mb-6 w-full ${timerBgClass} rounded-lg px-4 py-2`}>
          <span className="bg-gray-600 rounded-md px-2 py-0.5 text-sm text-white mr-4" style={{ minWidth: 20, textAlign: 'center' }}>{phaseNumber}</span>
          <span className={`text-sm font-mono text-white mx-auto`} style={{ minWidth: 48, textAlign: 'center' }}>{formatTime(timeLeft)}</span>
          <span className={`text-sm truncate ${colorClass} ml-4`}>{currentStep.label.replace(/\(.+?\)/g, '').replace('hot water', '').trim()}</span>
        </div>
        <div className="flex gap-2 w-full">
          {!running && (
            <button className="btn btn-primary flex-1" onClick={start}>Start</button>
          )}
          {running && !paused && (
            <button className="btn btn-secondary flex-1" onClick={pause}>Pause</button>
          )}
          {running && paused && (
            <button className="btn btn-primary flex-1" onClick={resume}>Resume</button>
          )}
          {(running || stepIdx > 0) && (
            <button className="btn btn-secondary flex-1" onClick={reset}>Back</button>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-400">
          <p className="font-bold mb-1">Benchmark‑worthy pour‑over recipes coming soon:</p>
          <ul className="list-disc pl-5">
            <li>James Hoffmann</li>
            <li>Carlos Medina</li>
            <li>Wildkaffee GmbH</li>
            <li>Martin Wölfl</li>
            <li>Shih‑Yuan Hsu</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProPours; 