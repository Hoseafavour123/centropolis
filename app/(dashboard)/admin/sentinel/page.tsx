"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Database,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
    Loader2
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

interface SentinelAnalysis {
    id: string;
    tokenAddress: string;
    score: number | null;
    status: string;
    createdAt: string;
    user: {
        email: string;
        name: string | null;
    } | null;
}

export default function AdminSentinelLogs() {
    const [logs, setLogs] = useState<SentinelAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Reusing a similar pattern as transactions but for sentinel
            // In a real app, I'd create a specific endpoint /api/admin/sentinel
            // For now, I'll assume I need to fetch all sentinel analyses
            const res = await fetch(`/api/admin/sentinel?page=${page}&search=${search}`);
            const data = await res.json();
            setLogs(data.logs);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            toast.error("Failed to fetch sentinel logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchLogs, 500);
        return () => clearTimeout(timer);
    }, [page, search]);

    const getScoreBadge = (score: number | null) => {
        if (score === null) return <Badge variant="secondary">N/A</Badge>;
        if (score >= 80) return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">{score} (Safe)</Badge>;
        if (score >= 50) return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">{score} (Warning)</Badge>;
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">{score} (Danger)</Badge>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sentinel AI Logs</h1>
                <p className="text-muted-foreground">
                    Historical AI analysis results and token security audits.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by token address..."
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
                            <TableHead>Token Address</TableHead>
                            <TableHead>Requested By</TableHead>
                            <TableHead>Safety Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[80px]">View</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No sentinel analyses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="font-mono text-xs max-w-[150px] truncate">
                                            {log.tokenAddress}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-xs">{log.user?.name || "System"}</span>
                                            <span className="text-[10px] text-muted-foreground">{log.user?.email || "Automated"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getScoreBadge(log.score)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === "COMPLETED" ? "default" : "secondary"}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={`/token/${log.tokenAddress}`} target="_blank" rel="noopener noreferrer">
                                                <Database className="h-4 w-4" />
                                            </a>
                                        </Button>
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
