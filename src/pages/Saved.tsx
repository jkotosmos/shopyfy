import { useEffect, useState } from "react";
import { Bookmark, Trash2, Plus } from "lucide-react";
import { Button, Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { addSaved, getSaved, removeSaved, type SavedProduct } from "../lib/storage";
import { NICHES } from "../lib/niches";

export function Saved() {
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(NICHES[0].label);
  const [note, setNote] = useState("");

  useEffect(() => {
    setItems(getSaved());
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setItems(addSaved({ name: name.trim(), category, note }));
    setName("");
    setNote("");
  }

  function handleRemove(id: string) {
    setItems(removeSaved(id));
  }

  return (
    <div className="py-14">
      <Container className="max-w-2xl text-center">
        <Eyebrow>Watchlist</Eyebrow>
        <SectionTitle>Saved products</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">
          Products you bookmark from the Store Builder or Trend Research tools land here — stored only in this
          browser, no account required.
        </p>
      </Container>

      <Container className="mt-10 max-w-3xl">
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Plus size={16} /> Add manually</h3>
          <form onSubmit={handleAdd} className="mt-4 grid gap-3 sm:grid-cols-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
              className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white sm:col-span-2"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            >
              {NICHES.map((n) => <option key={n.id} value={n.label}>{n.emoji} {n.label}</option>)}
            </select>
            <Button type="submit">Add</Button>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white sm:col-span-4"
            />
          </form>
        </Card>

        <div className="mt-8 space-y-3">
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink-300 py-14 text-center text-ink-400 dark:border-ink-700">
              <Bookmark className="mx-auto mb-2" size={26} />
              Nothing saved yet. Bookmark a product from the Store Builder or Trend Research pages.
            </div>
          )}
          {items.map((item) => (
            <Card key={item.id} className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-ink-950 dark:text-white">{item.name}</h4>
                  <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300">{item.category}</span>
                </div>
                {item.note && <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{item.note}</p>}
                <p className="mt-1.5 text-xs text-ink-400">Saved {new Date(item.savedAt).toLocaleDateString()}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                aria-label="Remove"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
