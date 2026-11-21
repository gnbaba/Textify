import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { VectorSubstrateCard } from '../VectorSubstrateCard';

describe('VectorSubstrateCard (Progressive Vector Assembly)', () => {
  it('converges perimeter lines and displays corner crosshairs in Stage 1 (progress 0 -> 0.25)', () => {
    const { rerender } = render(
      <VectorSubstrateCard
        progress={0}
        activeMode="document"
        setActiveMode={vi.fn()}
        demoLoaded={false}
        setDemoLoaded={vi.fn()}
        activeFieldPin={null}
        setActiveFieldPin={vi.fn()}
        isExpanded={false}
      />
    );

    const topLine = screen.getByTestId('perimeter-top');
    expect(topLine).toHaveStyle({ transform: 'translateY(-100dvh)' });

    // Progress to end of Stage 1 (0.25)
    rerender(
      <VectorSubstrateCard
        progress={0.25}
        activeMode="document"
        setActiveMode={vi.fn()}
        demoLoaded={false}
        setDemoLoaded={vi.fn()}
        activeFieldPin={null}
        setActiveFieldPin={vi.fn()}
        isExpanded={false}
      />
    );

    expect(topLine).toHaveStyle({ transform: 'translateY(0dvh)' });
    expect(screen.getByTestId('corner-crosshair-tl')).toHaveStyle({ opacity: '1' });
  });

  it('draws interior wireframe lines in Stage 2 (progress 0.25 -> 0.50) before content appears', () => {
    render(
      <VectorSubstrateCard
        progress={0.35}
        activeMode="document"
        setActiveMode={vi.fn()}
        demoLoaded={false}
        setDemoLoaded={vi.fn()}
        activeFieldPin={null}
        setActiveFieldPin={vi.fn()}
        isExpanded={false}
      />
    );

    const headerDivider = screen.getByTestId('wireframe-header-divider');
    expect(headerDivider).toBeInTheDocument();
    // In Stage 2, wireframe opacity is active
    expect(headerDivider).toHaveStyle({ opacity: '0.4' }); // (0.35 - 0.25) / 0.25 = 0.4
  });

  it('reveals typography, mode tabs, and upload instructions in Stage 3 (progress 0.50 -> 0.75)', () => {
    const setActiveMode = vi.fn();
    render(
      <VectorSubstrateCard
        progress={0.75}
        activeMode="document"
        setActiveMode={setActiveMode}
        demoLoaded={false}
        setDemoLoaded={vi.fn()}
        activeFieldPin={null}
        setActiveFieldPin={vi.fn()}
        isExpanded={false}
      />
    );

    expect(screen.getByText(/EXTRACT TEXT PROTOCOL/i)).toBeInTheDocument();
    expect(screen.getByText(/CLICK TO UPLOAD/i)).toBeInTheDocument();
    expect(screen.getByText(/GUEST LIMIT: 9 \/ 10 CYCLES/i)).toBeInTheDocument();

    const graphicTab = screen.getByRole('button', { name: /\[ GRAPHIC MODE \]/i });
    fireEvent.click(graphicTab);
    expect(setActiveMode).toHaveBeenCalledWith('graphic');
  });

  it('does not render distracting diagnostic pins 01, 02, 03 and supports demo loading in Stage 4', () => {
    const setDemoLoaded = vi.fn();
    const { rerender } = render(
      <VectorSubstrateCard
        progress={1.0}
        activeMode="document"
        setActiveMode={vi.fn()}
        demoLoaded={false}
        setDemoLoaded={setDemoLoaded}
        isExpanded={true}
      />
    );

    // Pins 01, 02, 03 are completely removed per user request
    expect(screen.queryByTestId('pin-01-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pin-02-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pin-03-container')).not.toBeInTheDocument();

    // Click dropzone to toggle demo loaded state
    const dropzone = screen.getByTestId('wireframe-dropzone-box');
    fireEvent.click(dropzone);
    expect(setDemoLoaded).toHaveBeenCalledWith(true);

    // Rerender with demo loaded
    rerender(
      <VectorSubstrateCard
        progress={1.0}
        activeMode="document"
        setActiveMode={vi.fn()}
        demoLoaded={true}
        setDemoLoaded={setDemoLoaded}
        isExpanded={true}
      />
    );

    expect(screen.getByText(/ARKHITECTURA_INVOICE_OCT2023\.PNG/i)).toBeInTheDocument();
    expect(screen.getByText(/COPY JSON/i)).toBeInTheDocument();
  });
});
