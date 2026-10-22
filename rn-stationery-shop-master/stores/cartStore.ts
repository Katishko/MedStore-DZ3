import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { CartLine, Drug } from '../types/drug';

interface CartState {
  lines: Record<string, CartLine>;
  add: (drug: Drug, quantity?: number) => void;
  remove: (drugId: string) => void;
  increment: (drugId: string) => void;
  decrement: (drugId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  lines: {},
  add: (drug, quantity = 1) => set((state) => {
    const existing = state.lines[drug.id];
    const currentQuantity = existing?.quantity ?? 0;
    const nextQuantity = Math.min(drug.stock, currentQuantity + quantity);
    if (nextQuantity <= 0) return state;
    return {
      lines: {
        ...state.lines,
        [drug.id]: existing
          ? { ...existing, quantity: nextQuantity }
          : { drug, quantity: nextQuantity },
      },
    };
  }),
  remove: (drugId) => set((state) => {
    const { [drugId]: _removed, ...rest } = state.lines;
    return { lines: rest };
  }),
  increment: (drugId) => set((state) => {
    const line = state.lines[drugId];
    if (!line || line.quantity >= line.drug.stock) return state;
    return { lines: { ...state.lines, [drugId]: { ...line, quantity: line.quantity + 1 } } };
  }),
  decrement: (drugId) => set((state) => {
    const line = state.lines[drugId];
    if (!line) return state;
    if (line.quantity <= 1) {
      const { [drugId]: _removed, ...rest } = state.lines;
      return { lines: rest };
    }
    return { lines: { ...state.lines, [drugId]: { ...line, quantity: line.quantity - 1 } } };
  }),
  clear: () => set({ lines: {} }),
}));

export const selectCartCount = (state: CartState): number =>
  Object.values(state.lines).reduce((sum, line) => sum + line.quantity, 0);
export const selectCartLines = (state: CartState): CartLine[] => Object.values(state.lines);
export const useCartLines = () => useCartStore(useShallow(selectCartLines));
