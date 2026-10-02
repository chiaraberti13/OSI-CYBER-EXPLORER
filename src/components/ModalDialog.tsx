import { useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { getFocusableElements } from '../lib/focus';

/**
 * Accessible modal shell shared by the Guide and the Glossary (WAI-ARIA APG "Dialog (Modal)").
 *
 * While open it: exposes role="dialog" + aria-modal with a name and description, moves focus
 * inside, keeps Tab/Shift+Tab inside, closes on Escape, makes the rest of the page `inert`,
 * locks body scroll and, on close, gives focus back to the element that opened it.
 * The backdrop is decorative for assistive technology: closing is always available through
 * Escape and a labelled button inside the dialog.
 */

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the visible element that names the dialog (usually its heading). */
  labelledBy: string;
  /** id of the visible element that summarises the dialog. */
  describedBy?: string;
  /** Element focused on open; defaults to the first focusable element, then the panel. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  overlayClassName: string;
  backdropClassName: string;
  panelClassName: string;
  children: ReactNode;
}

export default function ModalDialog({
  isOpen,
  onClose,
  labelledBy,
  describedBy,
  initialFocusRef,
  overlayClassName,
  backdropClassName,
  panelClassName,
  children
}: ModalDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const doc = document;
    const trigger = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;

    // Everything outside the dialog becomes unreachable for keyboard, pointer and screen readers.
    const overlay = overlayRef.current;
    const madeInert: Element[] = [];
    for (const sibling of Array.from(doc.body.children)) {
      if (sibling === overlay || sibling.contains(overlay) || sibling.hasAttribute('inert')) continue;
      sibling.setAttribute('inert', '');
      madeInert.push(sibling);
    }

    const previousOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    if (panel) {
      const target = initialFocusRef?.current ?? getFocusableElements(panel)[0] ?? panel;
      target.focus();
    }

    return () => {
      for (const element of madeInert) element.removeAttribute('inert');
      doc.body.style.overflow = previousOverflow;
      // Restore only after `inert` is gone, otherwise the trigger cannot receive focus.
      if (trigger?.isConnected) trigger.focus();
    };
  }, [isOpen, initialFocusRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;
    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div ref={overlayRef} className={overlayClassName}>
          <motion.div
            aria-hidden="true"
            data-testid="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={backdropClassName}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={panelClassName}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
