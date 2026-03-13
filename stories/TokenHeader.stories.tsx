import type { Meta, StoryObj } from '@storybook/react';
import { TokenHeader } from '@/components/Token/TokenHeader';
import { mockTokenMeta } from '@/mocks/token.mock';

const meta: Meta<typeof TokenHeader> = {
  component: TokenHeader,
  title: 'Token/TokenHeader',
};

export default meta;
type Story = StoryObj<typeof TokenHeader>;

export const Safe: Story = {
  args: {
    meta: mockTokenMeta,
    safetyScore: 85,
    onAddToWatchlist: () => {},
  },
};

export const Caution: Story = {
  args: {
    meta: { ...mockTokenMeta, symbol: 'RISKY', name: 'Risky Token', verified: false },
    safetyScore: 55,
    onAddToWatchlist: () => {},
  },
};

export const Danger: Story = {
  args: {
    meta: { ...mockTokenMeta, symbol: 'SCAM', name: 'Scam Token', verified: false },
    safetyScore: 25,
    onAddToWatchlist: () => {},
  },
};

export const Watchlisted: Story = {
  args: {
    meta: mockTokenMeta,
    safetyScore: 72,
    onAddToWatchlist: () => {},
    isWatchlisted: true,
  },
};