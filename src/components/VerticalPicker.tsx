import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VerticalPickerProps {
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  formatValue?: (value: number) => string;
  hasDecimals?: boolean;
  isDarkMode?: boolean;
  min?: number;
  max?: number;
}

const VerticalPicker: React.FC<VerticalPickerProps> = ({
  value,
  onChange,
  unit = '',
  formatValue = (v) => v.toString(),
  hasDecimals = false,
  isDarkMode = true,
  min = 5,
  max = 50,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDecimal, setSelectedDecimal] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const decimalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollEndTimer = useRef<NodeJS.Timeout>();

  const itemHeight = 50;
  const visibleItems = 5;

  const items = useMemo(() => {
    return Array.from({ length: (max - min) + 1 }, (_, i) => i + min);
  }, [min, max]);

  const totalHeight = itemHeight * items.length;
  const containerHeight = itemHeight * visibleItems;

  const decimalOptions = Array.from({ length: 10 }, (_, i) => i);

  useEffect(() => {
    if (isUserScrolling) return;

    const wholeNumber = Math.floor(value);
    const decimal = Math.round((value - wholeNumber) * 10);
    const index = items.indexOf(wholeNumber);

    if (index !== -1) {
      setSelectedIndex(index);
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    }
    if (hasDecimals) {
      setSelectedDecimal(decimal);
      if (decimalContainerRef.current) {
        decimalContainerRef.current.scrollTop = decimal * itemHeight;
      }
    }
    setEditValue(value.toString());
  }, [value, items, hasDecimals, isUserScrolling]);

  const handleScroll = () => {
    setIsUserScrolling(true);
    clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => setIsUserScrolling(false), 250);

    if (!containerRef.current || isEditing) return;
    
    const scrollTop = containerRef.current.scrollTop;
    let newIndex = Math.round(scrollTop / itemHeight);
    newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    
    if (newIndex !== selectedIndex) {
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
    setEditValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    let numValue = parseFloat(editValue);
    if (!isNaN(numValue)) {
      numValue = Math.max(min, Math.min(max, numValue));
      onChange(numValue);
      setEditValue(numValue.toString());
    } else {
      setEditValue(value.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(value.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex flex-row items-center justify-center h-[250px] px-4 border border-gray-300 rounded-lg bg-transparent overflow-hidden w-full max-w-[180px] mx-auto">
        <div className="relative h-[250px] w-24 overflow-hidden flex flex-col items-center justify-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              value={editValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className={`w-full h-full bg-transparent text-2xl font-medium ${isDarkMode ? 'text-white' : 'text-black'} text-center focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded`}
              style={{ padding: '100px 0' }}
              step={hasDecimals ? "0.1" : "1"}
              min={min}
              max={max}
            />
          ) : (
            <>
              <div className={`absolute top-0 left-0 right-0 h-20 ${isDarkMode ? 'bg-gradient-to-b from-black to-transparent' : 'bg-gradient-to-b from-white to-transparent'} z-10 pointer-events-none`} />
              <div className={`absolute bottom-0 left-0 right-0 h-20 ${isDarkMode ? 'bg-gradient-to-t from-black to-transparent' : 'bg-gradient-to-t from-white to-transparent'} z-10 pointer-events-none`} />
              <div 
                className={`absolute left-0 right-0 h-[50px] ${isDarkMode ? 'bg-white/10' : 'bg-black/10'} rounded-lg z-0 pointer-events-none`}
                style={{ top: '100px' }}
              />
              <div
                ref={containerRef}
                className="h-full overflow-y-auto scrollbar-hide flex flex-col items-center justify-center"
                onScroll={handleScroll}
                style={{
                  scrollSnapType: 'y mandatory',
                  scrollPadding: '100px 0',
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div 
                  className="py-[100px]"
                  style={{ height: totalHeight + (itemHeight * 2) }}
                >
                  {items.map((item, index) => (
                    <div
                      key={item}
                      className={`h-[50px] flex items-center justify-center text-2xl font-medium cursor-pointer select-none text-center`}
                      style={{
                        scrollSnapAlign: 'center',
                        color: index === selectedIndex 
                          ? (isDarkMode ? 'white' : 'black')
                          : (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
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

        {hasDecimals && !isEditing && (
          <>
            <span className={`text-2xl font-medium mx-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>.</span>
            <div className="relative h-[250px] w-16 overflow-hidden flex flex-col items-center justify-center">
              <div className={`absolute top-0 left-0 right-0 h-20 ${isDarkMode ? 'bg-gradient-to-b from-black to-transparent' : 'bg-gradient-to-b from-white to-transparent'} z-10 pointer-events-none`} />
              <div className={`absolute bottom-0 left-0 right-0 h-20 ${isDarkMode ? 'bg-gradient-to-t from-black to-transparent' : 'bg-gradient-to-t from-white to-transparent'} z-10 pointer-events-none`} />
              <div 
                className={`absolute left-0 right-0 h-[50px] ${isDarkMode ? 'bg-white/10' : 'bg-black/10'} rounded-lg z-0 pointer-events-none`}
                style={{ top: '100px' }}
              />
              <div
                ref={decimalContainerRef}
                className="h-full overflow-y-auto scrollbar-hide flex flex-col items-center justify-center"
                onScroll={handleDecimalScroll}
                style={{
                  scrollSnapType: 'y mandatory',
                  scrollPadding: '100px 0',
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div 
                  className="py-[100px]"
                  style={{ height: itemHeight * 12 }}
                >
                  {decimalOptions.map((decimal) => (
                    <div
                      key={decimal}
                      className={`h-[50px] flex items-center justify-center text-2xl font-medium cursor-pointer select-none text-center`}
                      style={{
                        scrollSnapAlign: 'center',
                        color: decimal === selectedDecimal 
                          ? (isDarkMode ? 'white' : 'black')
                          : (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
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
      </div>

      {unit && (
        <span className={`text-2xl font-medium ${isDarkMode ? 'text-white' : 'text-black'} ml-1`}>{unit}</span>
      )}
    </div>
  );
};

export default VerticalPicker; 