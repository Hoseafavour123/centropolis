"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useWalletData } from "@/hooks/useWalletData";

export function WalletSnapshot() {
    const { balance, isLoading, isError } = useWalletData();

    return (
        <Card className="glass-panel">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Wallet Snapshot
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-24 w-full bg-muted/50 rounded-lg flex items-end justify-between px-2 pb-2 gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                            key={i}
                            className="w-full bg-primary/50 rounded-t-sm"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Balance</span>
                    <span className="font-bold font-mono">{isLoading ? "Loading..." : isError ? "Error" : balance}</span>
                </div>
            </CardContent>
        </Card>
    );
}
