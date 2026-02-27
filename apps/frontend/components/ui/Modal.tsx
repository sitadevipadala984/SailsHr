import { forwardRef, type ReactNode, useEffect } from "react";
import { Button } from "./Button";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  className?: string;
};

const overlayBase =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity";
const panelBase =
  "relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-border bg-surface shadow-lg";

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      showCloseButton = true,
      className = ""
    },
    ref
  ) => {
    useEffect(() => {
      if (!isOpen) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={overlayBase}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div
          className={`${panelBase} ${className}`.trim()}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              <div className={title ? "" : "ml-auto"}>
                {showCloseButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";
