import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

export async function GET() {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [
            userCount,
            transactionCount,
            successTransactions,
            failedTransactions,
            totalVolume,
            sentinelCount
        ] = await Promise.all([
            prisma.user.count(),
            prisma.transaction.count(),
            prisma.transaction.count({ where: { status: "SUCCESS" } }),
            prisma.transaction.count({ where: { status: "FAILED" } }),
            prisma.transaction.aggregate({
                _sum: { usdValue: true }
            }),
            prisma.sentinelAnalysis.count()
        ]);

        return NextResponse.json({
            users: userCount,
            transactions: {
                total: transactionCount,
                success: successTransactions,
                failed: failedTransactions,
                successRate: transactionCount > 0 ? (successTransactions / transactionCount) * 100 : 0
            },
            volume: totalVolume._sum.usdValue || 0,
            sentinelAnalyses: sentinelCount,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error("[ADMIN_STATS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
