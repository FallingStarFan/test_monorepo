"use client";

import { ReactNode, useEffect } from "react";
import "./Dialog.css";

type DialogProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

export function Dialog({
  open,
  title,
  children,
  onClose,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dialog-header">
          {title && (
            <h2 className="dialog-title">
              {title}
            </h2>
          )}

          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="dialog-content">
          {children}
        </div>
      </div>
    </div>
  );
}