"use client";

import { useEffect, useState } from "react";
import {
    Search,
    ExternalLink,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Transaction {
    id: string;
    type: string;
    status: string;
    txHash: string | null;
    fromToken: string | null;
    toToken: string | null;
    fromAmount: number | null;
    toAmount: number | null;
    usdValue: number | null;
    createdAt: string;
    user: {
        email: string;
        name: string | null;
    };
}

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/transactions?page=${page}&search=${search}`);
            const data = await res.json();
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchTransactions, 500);
        return () => clearTimeout(timer);
    }, [page, search]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "FAILED": return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transaction Logs</h1>
                <p className="text-muted-foreground">
                    Monitor all platform-wide swaps and transfers.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by hash or token..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-border bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Amount (USD)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="w-[80px]">Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-xs">{tx.user.name || "Anonymous"}</span>
                                            <span className="text-[10px] text-muted-foreground">{tx.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{tx.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-xs">
                                            <span className="font-mono">{tx.fromToken?.slice(0, 4)}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="font-mono">{tx.toToken?.slice(0, 4)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            ${tx.usdValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(tx.status)}
                                            <span className="text-xs font-medium">{tx.status}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {tx.txHash && (
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={`https://solscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <div className="text-sm font-medium">
                    Page {page} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
