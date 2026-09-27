// components/ModalRenderer.tsx
"use client";

import { Dialog } from "@/components/base/dialog";
import { useModalStore } from "@/lib";

export function ModalRenderer() {
  const modals = useModalStore((state) => state.modals);
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <>
      {modals.map((modal) => (
        <Dialog
          key={modal.id}
          open
          onClose={() => closeModal(modal.id)}
        >
          {modal.content}
        </Dialog>
      ))}
    </>
  );
}