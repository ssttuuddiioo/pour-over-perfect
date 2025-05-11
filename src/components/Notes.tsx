import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Star, History, Image as ImageIcon, X } from 'lucide-react';

interface Note {
  id: string;
  coffeeName: string;
  title: string;
  content: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  photo?: string;
}

interface NotesProps {
  brewingSettings?: {
    grindSize: number;
    coffeeAmount: number;
    waterRatio: number;
    totalWater: number;
  };
  onBack?: () => void;
}

export function Notes({ brewingSettings, onBack }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ 
    coffeeName: '', 
    title: '', 
    content: '',
    isFavorite: false,
    photo: ''
  });
  const [view, setView] = useState<'none' | 'favorites' | 'history'>('none');
  const [showThankYou, setShowThankYou] = useState(false);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
    if (brewingSettings) {
      setNewNote({
        coffeeName: '',
        title: `Brewing Settings:\n• Coffee: ${brewingSettings.coffeeAmount}g\n• Grind Size: ${brewingSettings.grindSize}\n• Water Ratio: 1:${brewingSettings.waterRatio}\n• Total Water: ${brewingSettings.totalWater}ml`,
        content: '',
        isFavorite: false,
        photo: ''
      });
    }
  }, [brewingSettings]);

  async function loadNotes() {
    const loadedNotes = await db.getNotes();
    setNotes(loadedNotes);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const note = await db.addNote({
      ...newNote,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNotes([...notes, note]);
    setNewNote({ 
      coffeeName: '', 
      title: brewingSettings ? newNote.title : '', 
      content: '',
      isFavorite: false,
      photo: ''
    });
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 2000);
  }

  async function handleToggleFavorite(id: string) {
    const updatedNote = await db.toggleFavorite(id);
    if (updatedNote) {
      setNotes(notes.map(note => 
        note.id === id ? updatedNote : note
      ));
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewNote(n => ({ ...n, photo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  let filteredNotes: Note[] = [];
  if (view === 'favorites') {
    filteredNotes = notes.filter(note => note.isFavorite);
  } else if (view === 'history') {
    filteredNotes = notes;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex flex-row mt-2 gap-2 items-center">
          {view !== 'none' && (
            <button
              onClick={() => setView('none')}
              className="btn btn-secondary"
              type="button"
            >
              New Note
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setView(view === 'favorites' ? 'none' : 'favorites')}
              className={`btn ${view === 'favorites' ? 'btn-primary' : 'btn-secondary'} flex items-center justify-center`}
              type="button"
              aria-label="Show Favorites"
            >
              <Star size={20} fill={view === 'favorites' ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setView(view === 'history' ? 'none' : 'history')}
              className={`btn ${view === 'history' ? 'btn-primary' : 'btn-secondary'} flex items-center justify-center`}
              type="button"
              aria-label="Show History"
            >
              <History size={20} />
            </button>
          </div>
        </div>
      </div>

      {view === 'none' && (
        showThankYou ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in-scale">
            <div className="text-2xl mb-2">☕</div>
            <div className="text-lg font-semibold mb-1 text-center">Your pour over has been saved,</div>
            <div className="text-lg font-semibold text-center">hope you enjoyed it!</div>
          </div>
        ) : (
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Coffee Name
              </label>
              <input
                type="text"
                value={newNote.coffeeName}
                onChange={(e) => setNewNote({ ...newNote, coffeeName: e.target.value })}
                placeholder="Enter coffee name..."
                className="w-full p-2 border rounded bg-gray-800 text-gray-100 border-gray-700"
                inputMode="text"
              />
            </div>

            <textarea
              value={newNote.title}
              readOnly
              className="w-full p-2 border rounded bg-gray-800 text-gray-100 border-gray-700"
              rows={6}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Notes
              </label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Add your brewing notes here..."
                className="w-full p-2 border rounded bg-gray-800 text-gray-100 border-gray-700"
                rows={4}
                inputMode="text"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Photo of Bag (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full p-2 border rounded bg-gray-800 text-gray-100 border-gray-700"
              />
              {newNote.photo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={newNote.photo} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  <button type="button" className="text-xs text-red-400 underline" onClick={() => setNewNote(n => ({ ...n, photo: '' }))}>Remove</button>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="btn btn-primary w-full"
            >
              Save Note
            </button>
          </form>
        )
      )}

      {view !== 'none' && (
        <>
          <div className="space-y-4">
            {filteredNotes.length === 0 && (
              <div className="text-gray-400 text-center">No notes found.</div>
            )}
            {filteredNotes.map((note) => (
              <div key={note.id} className="p-4 bg-gray-800 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{note.coffeeName}</h3>
                  <div className="flex items-center gap-1">
                    {note.photo && (
                      <button
                        type="button"
                        className="p-1 rounded-full text-blue-400 hover:text-blue-300"
                        aria-label="View Photo"
                        onClick={() => setPhotoModal(note.photo!)}
                      >
                        <ImageIcon size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleFavorite(note.id)}
                      className={`p-1 rounded-full ${
                        note.isFavorite 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      type="button"
                      aria-label="Toggle Favorite"
                    >
                      <Star size={20} fill={note.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{note.title}</pre>
                <p className="text-sm text-gray-400">{note.content}</p>
              </div>
            ))}
          </div>
          {photoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
              <div className="bg-gray-900 p-4 rounded-lg max-w-xs w-full flex flex-col items-center">
                <img src={photoModal} alt="Coffee Bag" className="max-w-full max-h-80 rounded mb-4" />
                <button className="btn btn-secondary" onClick={() => setPhotoModal(null)}>
                  <X size={18} /> Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`
        .animate-fade-in-scale {
          animation: fadeInScale 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
} 