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
  const intRef = useRef<HTMLDivElement>(null);
  const decRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const intPart = Math.floor(value);
  const decPart = Math.round((value - intPart) * 10);

  const itemHeight = 40;
  const visibleItems = 5;
  const containerHeight = itemHeight * visibleItems;

  // Generate integer values 1-50
  const intValues = Array.from({ length: 50 }, (_, i) => i + 1);
  // Generate decimal values 0-9
  const decValues = Array.from({ length: 10 }, (_, i) => i);

  // Scroll to correct position when value changes externally
  useEffect(() => {
    if (!isScrolling) {
      if (intRef.current) {
        const scrollTop = (intPart - 1) * itemHeight;
        intRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
      if (decRef.current) {
        const scrollTop = decPart * itemHeight;
        decRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  }, [intPart, decPart, isScrolling]);

  const handleIntScroll = () => {
    if (!intRef.current) return;
    
    const scrollTop = intRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(intValues.length - 1, index));
    const newIntValue = intValues[clampedIndex];
    
    if (newIntValue !== intPart) {
      onChange(parseFloat(`${newIntValue}.${decPart}`));
    }
    
    // Snap to position
    const targetScrollTop = clampedIndex * itemHeight;
    if (Math.abs(scrollTop - targetScrollTop) > 1) {
      intRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  };

  const handleDecScroll = () => {
    if (!decRef.current) return;
    
    const scrollTop = decRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(decValues.length - 1, index));
    const newDecValue = decValues[clampedIndex];
    
    if (newDecValue !== decPart) {
      onChange(parseFloat(`${intPart}.${newDecValue}`));
    }
    
    // Snap to position
    const targetScrollTop = clampedIndex * itemHeight;
    if (Math.abs(scrollTop - targetScrollTop) > 1) {
      decRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
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
        {/* Integer Picker */}
        <div className="relative">
          <div 
            className={`w-16 overflow-hidden rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
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
              ref={intRef}
              className="h-full overflow-y-scroll scrollbar-hide"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={() => {
                setIsScrolling(true);
                clearTimeout((intRef.current as any)?._scrollTimeout);
                (intRef.current as any)._scrollTimeout = setTimeout(() => {
                  setIsScrolling(false);
                  handleIntScroll();
                }, 150);
              }}
            >
              {/* Top padding */}
              <div style={{ height: itemHeight * 2 }} />
              
              {intValues.map((val) => (
                <div
                  key={val}
                  className={`flex items-center justify-center text-lg font-medium select-none transition-opacity duration-200 ${
                    val === intPart 
                      ? (isDarkMode ? 'text-white opacity-100' : 'text-black opacity-100')
                      : (isDarkMode ? 'text-gray-400 opacity-60' : 'text-gray-600 opacity-60')
                  }`}
                  style={{ 
                    height: itemHeight,
                    scrollSnapAlign: 'center'
                  }}
                >
                  {val}
                </div>
              ))}
              
              {/* Bottom padding */}
              <div style={{ height: itemHeight * 2 }} />
            </div>
          </div>
        </div>

        {/* Decimal point */}
        <div className={`mx-2 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
          .
        </div>

        {/* Decimal Picker */}
        <div className="relative">
          <div 
            className={`w-16 overflow-hidden rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
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
              ref={decRef}
              className="h-full overflow-y-scroll scrollbar-hide"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={() => {
                setIsScrolling(true);
                clearTimeout((decRef.current as any)?._scrollTimeout);
                (decRef.current as any)._scrollTimeout = setTimeout(() => {
                  setIsScrolling(false);
                  handleDecScroll();
                }, 150);
              }}
            >
              {/* Top padding */}
              <div style={{ height: itemHeight * 2 }} />
              
              {decValues.map((val) => (
                <div
                  key={val}
                  className={`flex items-center justify-center text-lg font-medium select-none transition-opacity duration-200 ${
                    val === decPart 
                      ? (isDarkMode ? 'text-white opacity-100' : 'text-black opacity-100')
                      : (isDarkMode ? 'text-gray-400 opacity-60' : 'text-gray-600 opacity-60')
                  }`}
                  style={{ 
                    height: itemHeight,
                    scrollSnapAlign: 'center'
                  }}
                >
                  {val}
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