import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { HeroDraftingCanvas } from '../HeroDraftingCanvas';

describe('HeroDraftingCanvas (Independent Papers Architecture)', () => {
  it('renders all independent physical documents on the drafting desk', () => {
    render(<HeroDraftingCanvas />);

    // Central Invoice
    expect(screen.getByText(/CLIENT: ARKHITECTURA LTD/i)).toBeInTheDocument();
    expect(screen.getByText(/INV-2023-0814/i)).toBeInTheDocument();

    // Handwritten Notebook
    expect(screen.getByText(/Quick Household/i)).toBeInTheDocument();
    expect(screen.getByText(/Donation inquiry/i)).toBeInTheDocument();

    // Thermal Receipt
    expect(screen.getByText(/RENEWAL FOOD MARKET/i)).toBeInTheDocument();

    // Book Page
    expect(screen.getByText(/POETRY BOOK PAGE/i)).toBeInTheDocument();

    // Shipping Label
    expect(screen.getByText(/PRIORITY WAYBILL/i)).toBeInTheDocument();

    // ID Badge
    expect(screen.getByText(/SECURITY ACCESS/i)).toBeInTheDocument();
  });

  it('contains zero mode buttons for scan or move (total mouse freedom)', () => {
    render(<HeroDraftingCanvas />);

    // No scan or move mode buttons in the HUD
    expect(screen.queryByRole('button', { name: /^scan$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^move$/i })).not.toBeInTheDocument();

    // HUD guides the user with dynamic hint
    expect(screen.getByText(/DRAG ANY PAPER TO REPOSITION/i)).toBeInTheDocument();
  });

  it('renders subtle scan markers and opens extraction cards on click including poetry excerpt', () => {
    render(<HeroDraftingCanvas />);

    // Check subtle markers are rendered
    const totalBtn = screen.getByTitle('Scan TOTAL AMOUNT');
    expect(totalBtn).toBeInTheDocument();

    // Click total marker
    fireEvent.click(totalBtn);
    expect(screen.getByText(/\[TX-FIELD #01\] TOTAL AMOUNT/i)).toBeInTheDocument();
    expect(screen.getByText(/CONFIDENCE: 99.8% • LOCAL WASM/i)).toBeInTheDocument();

    // Close card
    const closeBtn = screen.getByTitle('Close tag');
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/\[TX-FIELD #01\] TOTAL AMOUNT/i)).not.toBeInTheDocument();

    // Click handwritten notebook marker
    const notebookBtn = screen.getByTitle('Scan HANDWRITTEN NOTE');
    fireEvent.click(notebookBtn);
    expect(screen.getByText(/Quick Household: 1. Donation inquiry/i)).toBeInTheDocument();

    // Click poetry book excerpt marker
    const poetryBtn = screen.getByTitle('Scan POETRY EXCERPT');
    expect(poetryBtn).toBeInTheDocument();
    fireEvent.click(poetryBtn);
    expect(screen.getByText(/\[TX-FIELD #05\] POETRY EXCERPT/i)).toBeInTheDocument();
    expect(screen.getByText(/DENSE PROSE WASM/i)).toBeInTheDocument();
  });

  it('automatically closes all open cards on scroll', () => {
    render(<HeroDraftingCanvas />);

    const totalBtn = screen.getByTitle('Scan TOTAL AMOUNT');
    fireEvent.click(totalBtn);
    expect(screen.getByText(/\[TX-FIELD #01\] TOTAL AMOUNT/i)).toBeInTheDocument();

    // Trigger window scroll past threshold
    window.scrollY = 150;
    fireEvent.scroll(window);

    expect(screen.queryByText(/\[TX-FIELD #01\] TOTAL AMOUNT/i)).not.toBeInTheDocument();
  });
});
