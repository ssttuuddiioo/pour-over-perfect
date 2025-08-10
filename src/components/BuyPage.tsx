import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BuyPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });
      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-sm font-medium text-black hover:underline"
        >
          ← back to home
        </button>
        <h1 className="text-2xl font-semibold mb-4">Get notified when available</h1>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="form-name" value="buy-signup" />
            <div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-0 py-2 text-base placeholder-gray-500 text-black bg-transparent border-0 border-b border-gray-300 focus:border-black focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="text-left text-base font-medium text-black hover:opacity-70 underline"
            >
              Sign Up
            </button>
          </form>
        ) : (
          <p className="text-gray-700">Thanks for signing up! We'll let you know as soon as the next roast is ready.</p>
        )}
      </div>
    </div>
  );
};

export default BuyPage;

