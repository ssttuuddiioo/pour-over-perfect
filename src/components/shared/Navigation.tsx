import React, { useEffect, useState } from 'react';
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
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'coffee', label: 'Coffee', path: '/coffee' },
  { id: 'buy', label: 'Buy', path: '/buy' },
  { id: 'timer', label: 'Timer', path: '/timer' },
];

// Where each word sits in the spread menu, after the Figma frame. Left-column
// words hang from their left edge and right-column words from their right edge,
// so the big type never runs off a narrow screen.
const SPREAD_SPOTS: Record<string, React.CSSProperties> = {
  home: { left: 'var(--page-x)', top: 'var(--nav-top)' },
  story: { left: '30%', top: '40%' },
  coffee: { right: '13%', top: '36%' },
  buy: { left: '14%', top: '68%' },
  timer: { right: '15.5%', top: '83%' },
};

// The spread menu shows on every page on desktop, and on the gallery on phones too
const DESKTOP_QUERY = '(min-width: 768px)';

const useIsDesktop = () => {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
};

// Text is white with mix-blend-difference, so it reads black on white and
// inverts over photos passing underneath. On solid blue (onBlue) plain white
// reads best.
// Rendered straight into <body>: blending only sees what's inside the nav's own
// stacking context, and the gallery page is a transparent layer of its own, so
// inside it the text would blend with nothing and stay white on white.
export const Navigation: React.FC<NavigationProps> = ({ variant, hidden = false }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDesktop = useIsDesktop();
  // Solid blue under the menu: the Origen page, and Buy on phones (on desktop
  // Buy is split, with the menu over its white half)
  const onBlue = pathname === '/story' || (pathname === '/buy' && !isDesktop);
  // Pages laid out on the editorial grid (index.css) keep their links at the
  // bottom left, stacked, clear of the text column. The story page adds the orange dot.
  const rowLinks = pathname === '/story' || pathname === '/buy' || pathname === '/coffee';
  const stackLinks = rowLinks;
  const showDot = pathname === '/story';
  // The Coffee page's menu sits on its photo on desktop: plain white (the page
  // darkens the photo under it). On phones the top bar is black on a white backing,
  // since colored panels scroll underneath.
  const onCoffee = pathname === '/coffee';
  const ink = onCoffee
    ? (isDesktop ? 'text-white' : 'text-black')
    : onBlue ? 'text-white' : 'text-white mix-blend-difference';

  if (variant === 'spread' || isDesktop) {
    const word = (item: { id: string; label: string; path: string }, place?: React.CSSProperties) => (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        className={`hover:opacity-70 transition-opacity ${place ? 'absolute' : ''} ${
          item.id !== 'home' && pathname === item.path ? 'underline decoration-2 underline-offset-[0.18em]' : ''
        }`}
        aria-current={pathname === item.path ? 'page' : undefined}
        style={{
          ...(place ? { ...place, transform: 'translateY(-50%)' } : {}),
          pointerEvents: hidden ? 'none' : 'auto',
          fontFamily: "'Jost', 'Futura', sans-serif",
          fontWeight: 450,
          fontSize: 'var(--nav-word)',
          lineHeight: 1,
        }}
      >
        {item.label}
      </button>
    );
    const home = { id: 'home', label: 'Origen', path: '/' };

    return createPortal(
      <nav
        className={`fixed inset-0 z-50 pointer-events-none ${ink}`}
        style={{ opacity: hidden ? 0 : 1, transition: 'opacity 0.4s ease' }}
      >
        {word(home, SPREAD_SPOTS.home)}
        {rowLinks ? (
          <div
            className={`absolute flex ${stackLinks ? 'flex-col items-start' : 'items-baseline'}`}
            style={{ left: 'var(--page-x)', bottom: 'var(--nav-bottom)', gap: stackLinks ? '0.06em' : '0.5em', fontSize: 'var(--nav-word)' }}
          >
            {NAV_ITEMS.map((item) => word(item))}
            {/* Story page: the orange dot sits under the stack, sized to the type */}
            {showDot && (
              <div className="rounded-full bg-[#ff6700]" style={{ width: '0.6em', height: '0.6em', marginTop: '0.25em' }} />
            )}
          </div>
        ) : (
          NAV_ITEMS.map((item) => word(item, SPREAD_SPOTS[item.id]))
        )}
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
    <nav className={`fixed top-0 left-0 right-0 z-50 py-6 px-4 sm:px-8 md:px-12 ${ink} ${onCoffee ? 'bg-white' : ''}`}>
      <div className="flex justify-between items-baseline">
        <button onClick={() => navigate('/')} className="text-lg sm:text-xl font-bold hover:opacity-70 transition-opacity">
          Origen
        </button>
        <div className="flex items-baseline gap-4 sm:gap-8 md:gap-10">
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
