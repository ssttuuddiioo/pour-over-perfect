import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (settings: {
    coffeeType: string;
    grindSize: string;
    waterTemp: string;
    notes: string;
  }) => void;
  initialSettings?: {
    coffeeType: string;
    grindSize: string;
    waterTemp: string;
    notes: string;
  };
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave, initialSettings }) => {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState(initialSettings || {
    coffeeType: '',
    grindSize: '',
    waterTemp: '',
    notes: ''
  });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="h-full flex flex-col w-full max-w-[430px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Add Details</h2>
          <button
            onClick={onClose}
            className={`w-[25px] h-[25px] rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'} hover:opacity-90 transition-opacity`}
            aria-label="Close"
          />
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
              Coffee Type
            </label>
            <input
              type="text"
              value={settings.coffeeType}
              onChange={(e) => setSettings({ ...settings, coffeeType: e.target.value })}
              className={`w-full h-11 px-3 rounded-lg ${
                isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
              } focus:outline-none focus:ring-2 focus:ring-[#ff6700]`}
              placeholder="e.g., Ethiopian Yirgacheffe"
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
              Grind Size
            </label>
            <input
              type="text"
              value={settings.grindSize}
              onChange={(e) => setSettings({ ...settings, grindSize: e.target.value })}
              className={`w-full h-11 px-3 rounded-lg ${
                isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
              } focus:outline-none focus:ring-2 focus:ring-[#ff6700]`}
              placeholder="e.g., Medium-Fine"
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
              Water Temperature
            </label>
            <input
              type="text"
              value={settings.waterTemp}
              onChange={(e) => setSettings({ ...settings, waterTemp: e.target.value })}
              className={`w-full h-11 px-3 rounded-lg ${
                isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
              } focus:outline-none focus:ring-2 focus:ring-[#ff6700]`}
              placeholder="e.g., 94°C"
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
              Notes
            </label>
            <textarea
              value={settings.notes}
              onChange={(e) => setSettings({ ...settings, notes: e.target.value })}
              className={`w-full h-32 px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
              } focus:outline-none focus:ring-2 focus:ring-[#ff6700] resize-none`}
              placeholder="Add any additional notes..."
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className={`w-full h-11 border border-gray-300 rounded-lg text-sm font-medium text-center transition-colors hover:border-[#ff6700] ${isDarkMode ? 'text-white' : 'text-black'}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 