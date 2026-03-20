import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  onScrollToSection?: (sectionId: string) => void;
  variant?: 'homepage' | 'page';
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onScrollToSection,
  variant = 'homepage'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isTimerPage = location.pathname === '/timer';
  const isStoryPage = location.pathname === '/story';

  const handleNavClick = (sectionId: string) => {
    // Coffee has its own page now
    if (sectionId === 'coffee') {
      navigate('/coffee');
      return;
    }
    if (isHomePage && onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      navigate('/home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const navItems = [
    { id: 'coffee', label: 'Coffee' },
    { id: 'buy', label: 'Buy' },
    { id: 'timer', label: 'Timer' }
  ];

  // Different styling for homepage vs other pages
  if (variant === 'page' || isTimerPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex justify-center items-center py-4 px-4 sm:px-6">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10">
            <button 
              onClick={() => navigate('/')} 
              className="text-sm sm:text-base md:text-lg font-bold transition-opacity text-black hover:opacity-70"
            >
              Home
            </button>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm sm:text-base md:text-lg font-bold transition-opacity text-black hover:opacity-70 ${
                  (isTimerPage && item.id === 'timer') ? 'underline' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  // Homepage navigation - transparent background
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6">
      <div className="flex justify-center items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className="text-lg sm:text-xl font-bold text-black hover:opacity-70 transition-opacity"
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;


