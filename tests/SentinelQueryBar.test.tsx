import { render, screen, fireEvent } from '@testing-library/react';
import { SentinelQueryBar } from '@/components/Sentinel/SentinelQueryBar';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('SentinelQueryBar', () => {
  const mockAnalyze = vi.fn();

  it('renders all form fields', () => {
    render(<SentinelQueryBar onAnalyze={mockAnalyze} />);
    
    expect(screen.getByLabelText(/entity type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/chain/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contract/i)).toBeInTheDocument();
  });

  it('submits correct payload', () => {
    render(<SentinelQueryBar onAnalyze={mockAnalyze} />);
    
    const addressInput = screen.getByPlaceholderText(/enter contract/i);
    fireEvent.change(addressInput, { target: { value: '0x123' } });
    
    const submitBtn = screen.getByRole('button', { name: /start analysis/i });
    fireEvent.click(submitBtn);
    
    expect(mockAnalyze).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '0x123',
        entityType: 'token',
        chain: 'solana',
      })
    );
  });
});