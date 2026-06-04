// @arcana/local-node — Inventory page (v0.3).
//
// Server component. Fetches initial data for the three related lists (green
// lots, roasted inventory, products) on the server so the page works
// without JS, then hands off to the client `InventoryTabs` for interactivity
// (form state, React Query cache, optimistic updates).

import { InventoryTabs } from './InventoryTabs';
import { API_URL } from '@/lib/api';

interface GreenLot {
  id: string;
  code: string;
  name: string;
  originCountry: string | null;
  region: string | null;
  farm: string | null;
  variety: string | null;
  process: string | null;
  initialStockKg: number;
  currentStockKg: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  movements?: Array<{ createdAt: string; type: string; quantityKg: number }>;
}
interface RoastedInventoryRow {
  id: string;
  productId: string;
  locationId: string;
  onHandKg: number;
  updatedAt: string;
  product: { id: string; code: string; name: string; roastStyle: string | null; active: boolean };
  location: { id: string; name: string };
}
interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  roastStyle: string | null;
  defaultBatchSizeKg: number | null;
  active: boolean;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export default async function InventoryPage() {
  let initialGreen: { lots: GreenLot[] } = { lots: [] };
  let initialRoasted: { items: RoastedInventoryRow[] } = { items: [] };
  let initialProducts: { products: Product[] } = { products: [] };
  let initialLocations: Array<{ id: string; name: string }> = [];
  let loadError: string | null = null;

  try {
    // Locations are not exposed as their own endpoint yet; derive from the
    // current roasted inventory. The demo seed always has one location, but
    // we also fall back to looking it up via the lots' movements if needed.
    const [g, r, p] = await Promise.all([
      fetchJson<{ lots: GreenLot[] }>('/api/inventory/green'),
      fetchJson<{ items: RoastedInventoryRow[] }>('/api/inventory/roasted'),
      fetchJson<{ products: Product[] }>('/api/products'),
    ]);
    initialGreen = g;
    initialRoasted = r;
    initialProducts = p;
    const locMap = new Map<string, { id: string; name: string }>();
    for (const row of r.items) locMap.set(row.location.id, { id: row.location.id, name: row.location.name });
    initialLocations = Array.from(locMap.values());
  } catch (err) {
    loadError = (err as Error).message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Inventory</h2>
        <p className="text-sm text-bean-500">Green lots and roasted stock. All data is local to this node.</p>
      </div>

      {loadError ? (
        <div className="card border-roast-500 bg-roast-50">
          <p className="text-roast-700 font-medium">Failed to load inventory</p>
          <p className="text-xs text-bean-500 mt-2">{loadError}</p>
        </div>
      ) : (
        <InventoryTabs
          initialGreen={initialGreen}
          initialRoasted={initialRoasted}
          initialProducts={initialProducts}
          initialLocations={initialLocations}
        />
      )}
    </div>
  );
}
