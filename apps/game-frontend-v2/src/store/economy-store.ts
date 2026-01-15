import { create } from "zustand";

/**
 * Credit transaction
 */
export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "subscription" | "tip_sent" | "tip_received" | "ai_usage" | "content_purchase" | "content_sale";
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

/**
 * Tip with user info
 */
export interface Tip {
  id: string;
  amount: number;
  message: string | null;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  receiver?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  universe?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Earnings summary
 */
export interface EarningsSummary {
  totalEarnings: number;
  tipsReceived: number;
  salesRevenue: number;
  thisMonth: number;
}

/**
 * Economy store state
 */
interface EconomyState {
  // Credits
  balance: number;
  transactions: CreditTransaction[];
  totalTransactions: number;
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;

  // Tips
  sentTips: Tip[];
  receivedTips: Tip[];
  totalReceivedTips: number;
  totalTipsAmount: number;
  isLoadingTips: boolean;

  // Earnings
  earnings: EarningsSummary | null;
  isLoadingEarnings: boolean;

  // Error
  error: string | null;
}

/**
 * Economy store actions
 */
interface EconomyActions {
  // Credits
  loadBalance: () => Promise<void>;
  loadTransactions: (offset?: number) => Promise<void>;
  addCredits: (amount: number, description?: string) => Promise<boolean>;

  // Tips
  sendTip: (receiverId: string, amount: number, universeId?: string, message?: string) => Promise<boolean>;
  loadSentTips: (offset?: number) => Promise<void>;
  loadReceivedTips: (offset?: number) => Promise<void>;

  // Purchases
  purchaseContent: (universeId: string) => Promise<{ success: boolean; error?: string }>;
  checkOwnership: (universeId: string) => Promise<{ owns: boolean; price?: number }>;

  // Earnings
  loadEarnings: () => Promise<void>;

  // Reset
  reset: () => void;
  setError: (error: string | null) => void;
}

type EconomyStore = EconomyState & EconomyActions;

const API_BASE = "/api/economy";

const initialState: EconomyState = {
  balance: 0,
  transactions: [],
  totalTransactions: 0,
  isLoadingBalance: false,
  isLoadingTransactions: false,
  sentTips: [],
  receivedTips: [],
  totalReceivedTips: 0,
  totalTipsAmount: 0,
  isLoadingTips: false,
  earnings: null,
  isLoadingEarnings: false,
  error: null,
};

export const useEconomyStore = create<EconomyStore>((set, get) => ({
  ...initialState,

  // ============================================
  // CREDITS
  // ============================================

  loadBalance: async () => {
    set({ isLoadingBalance: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/credits`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load balance");
      const data = await response.json();

      set({ balance: data.balance, isLoadingBalance: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load balance",
        isLoadingBalance: false,
      });
    }
  },

  loadTransactions: async (offset = 0) => {
    set({ isLoadingTransactions: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/credits/transactions?limit=20&offset=${offset}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to load transactions");
      const data = await response.json();

      set((state) => ({
        transactions:
          offset > 0 ? [...state.transactions, ...data.transactions] : data.transactions,
        totalTransactions: data.total,
        isLoadingTransactions: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load transactions",
        isLoadingTransactions: false,
      });
    }
  },

  addCredits: async (amount, description) => {
    try {
      const response = await fetch(`${API_BASE}/credits/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount, description }),
      });

      if (!response.ok) throw new Error("Failed to add credits");
      const data = await response.json();

      set({ balance: data.balance });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to add credits" });
      return false;
    }
  },

  // ============================================
  // TIPS
  // ============================================

  sendTip: async (receiverId, amount, universeId, message) => {
    try {
      const response = await fetch(`${API_BASE}/tips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId, amount, universeId, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send tip");
      }

      const data = await response.json();
      set({ balance: data.newBalance });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to send tip" });
      return false;
    }
  },

  loadSentTips: async (offset = 0) => {
    set({ isLoadingTips: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/tips/sent?limit=20&offset=${offset}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to load tips");
      const data = await response.json();

      set((state) => ({
        sentTips: offset > 0 ? [...state.sentTips, ...data.tips] : data.tips,
        isLoadingTips: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load tips",
        isLoadingTips: false,
      });
    }
  },

  loadReceivedTips: async (offset = 0) => {
    set({ isLoadingTips: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/tips/received?limit=20&offset=${offset}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to load tips");
      const data = await response.json();

      set((state) => ({
        receivedTips: offset > 0 ? [...state.receivedTips, ...data.tips] : data.tips,
        totalReceivedTips: data.total,
        totalTipsAmount: data.totalAmount,
        isLoadingTips: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load tips",
        isLoadingTips: false,
      });
    }
  },

  // ============================================
  // PURCHASES
  // ============================================

  purchaseContent: async (universeId) => {
    try {
      const response = await fetch(`${API_BASE}/purchase/${universeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      if (data.newBalance !== undefined) {
        set({ balance: data.newBalance });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to purchase";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  checkOwnership: async (universeId) => {
    try {
      const response = await fetch(`${API_BASE}/owns/${universeId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to check ownership");
      return await response.json();
    } catch {
      return { owns: false };
    }
  },

  // ============================================
  // EARNINGS
  // ============================================

  loadEarnings: async () => {
    set({ isLoadingEarnings: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/earnings`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load earnings");
      const data = await response.json();

      set({ earnings: data, isLoadingEarnings: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load earnings",
        isLoadingEarnings: false,
      });
    }
  },

  // Reset store
  reset: () => {
    set(initialState);
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

// Selectors
export const useBalance = () => useEconomyStore((state) => state.balance);
export const useTransactions = () => useEconomyStore((state) => state.transactions);
export const useEarnings = () => useEconomyStore((state) => state.earnings);
export const useEconomyError = () => useEconomyStore((state) => state.error);
