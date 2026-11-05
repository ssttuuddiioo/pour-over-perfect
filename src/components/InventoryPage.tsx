import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

// Bags on hand. One row per physical bag; edit the counts here when stock changes.
// Rows are keyed like "honey-100-3", so lowering a count hides that bag's row
// (its saved name stays in the database) and raising it adds empty rows.
const STOCK = [
  { coffee: 'Natural', color: '#1A1AFF', small: 4, big: 4 },
  { coffee: 'Honey', color: '#39FF14', small: 6, big: 3 },
  { coffee: 'Washed', color: '#FF6700', small: 5, big: 3 },
];

interface Slot {
  slot: string;
  coffee: string;
  color: string;
  grams: 100 | 250;
  n: number;
}

const SLOTS: Slot[] = STOCK.flatMap(({ coffee, color, small, big }) =>
  ([[100, small], [250, big]] as const).flatMap(([grams, count]) =>
    Array.from({ length: count }, (_, i) => ({
      slot: `${coffee.toLowerCase()}-${grams}-${i + 1}`,
      coffee,
      color,
      grams,
      n: i + 1,
    })),
  ),
);

type Entry = { name: string; address: string };
const EMPTY: Entry = { name: '', address: '' };

// Remembered in this browser after the first correct password
const PW_KEY = 'origen-inventory-pw';
const readPw = () => {
  try { return localStorage.getItem(PW_KEY) ?? ''; } catch { return ''; }
};
const writePw = (pw: string) => {
  try { if (pw) localStorage.setItem(PW_KEY, pw); else localStorage.removeItem(PW_KEY); } catch { /* private mode */ }
};

const InventoryPage: React.FC = () => {
  const [password, setPassword] = useState(readPw);
  const [typed, setTyped] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [saved, setSaved] = useState<Record<string, Entry>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Not for search engines; the page isn't linked from the menu either
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const load = async (pw: string) => {
    setStatus('loading');
    setMessage('');
    const { data, error } = await supabase.rpc('inventory_load', { p_password: pw });
    if (error) {
      setStatus('error');
      const wrong = error.code === '28P01' || /wrong password/i.test(error.message);
      setMessage(wrong ? 'Wrong password.' : `Couldn't load: ${error.message}`);
      if (wrong) { writePw(''); setPassword(''); }
      return;
    }
    const rows: Record<string, Entry> = {};
    (data as { slot: string; name: string; address: string }[]).forEach((r) => {
      rows[r.slot] = { name: r.name, address: r.address };
    });
    writePw(pw);
    setPassword(pw);
    setEntries(rows);
    setSaved(rows);
    setUnlocked(true);
    setStatus('idle');
  };

  // Open straight away if this browser remembers the password
  useEffect(() => {
    if (password) load(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entryFor = (slot: string) => entries[slot] ?? EMPTY;
  const changed = useMemo(
    () => SLOTS.filter(({ slot }) => {
      const a = entries[slot] ?? EMPTY;
      const b = saved[slot] ?? EMPTY;
      return a.name !== b.name || a.address !== b.address;
    }),
    [entries, saved],
  );
  const dirty = changed.length > 0;

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  const save = async () => {
    setStatus('saving');
    setMessage('');
    const rows = changed.map(({ slot }) => ({ slot, ...entryFor(slot) }));
    const { error } = await supabase.rpc('inventory_save', { p_password: password, p_rows: rows });
    if (error) {
      setStatus('error');
      setMessage(`Couldn't save: ${error.message}`);
      return;
    }
    setSaved({ ...saved, ...Object.fromEntries(rows.map(({ slot, name, address }) => [slot, { name, address }])) });
    setSavedAt(new Date());
    setStatus('idle');
  };

  const update = (slot: string, field: keyof Entry, value: string) =>
    setEntries((prev) => ({ ...prev, [slot]: { ...(prev[slot] ?? EMPTY), [field]: value } }));

  // --- Password screen ---
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center px-6">
        <form
          className="w-full max-w-xs space-y-6"
          onSubmit={(e) => { e.preventDefault(); if (typed) load(typed); }}
        >
          <h1 className="text-3xl italic">Inventory</h1>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Password"
            className="w-full px-0 py-2 bg-transparent border-0 border-b border-black focus:outline-none focus:ring-0 text-lg placeholder-black/40"
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="border border-black px-5 py-2 uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-colors disabled:opacity-40"
            >
              {status === 'loading' ? 'Opening…' : 'Open'}
            </button>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </div>
        </form>
      </div>
    );
  }

  // --- Inventory ---
  const reserved = (s: Slot) => !!(entryFor(s.slot).name.trim() || entryFor(s.slot).address.trim());

  return (
    <div className="min-h-screen bg-white text-black px-5 md:px-12 pt-4 md:pt-8 pb-24">
      {/* Stays at the top while scrolling, so Save is always in reach */}
      <header className="sticky top-0 z-10 -mx-5 md:-mx-12 px-5 md:px-12 py-3 bg-white/95 backdrop-blur flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-6 border-b border-transparent">
        <h1 className="text-3xl md:text-4xl italic">Inventory</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-black/50">
            {status === 'error' ? <span className="text-red-600">{message}</span>
              : dirty ? `${changed.length} unsaved`
              : savedAt ? `Saved ${savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
              : 'All saved'}
          </span>
          <button
            onClick={save}
            disabled={!dirty || status === 'saving'}
            className="border border-black px-6 py-3 md:py-2 uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {/* What's left, per coffee and size */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-10 text-[0.95rem]">
        {STOCK.map(({ coffee, color }) => (
          <div key={coffee} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="italic">{coffee}</span>
            {([100, 250] as const).map((g) => {
              const bags = SLOTS.filter((s) => s.coffee === coffee && s.grams === g);
              const left = bags.filter((s) => !reserved(s)).length;
              return (
                <span key={g} className="text-black/60">
                  {g}g {left}/{bags.length}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* One row per bag */}
      <div className="border-t border-black/15">
        <div className="hidden md:grid grid-cols-[12rem_1fr_2fr] gap-6 py-2 text-xs uppercase tracking-widest text-black/40 border-b border-black/15">
          <span>Bag</span>
          <span>Name</span>
          <span>Address</span>
        </div>
        {SLOTS.map((s, i) => {
          const e = entryFor(s.slot);
          const firstOfGroup = i === 0 || SLOTS[i - 1].coffee !== s.coffee || SLOTS[i - 1].grams !== s.grams;
          return (
            <div
              key={s.slot}
              className={`grid grid-cols-1 md:grid-cols-[12rem_1fr_2fr] gap-x-6 gap-y-1 py-3 md:py-2 border-b border-black/10 ${firstOfGroup && i > 0 ? 'border-t border-t-black/30' : ''}`}
            >
              <div className="flex items-center gap-2 text-[0.95rem]">
                {/* The dot's color says which coffee (see the key at the top) */}
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} aria-label={s.coffee} />
                <span>{s.grams}g</span>
              </div>
              <input
                value={e.name}
                onChange={(ev) => update(s.slot, 'name', ev.target.value)}
                placeholder="Name"
                autoCapitalize="words"
                autoComplete="off"
                className="w-full px-0 py-2.5 md:py-1 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-black/25"
              />
              <input
                value={e.address}
                onChange={(ev) => update(s.slot, 'address', ev.target.value)}
                placeholder="Address"
                autoComplete="off"
                className="w-full px-0 py-2.5 md:py-1 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-black/25"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPage;
