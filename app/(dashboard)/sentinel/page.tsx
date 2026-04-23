// /app/sentinel/page.tsx

import { Suspense } from 'react';
import { SentinelPageClient } from './client/SentinelPageClient';

export const metadata = {
  title: 'Sentinel AI | Binocs',
  description: 'AI-powered blockchain analysis',
};

export default function SentinelPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SentinelPageClient />
    </Suspense>
  );
}