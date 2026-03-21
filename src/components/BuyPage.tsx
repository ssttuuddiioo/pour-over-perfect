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
    <div className="min-h-screen bg-white">
      <Navigation variant="homepage" />

      {/* Mobile layout — single centered column */}
      <div className="flex md:hidden flex-col items-center px-8 pt-40">
        <img
          src="/photo-final/web/11.jpg"
          alt="Coffee Package"
          className="object-contain mb-10"
          style={{ width: 300 }}
        />

        <div style={{ width: 300 }}>
          <p className="text-black text-sm leading-relaxed mb-8">
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
                className="w-full px-0 py-3 placeholder-gray-400 text-black bg-transparent border-0 border-b border-black focus:border-black focus:outline-none focus:ring-0 text-sm"
              />
              <button
                type="submit"
                className="text-black border border-black px-6 py-2.5 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-widest text-xs"
              >
                Subscribe
              </button>
            </form>
          ) : (
            <p className="text-black text-sm">
              <span className="font-bold">Thanks for subscribing!</span> We'll keep you updated.
            </p>
          )}
        </div>
      </div>

      {/* Desktop layout — image left, form right */}
      <div className="hidden md:grid min-h-screen grid-cols-[1.2fr_1fr]">
        <div className="flex items-center justify-center" style={{ padding: '200px' }}>
          <img
            src="/photo-final/web/11.jpg"
            alt="Coffee Package"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col justify-center px-16 lg:px-20 py-20">
          <p className="text-black text-base leading-relaxed max-w-sm mb-12">
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
                className="w-full px-0 py-3 placeholder-gray-400 text-black bg-transparent border-0 border-b border-black focus:border-black focus:outline-none focus:ring-0 text-base"
              />
              <button
                type="submit"
                className="text-black border border-black px-6 py-2.5 hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-widest text-xs"
              >
                Subscribe
              </button>
            </form>
          ) : (
            <p className="text-black text-base max-w-sm">
              <span className="font-bold">Thanks for subscribing!</span> We'll keep you updated.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
