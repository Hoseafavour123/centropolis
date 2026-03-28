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
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;

        const where = {
            ...(search ? { tokenAddress: { contains: search, mode: "insensitive" as const } } : {}),
        };

        const [logs, total] = await Promise.all([
            prisma.sentinelAnalysis.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                        }
                    }
                }
            }),
            prisma.sentinelAnalysis.count({ where }),
        ]);

        return NextResponse.json({
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("[ADMIN_SENTINEL_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
