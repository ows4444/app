import { create } from "zustand";

type UIState = {
  isSidebarOpen: boolean;
  isGlobalLoading: boolean;
  toggleSidebar: () => void;
  setLoading: (value: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isGlobalLoading: false,
  toggleSidebar: () => {
    set((s) => ({ isSidebarOpen: !s.isSidebarOpen }));
  },
  setLoading: (value) => {
    set({ isGlobalLoading: value });
  },
}));
