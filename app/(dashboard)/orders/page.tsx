"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import OrderList from '@/components/orders/OrderList';
import OrderDetail from '@/components/orders/OrderDetail';
import { exportToCsv } from '@/lib/utils/csvExport';
import { Download } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function OrdersPage() {
    const { user } = useCurrentUser();
    const [selectedChain, setSelectedChain] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const { data: trades, isLoading } = useQuery({
        queryKey: ['user-trades', selectedChain, selectedStatus, user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const res = await axios.get(`/api/user/${user.id}/trades`, {
                params: { chain: selectedChain, status: selectedStatus }
            });
            return res.data.trades || [];
        },
        enabled: !!user?.id
    });

    const handleDownloadCsv = () => {
        if (!trades?.length) return;

        // telemetry
        fetch('/api/telemetry', {
            method: 'POST',
            body: JSON.stringify({ event: 'receipt_downloaded', payload: { type: 'bulk_csv', count: trades.length } })
        }).catch(console.error);

        const exportData = trades.map((t: any) => ({
            Hash: t.txHash || t.id,
            Date: new Date(t.createdAt).toLocaleString(),
            Type: t.type,
            Chain: t.chain,
            Status: t.status,
            From: t.fromToken || '',
            To: t.toToken || '',
            Amount: t.fromAmount || '',
            Return: t.toAmount || '',
            ValueUSD: t.usdValue || ''
        }));
        exportToCsv('centropolis-trades.csv', exportData);
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col pt-24">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        Orders & History
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">View executed trades, pending transactions, and receipts.</p>
                </div>
                <button
                    onClick={handleDownloadCsv}
                    disabled={!trades?.length}
                    className="flex items-center gap-2 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                <div className="lg:col-span-8">
                    <OrderList
                        trades={trades}
                        isLoading={isLoading}
                        selectedChain={selectedChain}
                        setSelectedChain={setSelectedChain}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        onSelectOrder={setSelectedOrder}
                        selectedOrderId={selectedOrder?.id}
                    />
                </div>
                <div className="lg:col-span-4 lg:sticky lg:top-24">
                    <OrderDetail
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                    />
                </div>
            </div>
        </main>
    );
}
