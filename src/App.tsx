import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BrewingApp from './components/BrewingApp';
import HomePage from './components/HomePage';
import { ThemeProvider } from './context/ThemeContext';
import { CircleTransitionProvider, useCircleTransition } from './context/CircleTransitionContext';
import CircleTransition from './components/shared/CircleTransition';
import DebugOverlay from './components/DebugOverlay';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { 
    circleState, 
    animationConfigs, 
    updateAnimationConfig, 
    saveAnimationConfigs, 
    exportAnimationConfigs,
    resetAnimationConfigs 
  } = useCircleTransition();
  const isDebugMode = new URLSearchParams(location.search).get('debug') === 'true';

  // Check if we're on the timer page
  const isTimerPage = location.pathname === '/timer';

  return (
    <>
      <CircleTransition />
      <div className="relative z-20">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/timer" element={<BrewingApp />} />
        </Routes>
      </div>
      {isDebugMode && !isTimerPage && (
        <DebugOverlay
          path={location.pathname}
          mode={circleState.mode}
          config={animationConfigs[circleState.mode]}
          onConfigChange={(newConfig) => updateAnimationConfig(circleState.mode, newConfig)}
          onSave={saveAnimationConfigs}
          onExport={exportAnimationConfigs}
          onReset={resetAnimationConfigs}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <CircleTransitionProvider>
          <AppContent />
        </CircleTransitionProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;