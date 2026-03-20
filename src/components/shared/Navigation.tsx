import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  variant?: 'homepage' | 'page';
}

export const Navigation: React.FC<NavigationProps> = ({
  variant = 'homepage'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOrigenPage = location.pathname === '/origen';

  const navItems = [
    { id: 'origen', label: 'Origen', path: '/origen' },
    { id: 'buy', label: 'Buy', path: '/buy' },
    { id: 'timer', label: 'Timer', path: '/timer' },
  ];

  // On the origen page, swap Origen for Home
  const displayItems = isOrigenPage
    ? [{ id: 'home', label: 'Home', path: '/' }, ...navItems.filter(i => i.id !== 'origen')]
    : navItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6">
      <div className="flex justify-center items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20">
        {displayItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`text-lg sm:text-xl font-bold hover:opacity-70 transition-opacity ${
              isOrigenPage ? 'text-white' : 'text-black'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
