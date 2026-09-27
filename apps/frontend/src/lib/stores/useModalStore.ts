// stores/useModalStore.ts
import { create } from "zustand";
import { ReactNode } from "react";

type ModalItem = {
  id: string;
  content: ReactNode;
};

type ModalStore = {
  modals: ModalItem[];
  openModal: (content: ReactNode, id?: string) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
};

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: [],

  openModal: (content, id) => {
    const modalId = id ?? crypto.randomUUID();
     console.log("openModal called", modalId);
    set((state) => {
      const exists = state.modals.some((m) => m.id === modalId);
      if (exists) {
        return {
          modals: state.modals.map((m) =>
            m.id === modalId ? { ...m, content } : m,
          ),
        };
      }
      return { modals: [...state.modals, { id: modalId, content }] };
    });
    return modalId;
  },

  closeModal: (id) =>
    set((state) => ({ modals: state.modals.filter((m) => m.id !== id) })),

  closeAll: () => set({ modals: [] }),
}));