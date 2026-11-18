import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PipelineWorkflowSection } from '../PipelineWorkflowSection';

describe('PipelineWorkflowSection (Vector Assembly Architecture)', () => {
  it('renders Title 1 and Title 2 narrative sequence before vector assembly', () => {
    render(
      <MemoryRouter>
        <PipelineWorkflowSection />
      </MemoryRouter>
    );

    // Title 1 & Title 2 text headings are present for initial narrative stages
    expect(screen.getByRole('heading', { name: /Right inside your browser/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /For every complex document/i })).toBeInTheDocument();

    // Bottom status ticker strip (Image 4) remains permanently removed
    expect(screen.queryByText(/SUBSTRATE STATUS: CONVERGED AT \(0, 0\)/i)).not.toBeInTheDocument();
  });

  it('renders the vector substrate card inside section 1', () => {
    render(
      <MemoryRouter>
        <PipelineWorkflowSection />
      </MemoryRouter>
    );

    expect(screen.getByTestId('vector-substrate-card')).toBeInTheDocument();
    expect(screen.getByTestId('perimeter-top')).toBeInTheDocument();
    expect(screen.getByTestId('perimeter-bottom')).toBeInTheDocument();
    expect(screen.getByTestId('perimeter-left')).toBeInTheDocument();
    expect(screen.getByTestId('perimeter-right')).toBeInTheDocument();
  });

  it('renders 4 pipeline stages with initial hidden state and no text badges on orange hairline', () => {
    const { container } = render(
      <MemoryRouter>
        <PipelineWorkflowSection />
      </MemoryRouter>
    );

    // Verify 4 action bars are rendered
    expect(screen.getByText(/\[01\] INGEST/i)).toBeInTheDocument();
    expect(screen.getByText(/\[02\] RADON DESKEW/i)).toBeInTheDocument();
    expect(screen.getByText(/\[03\] THRESHOLD & WASM/i)).toBeInTheDocument();
    expect(screen.getByText(/\[04\] STRUCTURE/i)).toBeInTheDocument();

    // Verify no text badges exist on the orange hairline (pure line)
    expect(screen.queryByText(/STAGE 01 • SUBSTRATE INGESTION/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/STAGE 02 • RADON DESKEW/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/STAGE 03 • THRESHOLD/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/STAGE 04 • STRUCTURE/i)).not.toBeInTheDocument();

    // Verify initial hidden state: line wrappers and bar wrappers have opacity-0
    const hiddenElements = container.querySelectorAll('.opacity-0');
    expect(hiddenElements.length).toBeGreaterThanOrEqual(8); // 4 line wrappers + 4 bar wrappers
  });
});
