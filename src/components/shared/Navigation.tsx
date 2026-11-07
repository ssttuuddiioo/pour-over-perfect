import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  // Kept so existing pages can pass them; the framed menu is the same everywhere
  variant?: 'homepage' | 'page' | 'spread';
  hidden?: boolean;
}

const NAV_ITEMS = [
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'coffee', label: 'Coffee', path: '/coffee' },
  { id: 'buy', label: 'Buy', path: '/buy' },
  { id: 'timer', label: 'Timer', path: '/timer' },
];

const JOST = "'Jost', 'Futura', sans-serif";

// Every page sits inside a white frame, like a print in a mat: thin on the sides
// and bottom (--frame), a taller band on top (--frame-top) that holds the menu,
// "Origen" on the left and the links in a row on the right. The frame is fixed
// on top of the page, so content scrolls underneath it. Rendered into <body> so
// it sits above every page's own layers.
export const Navigation: React.FC<NavigationProps> = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const link = (label: string, path: string, active: boolean) => (
    <button
      key={path}
      onClick={() => navigate(path)}
      aria-current={active ? 'page' : undefined}
      className={`hover:opacity-60 transition-opacity ${active ? 'underline decoration-1 underline-offset-[5px]' : ''}`}
    >
      {label}
    </button>
  );

  const bar = 'fixed bg-white pointer-events-none';

  return createPortal(
    <>
      {/* Frame: top band, sides, bottom */}
      <div className={`${bar} top-0 left-0 right-0 z-[60]`} style={{ height: 'var(--frame-top)' }} />
      <div className={`${bar} bottom-0 left-0 right-0 z-[60]`} style={{ height: 'var(--frame)' }} />
      <div className={`${bar} top-0 bottom-0 left-0 z-[60]`} style={{ width: 'var(--frame)' }} />
      <div className={`${bar} top-0 bottom-0 right-0 z-[60]`} style={{ width: 'var(--frame)' }} />

      {/* Menu, in the top band */}
      <nav
        className="fixed top-0 left-0 right-0 z-[61] flex items-center justify-between text-black text-[15px] md:text-base"
        style={{ height: 'var(--frame-top)', padding: '0 calc(var(--frame) + 0.75rem)', fontFamily: JOST }}
      >
        {link('Origen', '/', false)}
        <div className="flex items-center gap-4 md:gap-7">
          {NAV_ITEMS.map((item) => link(item.label, item.path, pathname === item.path))}
        </div>
      </nav>
    </>,
    document.body,
  );
};

export default Navigation;
