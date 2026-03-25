import { NextResponse } from "next/server";
import { dashboardService } from "@/features/dashboard/services/dashboardService";

export async function GET() {
    try {
        const activity = await dashboardService.getLiveActivity();
        return NextResponse.json(activity);
    } catch (error) {
        console.error("[/api/dashboard/activity] error:", error);
        return NextResponse.json([], { status: 200 });
    }
}
