import React, { useState } from 'react';
import BrewingApp from './components/BrewingApp';

function App() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4">
        <BrewingApp onShowAbout={() => setShowAbout(true)} />
      </div>
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full text-center space-y-4">
            <h2 className="text-2xl font-bold mb-2">About Pour Perfect</h2>
            <p>
              Pour Perfect is a simple PWA for brewing and saving your perfect coffee recipes.<br />
              <br />
              - Create and save notes about your brews<br />
              - Mark favorites and view your history<br />
              - Works offline and can be installed on your device!
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => setShowAbout(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;