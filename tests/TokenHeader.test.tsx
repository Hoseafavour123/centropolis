
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenHeader } from '@/components/Token/TokenHeader';
import { mockTokenMeta } from '@/mocks/token.mock';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('TokenHeader', () => {
  const mockAddToWatchlist = vi.fn();

  it('renders token name and symbol', () => {
    render(
      <TokenHeader 
        meta={mockTokenMeta} 
        safetyScore={72}
        onAddToWatchlist={mockAddToWatchlist}
      />
    );
    
    expect(screen.getByText('Solana')).toBeInTheDocument();
    expect(screen.getByText('SOL')).toBeInTheDocument();
  });

  it('displays verified badge for verified tokens', () => {
    render(
      <TokenHeader 
        meta={mockTokenMeta}
        safetyScore={72}
        onAddToWatchlist={mockAddToWatchlist}
      />
    );
    
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('calls onAddToWatchlist when button clicked', () => {
    render(
      <TokenHeader 
        meta={mockTokenMeta}
        safetyScore={72}
        onAddToWatchlist={mockAddToWatchlist}
      />
    );
    
    fireEvent.click(screen.getByText('Add to Watchlist'));
    expect(mockAddToWatchlist).toHaveBeenCalled();
  });

  it('links to Sentinel analysis page', () => {
    render(
      <TokenHeader 
        meta={mockTokenMeta}
        safetyScore={72}
        onAddToWatchlist={mockAddToWatchlist}
      />
    );
    
    const analyzeLink = screen.getByText('Analyze');
    expect(analyzeLink.closest('a')).toHaveAttribute('href', '/sentinel?token=So11111111111111111111111111111111111111112&chain=solana');
  });
});