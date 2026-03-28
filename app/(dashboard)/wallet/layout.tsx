import { ReactNode } from 'react';

export const metadata = {
    title: 'Wallet Viewer | Centropolis',
    description: 'View wallet holdings, balances, and transaction history.',
};

export default function WalletLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#07050d] text-white">
            {children}
        </div>
    );
}
