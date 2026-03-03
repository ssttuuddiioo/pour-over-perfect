import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BrewingApp from './components/BrewingApp';
import HomePage from './components/HomePage';
import StoryPage from './components/StoryPage';
import { ThemeProvider } from './context/ThemeContext';
import { CircleTransitionProvider } from './context/CircleTransitionContext';
import CircleTransition from './components/shared/CircleTransition';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

// Page-level error fallback
const PageErrorFallback: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
    <div className="text-6xl mb-6">☕</div>
    <h1 className="text-2xl font-bold text-black mb-4">Page Error</h1>
    <p className="text-gray-600 mb-6 text-center max-w-md">
      Something went wrong loading this page. Please try refreshing.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="px-8 py-3 bg-[#ff6700] text-white rounded-full font-bold hover:bg-[#e55a00] transition-colors"
    >
      Refresh Page
    </button>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <CircleTransition />
      <div className="relative z-20">
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <ErrorBoundary fallback={<PageErrorFallback />}>
                <HomePage />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/timer" 
            element={
              <ErrorBoundary fallback={<PageErrorFallback />}>
                <BrewingApp />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/story" 
            element={
              <ErrorBoundary fallback={<PageErrorFallback />}>
                <StoryPage />
              </ErrorBoundary>
            } 
          />
        </Routes>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <CircleTransitionProvider>
            <AppContent />
          </CircleTransitionProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
