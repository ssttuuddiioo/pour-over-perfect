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
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="bg-[#ff6700] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-white hover:opacity-80 transition-opacity">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">Origen Coffee</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-black">
              From the Mountains of Santander
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              A small-batch Colombian coffee project born from adventure and discovery. 
              After meeting Oscar Castro in Charalá, Santander, we're bringing you direct-from-farm 
              beans with a story in every cup.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">Single Origin</span>
              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">Direct Trade</span>
              <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">Small Batch</span>
            </div>
          </div>
          <div className="bg-gray-200 rounded-2xl aspect-square flex items-center justify-center">
            <span className="text-gray-500">Coffee Farm Image</span>
          </div>
        </div>
      </div>

      {/* Coffee Details Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-black">Our Coffee</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h4 className="text-xl font-bold mb-4 text-black">Origin</h4>
              <p className="text-gray-600 mb-4">
                <strong>Region:</strong> Charalá, Santander<br/>
                <strong>Altitude:</strong> 1,400-1,800m<br/>
                <strong>Variety:</strong> Caturra, Castillo<br/>
                <strong>Process:</strong> Washed
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h4 className="text-xl font-bold mb-4 text-black">Tasting Notes</h4>
              <p className="text-gray-600 mb-4">
                <strong>Flavor:</strong> Chocolate, caramel<br/>
                <strong>Body:</strong> Medium to full<br/>
                <strong>Acidity:</strong> Bright, citric<br/>
                <strong>Finish:</strong> Clean, lingering
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h4 className="text-xl font-bold mb-4 text-black">Brewing</h4>
              <p className="text-gray-600 mb-4">
                <strong>Best for:</strong> Pour-over, French press<br/>
                <strong>Grind:</strong> Medium-coarse<br/>
                <strong>Ratio:</strong> 1:15-1:17<br/>
                <strong>Temp:</strong> 195-205°F
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-200 rounded-2xl aspect-[4/3] flex items-center justify-center">
            <span className="text-gray-500">Oscar Castro's Farm</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-6 text-black">The Story</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              After quitting a grueling bike-packing race across the Andes mountains, 
              I met Oscar Castro in Charalá, Santander. I visited his farm and shipped 
              forty pounds of parchment beans to Brooklyn.
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              I've been roasting in small batches because I've had to manually hull... 
              I'm diving into the world of single origin, direct-to-consumer sourcing, 
              buying, import, roasting, packaging—the adventure never ends.
            </p>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-[#ff6700] text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Stay in the Loop</h3>
          <p className="text-lg mb-8 opacity-90">
            Get notified when the next roast is ready. We'll send you updates on new beans, 
            brewing tips, and stories from the farm.
          </p>

          {submitted ? (
            <div className="bg-white/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-lg font-semibold">Thank you!</p>
              <p className="opacity-90">You'll hear from us soon with coffee updates.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ fontSize: '16px' }} // Prevent zoom on iOS
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-sm opacity-75 mt-3">
                No spam, just great coffee updates.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Made with ❤️ by{' '}
            <Link to="/" className="text-[#ff6700] hover:underline">
              Origen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoffeePage; 