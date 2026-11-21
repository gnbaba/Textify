// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExportModal } from '../../src/features/ocr/components/ExportModal';

const blocks = [{ id: 'block-1', text: 'Audit text', timestamp: 1, order: 1000 }];

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ExportModal accessibility regressions', () => {
  it('exposes dialog semantics, traps Tab, closes on Escape, and restores focus', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open export';
    document.body.appendChild(trigger);
    trigger.focus();

    const onClose = vi.fn();
    const { unmount } = render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        blocks={blocks}
        selectedIds={['block-1']}
        documentTitle="Audit Document"
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBe('export-modal-title');
    const heading = labelId ? document.getElementById(labelId) : null;
    expect(heading).toHaveTextContent('[ EXPORT DOCUMENT ]');
    expect(dialog.contains(document.activeElement)).toBe(true);

    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled])'));
    expect(focusable.length).toBeGreaterThan(1);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.activeElement).toBe(trigger);
  });
});
