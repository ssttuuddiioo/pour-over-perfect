import React, { useState, useEffect } from 'react';

export interface AnimationConfig {
  width: number;
  height: number;
  left: string | number;
  top: string | number;
  scale: number;
  xPercent: number;
  yPercent: number;
  x: number;
  y: number;
  duration: number;
  ease: string;
}

interface DebugOverlayProps {
  config: AnimationConfig;
  mode: string;
  path: string; // Add path prop
  onConfigChange: (newConfig: Partial<AnimationConfig>) => void;
  onSave: () => void;
  onExport: () => void;
  onReset: () => void; // Add reset handler
}

// Reusable Slider Component
interface SliderProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
}

const Slider: React.FC<SliderProps> = ({ label, name, value, onChange, min, max, step }) => (
  <div>
    <label>{label}: {value}</label>
    <input
      type="range"
      name={name}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      style={{ width: '100%', accentColor: '#4CAF50' }}
    />
  </div>
);

const DebugOverlay: React.FC<DebugOverlayProps> = ({ config, mode, path, onConfigChange, onSave, onExport, onReset }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: window.innerHeight - 450 }); // Default position
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 }); // Mouse position at drag start

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStartOffset.x,
          y: e.clientY - dragStartOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartOffset]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    if (['width', 'height', 'scale', 'xPercent', 'yPercent', 'x', 'y', 'duration'].includes(name)) {
      parsedValue = parseFloat(value);
    }
    onConfigChange({ [name]: parsedValue });
  };

  const sliderSettings: Record<string, { min: number, max: number, step: number }> = {
    width: { min: 0, max: 2000, step: 1 },
    height: { min: 0, max: 2000, step: 1 },
    scale: { min: 0, max: 5, step: 0.1 },
    xPercent: { min: -100, max: 100, step: 1 },
    yPercent: { min: -100, max: 100, step: 1 },
    x: { min: -500, max: 500, step: 1 },
    y: { min: -500, max: 500, step: 1 },
    duration: { min: 0, max: 5, step: 0.1 },
  };

  const handleExport = () => {
    onExport();
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: `${position.y}px`,
      left: `${position.x}px`,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px',
      userSelect: isDragging ? 'none' : 'auto',
    }}>
      <div 
        onMouseDown={handleMouseDown}
        style={{
          cursor: 'move',
          backgroundColor: '#333',
          padding: '8px',
          marginBottom: '10px',
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '5px' }}>
          <strong>Page:</strong> {path}
        </div>
        <div>
          <strong>Mode:</strong> {mode}
        </div>
      </div>
      {Object.entries(config).map(([key, value]) => {
        if (typeof value === 'number' && sliderSettings[key]) {
          const { min, max, step } = sliderSettings[key];
          return (
            <Slider
              key={key}
              label={key}
              name={key}
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
            />
          );
        }
        return (
          <div key={key}>
            <label>{key}: </label>
            <input
              type="text"
              name={key}
              value={String(value)}
              onChange={handleInputChange}
              style={{ background: '#333', color: 'white', border: '1px solid #555', marginLeft: '5px' }}
            />
          </div>
        );
      })}
      <div style={{ marginTop: '10px' }}>
        <button onClick={onSave} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', marginRight: '5px' }}>
          Save to Local
        </button>
        <button onClick={handleExport} style={{ background: '#008CBA', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', marginRight: '5px' }}>
          {showCopied ? 'Copied!' : 'Copy Page Settings'}
        </button>
        <button onClick={onReset} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px', cursor: 'pointer' }}>
          Reset Defaults
        </button>
      </div>
    </div>
  );
};

export default DebugOverlay; 