import type { Meta, StoryObj } from '@storybook/react';
import { SentinelPanel } from '@/components/Sentinel/SentinelPanel';
import { mockSentinelResult } from '@/mocks/sentinel.mock';

const meta: Meta<typeof SentinelPanel> = {
  component: SentinelPanel,
};

export default meta;
type Story = StoryObj<typeof SentinelPanel>;

export const Streaming: Story = {
  args: {
    status: 'streaming',
    streamingText: 'Scanning contract...\nChecking liquidity...',
  },
};

export const Complete: Story = {
  args: {
    status: 'ready',
    analysis: mockSentinelResult,
  },
};

export const LowScore: Story = {
  args: {
    status: 'ready',
    analysis: {
      ...mockSentinelResult,
      finalScore: 35,
      safetyBand: 'danger',
    },
  },
};