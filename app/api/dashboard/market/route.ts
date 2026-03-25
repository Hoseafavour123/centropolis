import { NextResponse } from "next/server";
import { dashboardService } from "@/features/dashboard/services/dashboardService";

export async function GET() {
    try {
        const market = await dashboardService.getMarketOverview();
        return NextResponse.json(market);
    } catch (error) {
        console.error("[/api/dashboard/market] error:", error);
        return NextResponse.json([], { status: 200 });
    }
}
