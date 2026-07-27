export interface SavedProduct {
  id: string;
  name: string;
  category: string;
  note: string;
  savedAt: number;
}

const KEY = "shopyfy_saved_products_v1";

export function getSaved(): SavedProduct[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedProduct[];
  } catch {
    return [];
  }
}

export function addSaved(item: Omit<SavedProduct, "id" | "savedAt">): SavedProduct[] {
  const items = getSaved();
  const newItem: SavedProduct = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, savedAt: Date.now() };
  const next = [newItem, ...items];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function removeSaved(id: string): SavedProduct[] {
  const next = getSaved().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
