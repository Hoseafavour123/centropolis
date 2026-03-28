import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = auth();

        // Ensure the authenticated user matches the requested id
        if (!clerkId || clerkId !== params.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: params.id },
            select: {
                plan: true,
            }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Mock usage metrics tailored to plan
        const isPro = user.plan === 'PRO' || user.plan === 'WHALE';
        return NextResponse.json({
            plan: user.plan,
            usage: {
                apiCalls: 1250,
                apiLimit: isPro ? 10000 : 5000,
                storageUsed: '1.2 GB',
                storageLimit: isPro ? '10 GB' : '5 GB',
            }
        });

    } catch (error) {
        console.error('[USER_PLAN_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
