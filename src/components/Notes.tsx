import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Star, History } from 'lucide-react';

interface Note {
  id: string;
  coffeeName: string;
  title: string;
  content: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
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
    isFavorite: false 
  });
  const [view, setView] = useState<'none' | 'favorites' | 'history'>('none');

  useEffect(() => {
    loadNotes();
    if (brewingSettings) {
      setNewNote({
        coffeeName: '',
        title: `Brewing Settings:\n• Coffee: ${brewingSettings.coffeeAmount}g\n• Grind Size: ${brewingSettings.grindSize}\n• Water Ratio: 1:${brewingSettings.waterRatio}\n• Total Water: ${brewingSettings.totalWater}ml`,
        content: '',
        isFavorite: false
      });
    }
  }, [brewingSettings]);

  async function loadNotes() {
    const loadedNotes = await db.getNotes();
    setNotes(loadedNotes);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.content || !newNote.coffeeName) return;

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
      isFavorite: false 
    });
  }

  async function handleToggleFavorite(id: string) {
    const updatedNote = await db.toggleFavorite(id);
    if (updatedNote) {
      setNotes(notes.map(note => 
        note.id === id ? updatedNote : note
      ));
    }
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
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Brewing Settings
            </label>
            <textarea
              value={newNote.title}
              readOnly
              className="w-full p-2 border rounded bg-gray-800 text-gray-100 border-gray-700"
              rows={6}
            />
          </div>

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
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary w-full"
          >
            Save Note
          </button>
        </form>
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
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{note.title}</pre>
                <p className="text-sm text-gray-400">{note.content}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 