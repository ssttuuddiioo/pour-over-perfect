import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  // 'spread': the gallery's big menu, words scattered around the screen.
  // Anything else: the small bar across the top.
  variant?: 'homepage' | 'page' | 'spread';
  // Fade the menu out (the spread menu hides while a photo is open)
  hidden?: boolean;
}

const NAV_ITEMS = [
  { id: 'coffee', label: 'Coffee', path: '/origen' },
  { id: 'buy', label: 'Buy', path: '/buy' },
  { id: 'timer', label: 'Timer', path: '/timer' },
];

// Where each word sits in the spread menu, after the Figma frame. Left-column
// words hang from their left edge and right-column words from their right edge,
// so the big type never runs off a narrow screen.
const SPREAD_SPOTS: Record<string, React.CSSProperties> = {
  home: { left: '6.5%', top: '11%' },
  coffee: { right: '13%', top: '36%' },
  buy: { left: '14%', top: '68%' },
  timer: { right: '15.5%', top: '83%' },
};

// Text is white with mix-blend-difference, so it reads black on white and
// inverts over photos passing underneath. The Origen page is solid blue, where
// plain white reads best.
// Rendered straight into <body>: blending only sees what's inside the nav's own
// stacking context, and the gallery page is a transparent layer of its own, so
// inside it the text would blend with nothing and stay white on white.
export const Navigation: React.FC<NavigationProps> = ({ variant, hidden = false }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onBlue = pathname === '/origen';
  const blend = onBlue ? '' : 'mix-blend-difference';

  if (variant === 'spread') {
    const items = [{ id: 'home', label: 'Origen', path: '/' }, ...NAV_ITEMS];
    return createPortal(
      <nav
        className={`fixed inset-0 z-50 pointer-events-none text-white ${blend}`}
        style={{ opacity: hidden ? 0 : 1, transition: 'opacity 0.4s ease' }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="absolute hover:opacity-70 transition-opacity"
            style={{
              ...SPREAD_SPOTS[item.id],
              transform: 'translateY(-50%)',
              pointerEvents: hidden ? 'none' : 'auto',
              fontFamily: "'Jost', 'Futura', sans-serif",
              fontWeight: 450,
              fontSize: 'clamp(2.25rem, 5.2vw, 5.5rem)',
              lineHeight: 1,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>,
      document.body,
    );
  }

  // Small bar: wordmark top left (always home), links top right, current page underlined
  const linkClass = (active: boolean) =>
    `text-lg sm:text-xl font-bold hover:opacity-70 transition-opacity ${
      active ? 'underline decoration-1 underline-offset-[6px]' : ''
    }`;

  return createPortal(
    <nav className={`fixed top-0 left-0 right-0 z-50 py-6 px-4 sm:px-8 md:px-12 text-white ${blend}`}>
      <div className="flex justify-between items-baseline">
        <button onClick={() => navigate('/')} className="text-lg sm:text-xl font-bold hover:opacity-70 transition-opacity">
          Origen
        </button>
        <div className="flex items-baseline gap-5 sm:gap-8 md:gap-10">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={linkClass(pathname === item.path)}
              aria-current={pathname === item.path ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>,
    document.body,
  );
};

export default Navigation;
