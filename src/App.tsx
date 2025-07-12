import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrewingApp from './components/BrewingApp';
import FrontPage from './components/FrontPage';
import CoffeePage from './components/CoffeePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import CalmPage from './components/CalmPage';
import { ThemeProvider } from './context/ThemeContext';
import { CircleTransitionProvider } from './context/CircleTransitionContext';
import CircleTransition from './components/shared/CircleTransition';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <CircleTransitionProvider>
          {/* Global circle that persists across pages */}
          <CircleTransition />
          
          <Routes>
            <Route path="/" element={<FrontPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/coffee" element={<CoffeePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/calm" element={<CalmPage />} />
          </Routes>
        </CircleTransitionProvider>
        
        {/* Standalone timer route without animations */}
        <Routes>
          <Route path="/timer" element={<BrewingApp />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;