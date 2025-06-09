import React from 'react';
import BrewingApp from './components/BrewingApp';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrewingApp />
    </ThemeProvider>
  );
};

export default App;