import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Bags on hand; edit the counts here when stock changes. Each bag is keyed like
// "honey-100-3", so lowering a count hides that bag (its saved name stays in the
// database) and raising it adds open bags.
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
}

const slotsFor = (coffee: string, color: string, grams: 100 | 250, count: number): Slot[] =>
  Array.from({ length: count }, (_, i) => ({ slot: `${coffee.toLowerCase()}-${grams}-${i + 1}`, coffee, color, grams }));

const SLOTS: Slot[] = STOCK.flatMap(({ coffee, color, small, big }) => [
  ...slotsFor(coffee, color, 100, small),
  ...slotsFor(coffee, color, 250, big),
]);

type Entry = { name: string; address: string };
const EMPTY: Entry = { name: '', address: '' };
const isReserved = (e?: Entry) => !!e && !!(e.name.trim() || e.address.trim());
const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // The bag being edited, and the draft in its panel
  const [editing, setEditing] = useState<Slot | null>(null);
  const [draft, setDraft] = useState<Entry>(EMPTY);

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
    setUnlocked(true);
    setStatus('idle');
  };

  // Open straight away if this browser remembers the password
  useEffect(() => {
    if (password) load(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (s: Slot) => {
    setEditing(s);
    setDraft(entries[s.slot] ?? EMPTY);
    setMessage('');
  };
  const close = () => setEditing(null);

  // Each bag saves on its own
  const saveBag = async (entry: Entry) => {
    if (!editing) return;
    setStatus('saving');
    const row = { slot: editing.slot, name: entry.name.trim(), address: entry.address.trim() };
    const { error } = await supabase.rpc('inventory_save', { p_password: password, p_rows: [row] });
    if (error) {
      setStatus('error');
      setMessage(`Couldn't save: ${error.message}`);
      return;
    }
    setEntries((prev) => ({ ...prev, [row.slot]: { name: row.name, address: row.address } }));
    setStatus('idle');
    close();
  };

  // Escape closes the panel
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  // --- Password screen ---
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center px-6" style={{ fontFamily: "'Jost', 'Futura', sans-serif" }}>
        <form
          className="w-full max-w-xs space-y-6"
          onSubmit={(e) => { e.preventDefault(); if (typed) load(typed); }}
        >
          <h1 className="text-3xl">Inventory</h1>
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

  // --- Inventory --- (all in Jost, the Futura-style face of the big menu)
  // The grid, after graph paper: thin blue rules, each bag a circle in
  // its coffee's color, crisp-edged, centred in its cell. 250g bags get the big cells; the
  // 100g row splits the same width into cells half the size. Reserved bags fade
  // to 40% and carry the person's initials; unused cells stay empty.
  const RULE = '#1A1AFF';
  const cellBorder = { borderRight: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` };

  const bagCell = (s: Slot) => {
    const e = entries[s.slot];
    const taken = isReserved(e);
    return (
      <button
        key={s.slot}
        onClick={() => open(s)}
        aria-label={`${s.coffee} ${s.grams}g, ${taken ? `reserved for ${e!.name || 'someone'}` : 'open'}`}
        className="relative aspect-square flex items-center justify-center hover:bg-black/[0.03] active:bg-black/[0.06] transition-colors"
        style={cellBorder}
      >
        <span
          className="absolute rounded-full"
          style={{
            width: '66%',
            height: '66%',
            backgroundColor: s.color,
            opacity: taken ? 0.4 : 1,
          }}
        />
        {taken && (
          <span
            className="relative font-semibold"
            style={{ fontSize: s.grams === 250 ? 13 : 10, color: s.coffee === 'Natural' ? '#fff' : '#000' }}
          >
            {initials(e!.name)}
          </span>
        )}
      </button>
    );
  };

  const emptyCell = (key: string) => (
    <div key={key} className="aspect-square" style={cellBorder} aria-hidden />
  );

  // Fill a row of `cols` cells with this coffee's bags of one size, then empty cells
  const row = (coffee: string, grams: 100 | 250, cols: number) => {
    const bags = SLOTS.filter((s) => s.coffee === coffee && s.grams === grams);
    return (
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {bags.map(bagCell)}
        {Array.from({ length: Math.max(0, cols - bags.length) }, (_, k) => emptyCell(`${coffee}-${grams}-empty-${k}`))}
      </div>
    );
  };

  const reservedList = SLOTS.filter((s) => isReserved(entries[s.slot]));

  return (
    <div className="inventory-paper min-h-screen text-black" style={{ fontFamily: "'Jost', 'Futura', sans-serif" }}>
    {/* Everything above the reserved list is sized in grid units (--u, one 100g
        cell) so it sits on the paper's lines: text rows are one unit tall, the
        250g row two. See .inventory-paper in index.css. */}
    <div className="pb-24" style={{ padding: 'var(--u) var(--pad) 6rem', maxWidth: 'calc(var(--gw) + 2 * var(--pad))' }}>
      <header className="flex items-center justify-between gap-4" style={{ height: 'var(--u)' }}>
        <h1 className="text-3xl md:text-4xl leading-none">Inventory</h1>
        <span className="text-sm text-black/50">
          {status === 'error' && !editing ? <span className="text-red-600">{message}</span>
            : `${SLOTS.length - reservedList.length} of ${SLOTS.length} open`}
        </span>
      </header>

      {/* Key: big cells 250g, small cells 100g */}
      <div className="flex items-center gap-4 text-xs text-black/50" style={{ height: 'var(--u)' }}>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border" style={{ borderColor: RULE }} />250g</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 border" style={{ borderColor: RULE }} />100g</span>
      </div>

      <div style={{ width: 'var(--gw)' }}>
        {STOCK.map(({ coffee }, i) => {
          const mine = SLOTS.filter((s) => s.coffee === coffee);
          const left = mine.filter((s) => !isReserved(entries[s.slot])).length;
          return (
            <section key={coffee} style={{ marginTop: i === 0 ? 0 : 'var(--u)' }}>
              <div className="flex items-center justify-between" style={{ height: 'var(--u)' }}>
                <h2 className="text-xl leading-none">{coffee}</h2>
                <span className="text-sm text-black/50">{left} of {mine.length} open</span>
              </div>
              {/* Each cell draws its right and bottom rule; the block's top and left
                  rules sit just outside it, on the same lines as the paper */}
              <div style={{ boxShadow: `-1px 0 0 ${RULE}, 0 -1px 0 ${RULE}, -1px -1px 0 ${RULE}` }}>
                {row(coffee, 250, 4)}
                {row(coffee, 100, 8)}
              </div>
            </section>
          );
        })}
      </div>

      {/* Who has what */}
      {reservedList.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-black/40 mb-3">Reserved</h2>
          <ul className="divide-y divide-black/10">
            {reservedList.map((s) => {
              const e = entries[s.slot];
              return (
                <li key={s.slot}>
                  <button onClick={() => open(s)} className="w-full flex items-start gap-3 py-3 text-left">
                    <span className="w-3 h-3 mt-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-black/50 w-11 shrink-0 pt-0.5">{s.grams}g</span>
                    <span className="min-w-0">
                      <span className="block">{e.name || <span className="text-black/40">No name</span>}</span>
                      {e.address && <span className="block text-sm text-black/60 break-words">{e.address}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Edit panel: slides up from the bottom on phones, centred on desktop */}
      {editing && (
        <div className="fixed inset-0 z-20 flex items-end md:items-center justify-center bg-black/30" onClick={close}>
          <form
            className="w-full md:max-w-md bg-white px-5 pt-5 pb-8 md:p-8 md:rounded space-y-5"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); saveBag(draft); }}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full" style={{ backgroundColor: editing.color }} />
              <span className="text-xl">{editing.coffee}</span>
              <span className="text-black/50">{editing.grams}g</span>
            </div>
            <input
              autoFocus
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Name"
              autoCapitalize="words"
              autoComplete="off"
              className="w-full px-0 py-2.5 text-base bg-transparent border-0 border-b border-black/30 focus:border-black focus:outline-none focus:ring-0 placeholder-black/30"
            />
            <input
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              placeholder="Address"
              autoComplete="off"
              className="w-full px-0 py-2.5 text-base bg-transparent border-0 border-b border-black/30 focus:border-black focus:outline-none focus:ring-0 placeholder-black/30"
            />
            {status === 'error' && <p className="text-sm text-red-600">{message}</p>}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={status === 'saving'}
                className="bg-black text-white px-6 py-3 uppercase tracking-widest text-xs disabled:opacity-40"
              >
                {status === 'saving' ? 'Saving…' : 'Save'}
              </button>
              {isReserved(entries[editing.slot]) && (
                <button
                  type="button"
                  onClick={() => saveBag(EMPTY)}
                  disabled={status === 'saving'}
                  className="border border-black px-5 py-3 uppercase tracking-widest text-xs disabled:opacity-40"
                >
                  Clear
                </button>
              )}
              <button type="button" onClick={close} className="ml-auto text-sm text-black/50 px-2 py-3">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </div>
  );
};

export default InventoryPage;
