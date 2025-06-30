import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CoffeePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate real backend/newsletter service
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
      <h1 className="text-3xl font-bold mb-4">Coffee – Coming Soon ☕️</h1>
      <p className="max-w-md text-center mb-8">
        We&apos;re gearing up for our next roast.
        Sign up below and we&apos;ll notify you as soon as the fresh beans are ready!
      </p>

      {submitted ? (
        <div className="text-green-600 font-medium mb-8">Thank you! You&apos;ll hear from us soon.</div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3 mb-8">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#ff6700]"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-full bg-black text-white font-medium hover:bg-[#ff6700] transition-colors"
          >
            Notify Me
          </button>
        </form>
      )}

      <Link to="/" className="text-sm text-gray-600 hover:text-black underline">Back to Home</Link>
    </div>
  );
};

export default CoffeePage; 