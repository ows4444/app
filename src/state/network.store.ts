import { create } from "zustand";

type NetworkState = {
  isOnline: boolean;
  isSlow: boolean;
  isFetching: number;
  isMutating: number;

  setOnline: (v: boolean) => void;
  setSlow: (v: boolean) => void;
  setFetching: (v: number) => void;
  setMutating: (v: number) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  isSlow: false,
  isFetching: 0,
  isMutating: 0,

  setOnline: (v) => {
    set({ isOnline: v });
  },
  setSlow: (v) => {
    set({ isSlow: v });
  },
  setFetching: (v) => {
    set({ isFetching: v });
  },
  setMutating: (v) => {
    set({ isMutating: v });
  },
}));
