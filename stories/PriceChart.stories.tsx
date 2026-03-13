import type { Meta, StoryObj } from '@storybook/react';
import { PriceChart } from '@/components/Token/PriceChart';
import { generateCandles } from '@/mocks/token.mock';

const meta: Meta<typeof PriceChart> = {
  component: PriceChart,
  title: 'Token/PriceChart',
};

export default meta;
type Story = StoryObj<typeof PriceChart>;

const mockData = generateCandles(136.82, 100);

export const Default: Story = {
  args: {
    chain: 'solana',
    address: 'So11111111111111111111111111111111111111112',
    initialData: mockData,
    range: '1d',
  },
};

export const Weekly: Story = {
  args: {
    chain: 'solana',
    address: 'So11111111111111111111111111111111111111112',
    initialData: generateCandles(136.82, 168),
    range: '7d',
  },
};