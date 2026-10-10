// @vitest-environment jsdom
import { useRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalDialog from './ModalDialog';
import GuideModal from './GuideModal';
import GlossaryModal from './GlossaryModal';
import { GLOSSARY_TERMS } from '../content/glossaryTerms';
import Header from './Header';
import { useStore } from '../store';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
  useStore.setState({ language: 'it', isGuideOpen: false });
});

function Harness({ onClose, withInitialFocus = false }: { onClose?: () => void; withInitialFocus?: boolean }) {
  const [open, setOpen] = useState(false);
  const secondRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    onClose?.();
    setOpen(false);
  };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Apri</button>
      <ModalDialog
        isOpen={open}
        onClose={close}
        labelledBy="t"
        describedBy="d"
        initialFocusRef={withInitialFocus ? secondRef : undefined}
        overlayClassName=""
        backdropClassName=""
        panelClassName=""
      >
        <h2 id="t">Titolo</h2>
        <p id="d">Descrizione</p>
        <button type="button">Primo</button>
        <button type="button" ref={secondRef}>Secondo</button>
        <button type="button" disabled>Disabilitato</button>
        <button type="button" onClick={close}>Ultimo</button>
      </ModalDialog>
    </>
  );
}

describe('ModalDialog', () => {
  it('exposes a named, described modal dialog and focuses its first control', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Apri' }));

    const dialog = screen.getByRole('dialog', { name: 'Titolo' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-describedby')).toBe('d');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Primo' }));
  });

  it('honours an explicit initial focus target', async () => {
    const user = userEvent.setup();
    render(<Harness withInitialFocus />);
    await user.click(screen.getByRole('button', { name: 'Apri' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Secondo' }));
  });

  it('keeps Tab and Shift+Tab inside the dialog, skipping disabled controls', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Apri' }));

    const first = screen.getByRole('button', { name: 'Primo' });
    const last = screen.getByRole('button', { name: 'Ultimo' });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Secondo' }));
    await user.tab();
    expect(document.activeElement).toBe(last);
    await user.tab();
    expect(document.activeElement).toBe(first);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape, unlocks the page and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<Harness onClose={onClose} />);
    const trigger = screen.getByRole('button', { name: 'Apri' });
    await user.click(trigger);

    expect(document.body.style.overflow).toBe('hidden');
    expect(container.hasAttribute('inert')).toBe(true);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.body.style.overflow).toBe('');
    expect(container.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('hides the backdrop from assistive technology while still closing on click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Apri' }));

    const backdrop = screen.getByTestId('modal-backdrop');
    expect(backdrop.getAttribute('aria-hidden')).toBe('true');
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Guide dialog', () => {
  it('opens from the header, is fully labelled and gives focus back on close', async () => {
    const user = userEvent.setup();
    useStore.setState({ language: 'it', isGuideOpen: false });
    function App() {
      const { isGuideOpen, setIsGuideOpen, language } = useStore();
      return (
        <>
          <Header />
          <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} language={language} />
        </>
      );
    }
    render(<App />);

    const trigger = screen.getByRole('button', { name: 'Apri la guida' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Manuale & Repository di Rete' });
    expect(document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent).toBe('Come usare il Laboratorio');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Chiudi la guida' }));

    await user.click(screen.getByRole('button', { name: 'Ho capito!' }));
    expect(useStore.getState().isGuideOpen).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Glossary', () => {
  it('as a modal focuses the search field and has a labelled close button', async () => {
    useStore.setState({ language: 'en' });
    const onClose = vi.fn();
    render(<GlossaryModal isOpen onClose={onClose} />);

    const dialog = screen.getByRole('dialog', { name: 'Network Glossary' });
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByPlaceholderText('Search terms or definitions...'));

    await userEvent.setup().click(screen.getByRole('button', { name: 'Close the glossary' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('inline is a named region, not a dialog', () => {
    useStore.setState({ language: 'it' });
    render(<GlossaryModal inline />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('region', { name: 'Glossario di Rete' })).toBeTruthy();
    expect(screen.getAllByRole('term')).toHaveLength(GLOSSARY_TERMS.length);
    expect(screen.getAllByRole('definition')).toHaveLength(GLOSSARY_TERMS.length);
  });
});
