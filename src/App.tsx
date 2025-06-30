import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrewingApp from './components/BrewingApp';
import FrontPage from './components/FrontPage';
import CoffeePage from './components/CoffeePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/coffee" element={<CoffeePage />} />
          <Route path="/timer" element={<BrewingApp />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;