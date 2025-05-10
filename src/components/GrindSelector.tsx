import React from 'react';
import { Coffee } from 'lucide-react';

interface GrindSelectorProps {
  grindSize: number;
  setGrindSize: (size: number) => void;
}

const GrindSelector: React.FC<GrindSelectorProps> = ({ grindSize, setGrindSize }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGrindSize(parseInt(e.target.value, 10));
  };

  const getGrindDescription = (size: number): string => {
    if (size <= 3) return 'Fine';
    if (size <= 7) return 'Medium';
    return 'Coarse';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coffee size={16} className="text-gray-400" />
          <span className="text-sm">{getGrindDescription(grindSize)}</span>
        </div>
        <span className="text-sm text-gray-400">{grindSize}/11</span>
      </div>
      
      <div className="relative px-1">
        <input
          type="range"
          min="1"
          max="11"
          value={grindSize}
          onChange={handleChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Fine</span>
          <span>Medium</span>
          <span>Coarse</span>
        </div>
      </div>
    </div>
  );
};

export default GrindSelector;