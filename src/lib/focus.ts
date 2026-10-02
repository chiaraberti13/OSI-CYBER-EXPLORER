/**
 * Keyboard focus helpers shared by modal UI (see components/ModalDialog.tsx).
 * Kept framework-free so the rules about what is "focusable" are tested once.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/** Focusable descendants in DOM order, skipping elements hidden with display/visibility. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(element => {
    if (element.hasAttribute('inert') || element.closest('[inert]')) return false;
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return style?.display !== 'none' && style?.visibility !== 'hidden';
  });
}
