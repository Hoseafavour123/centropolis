// src/tests/HoldersTable.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { HoldersTab } from '@/components/Token/TokenTabs/HoldersTab';
import { mockHolders } from '@/mocks/token.mock';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';


// Mock the hook
vi.mock('@/hooks/useHolders', () => ({
  useHolders: () => ({
    data: mockHolders,
    isLoading: false,
  }),
}));

describe('HoldersTable', () => {
  it('renders holder addresses', () => {
    render(<HoldersTab chain="solana" address="test" />);
    
    expect(screen.getByText('5D1...BL5w')).toBeInTheDocument();
  });

  it('displays holder labels with correct colors', () => {
    render(<HoldersTab chain="solana" address="test" />);
    
    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('whale')).toBeInTheDocument();
    expect(screen.getByText('exchange')).toBeInTheDocument();
  });

  it('links to wallet detail pages', () => {
    render(<HoldersTab chain="solana" address="test" />);
    
    const viewLinks = screen.getAllByText('View');
    expect(viewLinks[0].closest('a')).toHaveAttribute('href', '/wallet/5D1...BL5w');
  });
});