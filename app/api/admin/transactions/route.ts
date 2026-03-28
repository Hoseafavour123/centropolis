import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

export async function GET(request: Request) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status") || undefined;
        const type = searchParams.get("type") || undefined;
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;

        const where = {
            ...(status ? { status } : {}),
            ...(type ? { type } : {}),
            ...(search ? {
                OR: [
                    { txHash: { contains: search, mode: "insensitive" as const } },
                    { fromToken: { contains: search, mode: "insensitive" as const } },
                    { toToken: { contains: search, mode: "insensitive" as const } },
                ]
            } : {}),
        };

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        }
                    }
                }
            }),
            prisma.transaction.count({ where }),
        ]);

        return NextResponse.json({
            transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("[ADMIN_TRANSACTIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
