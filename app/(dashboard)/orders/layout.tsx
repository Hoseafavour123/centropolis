import { ReactNode } from 'react';

export const metadata = {
    title: 'Orders & History | Centropolis',
    description: 'View your executed trades, pending transactions, and transaction receipts.',
};

export default function OrdersLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#07050d] text-white">
            {children}
        </div>
    );
}
