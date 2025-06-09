import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface NotesModalProps {
  onClose: () => void;
  notes: Array<{
    id: string;
    date: string;
    coffeeAmount: number;
    ratio: number;
    coffeeType?: string;
    grindSize?: string;
    waterTemp?: string;
    notes?: string;
  }>;
}

const NotesModal: React.FC<NotesModalProps> = ({ onClose, notes }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="h-full flex flex-col w-full max-w-[430px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Past Brews</h2>
          <button
            onClick={onClose}
            className={`w-[25px] h-[25px] rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'} hover:opacity-90 transition-opacity`}
            aria-label="Close"
          />
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border border-gray-300 text-center ${isDarkMode ? 'text-white bg-transparent' : 'text-black bg-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{note.date}</div>
                <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{note.coffeeAmount}g • {note.ratio}:1</div>
              </div>
              {(note.coffeeType || note.grindSize || note.waterTemp) && (
                <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-black/60'} mb-2`}>
                  {note.coffeeType && <span className="mr-2">{note.coffeeType}</span>}
                  {note.grindSize && <span className="mr-2">{note.grindSize}</span>}
                  {note.waterTemp && <span>{note.waterTemp}</span>}
                </div>
              )}
              {note.notes && (
                <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{note.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesModal; 