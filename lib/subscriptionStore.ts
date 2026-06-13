import { create } from "zustand";
import { Database } from "@/src/types/database.types";

export type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];

interface SubscriptionStore {
  subscriptions: SubscriptionRow[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSubscriptions: (subscriptions: SubscriptionRow[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Optimistic UI updates
  optimisticAdd: (subscription: SubscriptionRow) => void;
  optimisticUpdate: (id: string, updates: Partial<SubscriptionRow>) => void;
  optimisticDelete: (id: string) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: [],
  isLoading: true,
  error: null,

  setSubscriptions: (subscriptions) => set({ subscriptions, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  optimisticAdd: (subscription) =>
    set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),

  optimisticUpdate: (id, updates) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    })),

  optimisticDelete: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),
}));
