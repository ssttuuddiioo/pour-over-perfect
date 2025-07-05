import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('form-name', 'newsletter');
      formData.append('email', email);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString()
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link 
            to="/" 
            className="text-black hover:text-[#ff6700] transition-colors font-medium"
          >
            ← Back
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold mb-4 text-black">Learning in NYC</h1>
            <p className="text-lg text-gray-600">
              A journey from hulling beans by hand to understanding the craft.
            </p>
          </div>

          {/* Learning Journey Sections */}
          <div className="space-y-16">
            {/* Hand Hulling */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-black">Starting from Scratch</h2>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    When I first brought those forty pounds of parchment beans from Oscar's farm in Charalá 
                    to Brooklyn, I had no idea what I was getting into. The learning curve was steep – 
                    starting with manually hulling each bean by hand.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Hours spent cracking open each cherry, separating the bean from its parchment layer, 
                    understanding moisture content, and learning why some beans crack differently than others. 
                    It was tedious, but it taught me to respect every single bean.
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-6">
                  <h3 className="font-semibold mb-3 text-black">What Hand Hulling Taught Me:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Bean density and quality assessment</li>
                    <li>• Moisture content recognition</li>
                    <li>• Defect identification</li>
                    <li>• The value of each bean</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Finding Methods */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-black">Finding My Method</h2>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="bg-gray-100 rounded-lg p-6">
                  <h3 className="font-semibold mb-3 text-black">Equipment Evolution:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Hand hulling → Small hulling machine</li>
                    <li>• Pan roasting → Home roaster</li>
                    <li>• Trial grinders → Proper burr grinder</li>
                    <li>• Basic scales → 0.1g precision</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    NYC became my laboratory. Each morning was an experiment – testing different roast 
                    profiles, grind sizes, water temperatures. I dove deep into understanding how each 
                    variable affects extraction and flavor.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    The multimodal approach emerged naturally: combining traditional Colombian methods 
                    with modern precision tools, mixing intuition gained from Oscar's farm with 
                    data-driven brewing techniques.
                  </p>
                </div>
              </div>
            </section>

            {/* Learning from the Best */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-black">Learning from the Best</h2>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  NYC's coffee scene became my classroom. I spent countless hours at the best shops, 
                  watching baristas work, asking questions, and tasting everything I could get my hands on.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold mb-2 text-black">Technique</h3>
                    <p className="text-sm text-gray-600">
                      Studying pour patterns, timing, and temperature control from competition-level baristas.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold mb-2 text-black">Cupping</h3>
                    <p className="text-sm text-gray-600">
                      Developing palate through cupping sessions and learning to identify origin characteristics.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold mb-2 text-black">Roasting</h3>
                    <p className="text-sm text-gray-600">
                      Understanding how different roast profiles bring out the best in Colombian beans.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Early Coffee Hours */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-black">Early Coffee Hours</h2>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The best learning happens in the quiet hours before the city wakes up. 5 AM roasting 
                    sessions became my ritual – when the air is calm and every sense is heightened.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    These early morning hours taught me patience, consistency, and the importance of 
                    documentation. Every batch roasted, every cup brewed, every note taken – building 
                    a library of knowledge one sunrise at a time.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-sm italic">
                    "The city sleeps, but the coffee doesn't. Some of my best roasts happen when 
                    Manhattan is still dreaming."
                  </p>
                </div>
                <div className="bg-[#ff6700] text-white rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Current Focus:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Perfecting single-origin roast profiles</li>
                    <li>• Building direct relationships with farmers</li>
                    <li>• Documenting the learning process</li>
                    <li>• Sharing knowledge through this app</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Newsletter Section */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4 text-black">Follow the Journey</h3>
              <p className="text-gray-600 mb-6">
                Get updates on new roasts, learning discoveries, and behind-the-scenes stories 
                from the early morning coffee hours.
              </p>

              {isSubmitted ? (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-green-800 font-semibold">Thanks for joining!</p>
                  <p className="text-green-700 text-sm">You'll hear about the latest learning adventures.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#ff6700] text-black"
                      style={{ fontSize: '16px' }} // Prevent zoom on iOS
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="px-6 py-3 bg-[#ff6700] text-white rounded-lg font-medium hover:bg-[#e55a00] transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Updates on roasts, techniques, and the learning process.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              Made with ❤️ and countless early mornings by{' '}
              <Link to="/" className="text-[#ff6700] hover:underline">
                Origen
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 