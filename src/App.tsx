import React, { useState } from 'react';
import BrewingApp from './components/BrewingApp';
import FrontPage from './components/FrontPage';
import CoffeePage from './components/CoffeePage';
import { ThemeProvider } from './context/ThemeContext';

type View = 'front' | 'timer' | 'coffee';

const App: React.FC = () => {
  const [view, setView] = useState<View>('front');

  return (
    <ThemeProvider>
      {view === 'front' && (
        <FrontPage 
          onTimer={() => setView('timer')} 
          onCoffee={() => setView('coffee')} 
          onAbout={() => {
            // Trigger slow scroll to reveal "It all started here"
            const targetScroll = window.innerHeight * 2;
            const startScroll = window.scrollY;
            const distance = targetScroll - startScroll;
            const duration = 3000; // 3 seconds
            const startTime = performance.now();
            
            const smoothScroll = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Ease out function for smooth deceleration
              const easeOut = 1 - Math.pow(1 - progress, 3);
              
              window.scrollTo(0, startScroll + distance * easeOut);
              
              if (progress < 1) {
                requestAnimationFrame(smoothScroll);
              }
            };
            
            requestAnimationFrame(smoothScroll);
          }}
        />
      )}

      {view === 'timer' && <BrewingApp onShowAbout={() => setView('front')} />}

      {view === 'coffee' && <CoffeePage onBack={() => setView('front')} />}
    </ThemeProvider>
  );
};

export default App;