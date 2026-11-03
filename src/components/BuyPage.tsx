import React, { useState } from 'react';
import Navigation from './shared/Navigation';

const FORMSPREE_URL = 'https://formspree.io/f/mbdzbeyq';

const BuyPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        alert('There was an error subscribing. Please try again.');
        return;
      }
      setSubmitted(true);
      setEmail('');
    } catch {
      alert('There was an error subscribing. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1aff] text-white">
      <Navigation variant="homepage" />

      {/* Mobile layout — single centered column */}
      <div className="flex md:hidden flex-col items-center px-8 pt-40">
        {/* White mat around the photo */}
        <div className="bg-white mb-10" style={{ width: 300, padding: 14 }}>
          <img
            src="/photo-final/buy-web.jpg"
            alt="Three Origen coffee bags with orange, blue and green circles"
            className="block w-full h-auto"
          />
        </div>

        <div style={{ width: 300 }}>
          <p className="text-white text-base leading-relaxed mb-8">
            Sign up to be notified when our next roast drops. This is a small operation. We roast in small batches and only when the coffee is right, so it might be a minute. It'll be worth the wait.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-0 py-3 placeholder-white/60 text-white bg-transparent border-0 border-b border-white focus:border-white focus:outline-none focus:ring-0 text-base"
              />
              <button
                type="submit"
                className="text-white border border-white px-6 py-2.5 hover:bg-white hover:text-[#1a1aff] transition-all duration-200 uppercase tracking-widest text-xs"
              >
                Subscribe
              </button>
            </form>
          ) : (
            <p className="text-white text-base">
              <span className="font-bold">Thanks for subscribing!</span> We'll keep you updated.
            </p>
          )}
        </div>
      </div>

      {/* Desktop layout — split down the middle: the photo on an all-white left
          half, the signup on the blue right half. Both start at the shared content
          top; the left half keeps the shared page margin the menu lines up on. */}
      <div className="hidden md:grid grid-cols-2 min-h-screen">
        <div
          className="bg-white"
          style={{ padding: 'var(--content-top) var(--page-x) 0' }}
        >
          <img
            src="/photo-final/buy-web.jpg"
            alt="Three Origen coffee bags with orange, blue and green circles"
            className="w-full object-contain object-left-top"
            // Never taller than the space between the content top and the link row
            style={{ maxHeight: 'calc(100vh - var(--content-top) - var(--nav-bottom) - var(--nav-word) - 3rem)' }}
          />
        </div>

        <div style={{ padding: 'var(--content-top) var(--page-x) 0' }}>
          <div className="max-w-[30rem] text-white text-[1.0625rem] lg:text-[1.1875rem]">
            <p className="leading-[1.6] mb-12">
              Sign up to be notified when our next roast drops. This is a small operation. We roast in small batches and only when the coffee is right, so it might be a minute. It'll be worth the wait.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-sm space-y-8">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-0 py-3 placeholder-white/60 text-white bg-transparent border-0 border-b border-white focus:border-white focus:outline-none focus:ring-0 text-lg"
                />
                <button
                  type="submit"
                  className="text-white border border-white px-6 py-2.5 hover:bg-white hover:text-[#1a1aff] transition-all duration-200 uppercase tracking-widest text-xs"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <p className="max-w-sm">
                <span className="font-bold">Thanks for subscribing!</span> We'll keep you updated.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
