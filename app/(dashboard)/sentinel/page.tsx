// /app/sentinel/page.tsx

import { SentinelPageClient } from './client/SentinelPageClient';

export const metadata = {
  title: 'Sentinel AI | Binocs',
  description: 'AI-powered blockchain analysis',
};

export default function SentinelPage() {
  return <SentinelPageClient />;
}