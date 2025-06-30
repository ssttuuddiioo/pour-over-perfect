import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
              About Origen
            </h1>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Origen is born from a passion for perfect pour-over coffee. We believe that great coffee 
                is more than just a drink – it's a ritual, a moment of mindfulness, and a journey of discovery.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                It all started here, with a simple question: How can we help coffee lovers brew the perfect cup, 
                every single time? Our team of coffee enthusiasts and technologists came together to create 
                tools that bridge the gap between artisanal expertise and everyday brewing.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                What We Do
              </h2>
              <ul className="text-gray-600 dark:text-gray-300 mb-6">
                <li className="mb-2">• Precision brewing guides tailored to your equipment and preferences</li>
                <li className="mb-2">• Interactive timers that adapt to different coffee origins and roast levels</li>
                <li className="mb-2">• Flavor profiling tools to help you understand and improve your brews</li>
                <li className="mb-2">• A community-driven approach to sharing brewing knowledge</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                To democratize exceptional coffee by making professional brewing techniques accessible to everyone. 
                Whether you're a beginner or a seasoned barista, Origen provides the tools and knowledge you need 
                to elevate your coffee experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 