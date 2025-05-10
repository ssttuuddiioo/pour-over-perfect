import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: {
      id: string;
      coffeeName: string;
      title: string;
      content: string;
      isFavorite: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 
      'by-date': Date;
      'by-favorite': boolean;
    };
  };
}

class DatabaseService {
  private db: IDBPDatabase<NotesDB> | null = null;

  async init() {
    this.db = await openDB<NotesDB>('pour-perfect-notes', 1, {
      upgrade(db) {
        const store = db.createObjectStore('notes', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
        store.createIndex('by-favorite', 'isFavorite');
      },
    });
  }

  async addNote(note: Omit<NotesDB['notes']['value'], 'id'>) {
    if (!this.db) await this.init();
    const id = crypto.randomUUID();
    const noteWithId = { ...note, id };
    await this.db!.add('notes', noteWithId);
    return noteWithId;
  }

  async getNotes() {
    if (!this.db) await this.init();
    return this.db!.getAll('notes');
  }

  async getFavoriteNotes() {
    if (!this.db) await this.init();
    const index = this.db!.transaction('notes').store.index('by-favorite');
    return index.getAll(true);
  }

  async updateNote(note: NotesDB['notes']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('notes', note);
    return note;
  }

  async toggleFavorite(id: string) {
    if (!this.db) await this.init();
    const note = await this.db!.get('notes', id);
    if (note) {
      note.isFavorite = !note.isFavorite;
      await this.db!.put('notes', note);
      return note;
    }
    return null;
  }

  async deleteNote(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('notes', id);
  }
}

export const db = new DatabaseService(); 