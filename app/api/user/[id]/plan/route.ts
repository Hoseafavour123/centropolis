import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserUsage } from '@/lib/billing/limits';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId: clerkId } = await auth();

        // Ensure the authenticated user matches the requested id
        if (!clerkId || clerkId !== id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const data = await getUserUsage(clerkId);

        return NextResponse.json({
            plan: data.plan,
            planExpiresAt: data.planExpiresAt,
            usage: {
                apiCalls: data.usage.analysesCount, // mapping analysis count for general dashboard stat
                apiLimit: data.limits.maxAnalysesPerMonth,
                analysesCount: data.usage.analysesCount,
                watchlistCount: data.usage.watchlistCount,
                apiKeysCount: data.usage.apiKeysCount,
                chatsCount: data.usage.chatsCount,
            },
            limits: data.limits
        });

    } catch (error: any) {
        console.error('[USER_PLAN_GET]', error);
        if (error.message === 'User not found') {
             return new NextResponse('User not found', { status: 404 });
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}
