import React, { useState, useEffect, useRef } from 'react';

interface VerticalPickerProps {
  items: number[];
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  formatValue?: (value: number) => string;
  hasDecimals?: boolean;
}

const VerticalPicker: React.FC<VerticalPickerProps> = ({
  items,
  value,
  onChange,
  unit = '',
  formatValue = (v) => v.toString(),
  hasDecimals = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDecimal, setSelectedDecimal] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const containerRef = useRef<HTMLDivElement>(null);
  const decimalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemHeight = 50; // Height of each item in pixels
  const visibleItems = 5; // Number of items visible at once

  // Generate decimal options (0-9)
  const decimalOptions = Array.from({ length: 10 }, (_, i) => i);

  useEffect(() => {
    if (!hasDecimals) {
      const index = items.indexOf(Math.floor(value));
      if (index !== -1) {
        setSelectedIndex(index);
      }
    } else {
      const wholeNumber = Math.floor(value);
      const decimal = Math.round((value - wholeNumber) * 10);
      const index = items.indexOf(wholeNumber);
      if (index !== -1) {
        setSelectedIndex(index);
        setSelectedDecimal(decimal);
      }
    }
    setEditValue(value.toString());
  }, [value, items, hasDecimals]);

  const handleScroll = () => {
    if (!containerRef.current || isEditing) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex >= 0 && newIndex < items.length && newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
      const newValue = hasDecimals 
        ? items[newIndex] + (selectedDecimal / 10)
        : items[newIndex];
      onChange(newValue);
    }
  };

  const handleDecimalScroll = () => {
    if (!decimalContainerRef.current || isEditing) return;
    
    const scrollTop = decimalContainerRef.current.scrollTop;
    const newDecimal = Math.round(scrollTop / itemHeight);
    
    if (newDecimal >= 0 && newDecimal < 10 && newDecimal !== selectedDecimal) {
      setSelectedDecimal(newDecimal);
      const newValue = items[selectedIndex] + (newDecimal / 10);
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    // Allow empty input while typing
    if (newValue === '') return;
    
    // Validate and update if it's a valid number
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= items[0] && numValue <= items[items.length - 1]) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // Reset to last valid value if current input is invalid
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue < items[0] || numValue > items[items.length - 1]) {
      setEditValue(value.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      handleInputBlur();
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(value.toString());
    // Focus input after a short delay to ensure the element is mounted
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Whole number picker or input */}
      <div className="relative h-[250px] w-16 overflow-hidden">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-full h-full bg-transparent text-2xl font-medium text-white text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
            style={{ padding: '100px 0' }}
            min={items[0]}
            max={items[items.length - 1]}
            step={hasDecimals ? "0.1" : "1"}
          />
        ) : (
          <>
            {/* Gradient overlays for fade effect */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-10" />
            
            {/* Selection highlight */}
            <div 
              className="absolute left-0 right-0 h-[50px] bg-white/10 rounded-lg z-0"
              style={{ top: '100px' }}
            />
            
            {/* Scrollable container */}
            <div
              ref={containerRef}
              className="h-full overflow-y-auto scrollbar-hide"
              onScroll={handleScroll}
              style={{
                scrollSnapType: 'y mandatory',
                scrollPadding: '100px 0',
              }}
            >
              <div className="py-[100px]">
                {items.map((item, index) => (
                  <div
                    key={item}
                    className="h-[50px] flex items-center justify-center text-2xl font-medium cursor-pointer"
                    style={{
                      scrollSnapAlign: 'center',
                      color: index === selectedIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    }}
                    onClick={() => startEditing()}
                  >
                    {formatValue(item)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Decimal picker (if enabled) */}
      {hasDecimals && !isEditing && (
        <>
          <span className="text-2xl font-medium text-white">.</span>
          <div className="relative h-[250px] w-12 overflow-hidden">
            {/* Gradient overlays for fade effect */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-10" />
            
            {/* Selection highlight */}
            <div 
              className="absolute left-0 right-0 h-[50px] bg-white/10 rounded-lg z-0"
              style={{ top: '100px' }}
            />
            
            {/* Scrollable container */}
            <div
              ref={decimalContainerRef}
              className="h-full overflow-y-auto scrollbar-hide"
              onScroll={handleDecimalScroll}
              style={{
                scrollSnapType: 'y mandatory',
                scrollPadding: '100px 0',
              }}
            >
              <div className="py-[100px]">
                {decimalOptions.map((decimal) => (
                  <div
                    key={decimal}
                    className="h-[50px] flex items-center justify-center text-2xl font-medium cursor-pointer"
                    style={{
                      scrollSnapAlign: 'center',
                      color: decimal === selectedDecimal ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    }}
                    onClick={() => startEditing()}
                  >
                    {decimal}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Unit display */}
      {unit && (
        <span className="text-2xl font-medium text-white ml-1">{unit}</span>
      )}
    </div>
  );
};

export default VerticalPicker; 