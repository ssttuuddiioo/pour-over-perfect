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
        <FrontPage onTimer={() => setView('timer')} onCoffee={() => setView('coffee')} />
      )}

      {view === 'timer' && <BrewingApp />}

      {view === 'coffee' && <CoffeePage onBack={() => setView('front')} />}
    </ThemeProvider>
  );
};

export default App;