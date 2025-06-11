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
  min = 1,
  max = 50,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const containerRef = useRef<HTMLDivElement>(null);
  const decimalContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const itemHeight = 50;

  const items = useMemo(() => {
    return Array.from({ length: (max - min) + 1 }, (_, i) => i + min);
  }, [min, max]);

  const decimalOptions = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);

  const selectedIndex = useMemo(() => items.indexOf(Math.floor(value)), [value, items]);
  const selectedDecimal = useMemo(() => Math.round((value - Math.floor(value)) * 10), [value]);

  // Effect to position the scroller based on the value.
  // This is now the ONLY place where scroll is set programmatically.
  useEffect(() => {
    const scroller = containerRef.current;
    if (scroller) {
      const targetScrollTop = selectedIndex * itemHeight;
      // We only scroll if the position is meaningfully different, to avoid fighting with user scroll.
      if (Math.abs(scroller.scrollTop - targetScrollTop) > itemHeight / 2) {
        scroller.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }
    }
  }, [value, selectedIndex]); // It re-runs ONLY when the external value changes.

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    // Clear any existing timeout to avoid premature snapping
    clearTimeout(scrollTimeout.current);

    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    // Update the value based on scroll position
    if (newIndex >= 0 && newIndex < items.length) {
      const currentDecimal = hasDecimals ? selectedDecimal / 10 : 0;
      const newValue = items[newIndex] + currentDecimal;
      if (newValue !== value) {
        onChange(newValue);
      }
    }
    
    // After scrolling stops, snap to the nearest item.
    scrollTimeout.current = setTimeout(() => {
      const scroller = containerRef.current;
      if (scroller) {
        const finalIndex = Math.round(scroller.scrollTop / itemHeight);
        const targetScrollTop = finalIndex * itemHeight;
        scroller.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }
    }, 150);
  };
  
  const handleDecimalScroll = () => {
    if (!decimalContainerRef.current) return;
    
    clearTimeout(scrollTimeout.current);

    const scrollTop = decimalContainerRef.current.scrollTop;
    const newDecimal = Math.round(scrollTop / itemHeight);
    
    if (newDecimal >= 0 && newDecimal < 10) {
      const newValue = items[selectedIndex] + (newDecimal / 10);
      if (newValue !== value) {
        onChange(newValue);
      }
    }
    
    scrollTimeout.current = setTimeout(() => {
      const scroller = decimalContainerRef.current;
      if (scroller) {
        const finalDecimal = Math.round(scroller.scrollTop / itemHeight);
        scroller.scrollTo({ top: finalDecimal * itemHeight, behavior: 'smooth' });
      }
    }, 150);
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

  const totalHeight = itemHeight * items.length;

  return (
    <div className="flex items-center space-x-1">
      <div 
        className="flex flex-row items-center justify-center h-[250px] px-4 border border-gray-300 rounded-lg bg-transparent overflow-hidden w-full max-w-[180px] mx-auto"
      >
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