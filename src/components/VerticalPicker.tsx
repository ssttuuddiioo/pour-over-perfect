import React, { useRef, useEffect } from 'react';

interface VerticalPickerProps {
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  isDarkMode?: boolean;
  storageKey?: string; // for localStorage persistence
}

const containerHeight = 250;
const itemHeight = 50;
const padding = (containerHeight - itemHeight) / 2; // 100px
const intMin = 1;
const intMax = 50;
const decMin = 0;
const decMax = 9;

const VerticalPicker: React.FC<VerticalPickerProps> = ({
  value,
  onChange,
  unit = '',
  isDarkMode = true,
  storageKey,
}) => {
  const intRef = useRef<HTMLDivElement>(null);
  const decRef = useRef<HTMLDivElement>(null);

  // Split value into integer and decimal
  const intPart = Math.floor(value);
  const decPart = Math.round((value - intPart) * 10);

  // Persist value
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, value.toFixed(1));
    }
  }, [value, storageKey]);

  // Scroll to correct position when value changes
  useEffect(() => {
    if (intRef.current) {
      intRef.current.scrollTo({ top: (intPart - intMin) * itemHeight, behavior: 'smooth' });
    }
    if (decRef.current) {
      decRef.current.scrollTo({ top: (decPart - decMin) * itemHeight, behavior: 'smooth' });
    }
  }, [intPart, decPart]);

  // Snap integer scroll
  const handleIntScroll = () => {
    if (!intRef.current) return;
    const scrollTop = intRef.current.scrollTop;
    const N = intMax - intMin + 1;
    let idx = Math.round(scrollTop / itemHeight);
    idx = Math.max(0, Math.min(N - 1, idx));
    let snapped = intMin + idx;
    if (scrollTop === 0) snapped = intMin;
    const maxScroll = intRef.current.scrollHeight - intRef.current.clientHeight;
    console.log('[INT] scrollTop:', scrollTop, 'maxScroll:', maxScroll, 'idx:', idx, 'snapped:', snapped);
    if (snapped !== intPart) {
      onChange(Number(`${snapped}.${decPart}`));
    }
    intRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
  };

  // Snap decimal scroll
  const handleDecScroll = () => {
    if (!decRef.current) return;
    const scrollTop = decRef.current.scrollTop;
    const N = decMax - decMin + 1;
    let idx = Math.round(scrollTop / itemHeight);
    idx = Math.max(0, Math.min(N - 1, idx));
    const snapped = decMin + idx;
    const maxScroll = decRef.current.scrollHeight - decRef.current.clientHeight;
    console.log('[DEC] scrollTop:', scrollTop, 'maxScroll:', maxScroll, 'idx:', idx, 'snapped:', snapped);
    if (snapped !== decPart) {
      onChange(Number(`${intPart}.${snapped}`));
    }
    decRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center space-x-1">
      <div
        className="flex flex-row items-center justify-center px-4 border border-gray-300 rounded-lg bg-transparent overflow-hidden w-full max-w-[180px] mx-auto"
        style={{ height: containerHeight }}
      >
        {/* Integer column */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{ height: containerHeight, width: 96 }}
        >
          {/* Highlight box */}
          <div className="absolute left-0 right-0 h-[50px] z-10 pointer-events-none" style={{ top: 100, background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 8, border: isDarkMode ? '1px solid #222' : '1px solid #D1D5DB' }} />
          <div
            ref={intRef}
            className="h-full overflow-y-auto scrollbar-hide flex flex-col items-center justify-center"
            onScroll={() => { clearTimeout((intRef.current as any)?._snapTimeout); (intRef.current as any)._snapTimeout = setTimeout(handleIntScroll, 120); }}
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div style={{ height: (intMax - intMin) * itemHeight + containerHeight }}>
              <div style={{ height: padding }} />
              {Array.from({ length: intMax - intMin + 1 }, (_, i) => intMin + i).map((item, idx, arr) => (
                <div
                  key={item}
                  className={`h-[50px] flex items-center justify-center text-2xl font-medium select-none text-center`}
                  style={{
                    scrollSnapAlign: 'center',
                    color: item === intPart ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
                    fontWeight: item === intPart ? 600 : 400,
                    border: idx === 0 || idx === arr.length - 1 ? '2px solid red' : undefined,
                  }}
                >
                  {item}
                </div>
              ))}
              <div style={{ height: padding }} />
            </div>
          </div>
        </div>
        {/* Decimal column */}
        <span className={`text-2xl font-medium mx-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>.</span>
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{ height: containerHeight, width: 64 }}
        >
          {/* Highlight box */}
          <div className="absolute left-0 right-0 h-[50px] z-10 pointer-events-none" style={{ top: 100, background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 8, border: isDarkMode ? '1px solid #222' : '1px solid #D1D5DB' }} />
          <div
            ref={decRef}
            className="h-full overflow-y-auto scrollbar-hide flex flex-col items-center justify-center"
            onScroll={() => { clearTimeout((decRef.current as any)?._snapTimeout); (decRef.current as any)._snapTimeout = setTimeout(handleDecScroll, 120); }}
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div style={{ height: (decMax - decMin) * itemHeight + containerHeight }}>
              <div style={{ height: padding }} />
              {Array.from({ length: decMax - decMin + 1 }, (_, i) => decMin + i).map((item, idx, arr) => (
                <div
                  key={item}
                  className={`h-[50px] flex items-center justify-center text-2xl font-medium select-none text-center`}
                  style={{
                    scrollSnapAlign: 'center',
                    color: item === decPart ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
                    fontWeight: item === decPart ? 600 : 400,
                    border: idx === 0 || idx === arr.length - 1 ? '2px solid red' : undefined,
                  }}
                >
                  {item}
                </div>
              ))}
              <div style={{ height: padding }} />
            </div>
          </div>
        </div>
      </div>
      {unit && (
        <span className={`text-2xl font-medium ${isDarkMode ? 'text-white' : 'text-black'} ml-1`}>{unit}</span>
      )}
    </div>
  );
};

export default VerticalPicker;