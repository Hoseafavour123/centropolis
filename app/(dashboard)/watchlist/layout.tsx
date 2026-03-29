import { ReactNode } from 'react';

export const metadata = {
    title: 'Watchlists & Alerts | Binocs',
    description: 'Track your favorite assets and manage intelligent price and security alerts.',
};

export default function WatchlistLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#07050d] text-white">
            {children}
        </div>
    );
}
