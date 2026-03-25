import { NextResponse } from "next/server";
import { dashboardService } from "@/features/dashboard/services/dashboardService";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") ?? "8", 10);
        const tokens = await dashboardService.getTrendingTokens(limit);
        return NextResponse.json(tokens);
    } catch (error) {
        console.error("[/api/dashboard/trending] error:", error);
        return NextResponse.json([], { status: 200 }); // graceful fallback
    }
}
