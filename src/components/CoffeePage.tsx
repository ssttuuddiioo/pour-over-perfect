import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './shared/Navigation';

// The coffees we have now: all Castillo from Finca Bellavista, one per process.
// Each gets a full-height panel in its bag's color. `ink` is the text color that
// reads on that color (white is unreadable on the neon green).
const COFFEES = [
  { color: '#1A1AFF', ink: '#fff', process: 'Natural', notes: 'Red wine, raisin, dark chocolate' },
  { color: '#39FF14', ink: '#000', process: 'Honey', notes: 'Honeysuckle, apricot, lime' },
  { color: '#FF6700', ink: '#000', process: 'Washed', notes: 'Hazelnut, clean, classic' },
];

const CoffeePage: React.FC = () => {
  const navigate = useNavigate();

  const farm = (
    <>
      <p>Castillo, grown by Oscar Castro</p>
      <p>Finca Bellavista, Charal&aacute;, Santander &bull; 1900masl</p>
      <p>
        Roasted at{' '}
        <a href="https://www.multimodalroasting.com/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">
          Multimodal
        </a>
      </p>
    </>
  );
  const buy = (
    <>
      <p>100g &mdash; $10</p>
      <p>250g &mdash; $20</p>
      <p className="pt-3">
        <span className="italic">Coming soon.</span>{' '}
        <button onClick={() => navigate('/buy')} className="underline hover:opacity-70 transition-opacity">
          Get notified
        </button>
      </p>
    </>
  );
  // What sits on the right of each band
  const sides = [<p className="italic">Three coffees from one lot</p>, farm, buy];

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="homepage" />

      {/* Desktop — the drying tunnel full height on the left,
          the three coffees as horizontal bands in the bag colors on the right. Each
          band: the process and notes on the left, what we share on the right. */}
      <div className="hidden md:grid grid-cols-[2fr_3fr] h-screen">
        <div className="relative h-full overflow-hidden">
          <img
            src="/photo-final/large/29.jpg"
            alt="Coffee drying on raised beds inside a greenhouse tunnel at Finca Bellavista"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-rows-3 h-full">
          {COFFEES.map((coffee, i) => (
            <section
              key={coffee.process}
              className="grid grid-cols-[1fr_minmax(0,18rem)] gap-8 items-end text-[1rem] lg:text-[1.125rem] leading-relaxed"
              style={{
                backgroundColor: coffee.color,
                color: coffee.ink,
                padding: 'clamp(1.25rem, 3.5vh, 2.75rem) clamp(1.5rem, 3vw, 3.5rem)',
              }}
            >
              <div>
                <h2 className="italic leading-none mb-3" style={{ fontSize: 'var(--nav-word)' }}>
                  {coffee.process}
                </h2>
                <p>{coffee.notes}</p>
              </div>
              <div className="space-y-0.5">{sides[i]}</div>
            </section>
          ))}
        </div>
      </div>

      {/* Phones — the photo, the panels stacked, then the shared details */}
      <div className="md:hidden" style={{ paddingTop: 'var(--frame-top)' }}>
        <img
          src="/photo-final/large/29.jpg"
          alt="Coffee drying on raised beds inside a greenhouse tunnel at Finca Bellavista"
          className="w-full h-[60vh] object-cover"
        />
        {COFFEES.map((coffee) => (
          <section
            key={coffee.process}
            className="px-8 py-14 min-h-[42vh]"
            style={{ backgroundColor: coffee.color, color: coffee.ink }}
          >
            <h2 className="text-5xl italic leading-none mb-4">{coffee.process}</h2>
            <p className="text-base leading-relaxed">{coffee.notes}</p>
          </section>
        ))}
        <div className="px-8 py-12 space-y-6 text-black text-base leading-relaxed">
          <div className="space-y-0.5">{farm}</div>
          <div className="space-y-0.5">{buy}</div>
        </div>
      </div>
    </div>
  );
};

export default CoffeePage;
