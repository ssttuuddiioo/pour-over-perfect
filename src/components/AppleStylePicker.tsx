import React, { useRef, useEffect, useState } from 'react';

interface AppleStylePickerProps {
  value: number;
  onChange: (value: number) => void;
  isDarkMode?: boolean;
  label?: string;
}

const AppleStylePicker: React.FC<AppleStylePickerProps> = ({
  value,
  onChange,
  isDarkMode = true,
  label = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const itemHeight = 28; // Reduced from 40 to 28 (30% reduction)
  const visibleItems = 5;
  const containerHeight = itemHeight * visibleItems;

  // Generate values from 1.0 to 50.0 in 0.1 increments
  const values = Array.from({ length: 491 }, (_, i) => (i + 10) / 10);

  // Find current value index
  const currentIndex = values.findIndex(val => Math.abs(val - value) < 0.05);

  // Scroll to correct position when value changes externally
  useEffect(() => {
    if (!isScrolling && scrollRef.current && currentIndex >= 0) {
      const scrollTop = currentIndex * itemHeight;
      scrollRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [value, isScrolling, currentIndex]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    const newValue = values[clampedIndex];
    
    if (Math.abs(newValue - value) > 0.05) {
      onChange(newValue);
    }
    
    // Snap to position
    const targetScrollTop = clampedIndex * itemHeight;
    if (Math.abs(scrollTop - targetScrollTop) > 1) {
      scrollRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {label && (
        <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {label}
        </label>
      )}
      
      <div className="flex items-center justify-center">
        {/* Single Value Picker */}
        <div className="relative">
          <div 
            className={`w-60 max-w-[180px] overflow-hidden rounded-lg px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            style={{ height: containerHeight }}
          >
            {/* Selection highlight */}
            <div 
              className={`absolute left-0 right-0 pointer-events-none z-10 ${isDarkMode ? 'bg-white bg-opacity-10' : 'bg-black bg-opacity-10'} rounded`}
              style={{ 
                top: itemHeight * 2, 
                height: itemHeight,
                border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)'
              }}
            />
            
            <div
              ref={scrollRef}
              className="h-full overflow-y-scroll scrollbar-hide"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={() => {
                setIsScrolling(true);
                clearTimeout((scrollRef.current as any)?._scrollTimeout);
                (scrollRef.current as any)._scrollTimeout = setTimeout(() => {
                  setIsScrolling(false);
                  handleScroll();
                }, 150);
              }}
            >
              {/* Top padding */}
              <div style={{ height: itemHeight * 2 }} />
              
              {values.map((val) => (
                <div
                  key={val}
                  className={`flex items-center justify-center text-lg font-normal select-none transition-opacity duration-200 ${
                    Math.abs(val - value) < 0.05 
                      ? (isDarkMode ? 'text-white opacity-100' : 'text-black opacity-100')
                      : (isDarkMode ? 'text-gray-400 opacity-60' : 'text-gray-600 opacity-60')
                  }`}
                  style={{ 
                    height: itemHeight,
                    scrollSnapAlign: 'center'
                  }}
                >
                  {val.toFixed(1)}
                </div>
              ))}
              
              {/* Bottom padding */}
              <div style={{ height: itemHeight * 2 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppleStylePicker; 