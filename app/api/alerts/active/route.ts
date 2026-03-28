import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const alerts = await prisma.alert.findMany({
            where: {
                userId: user.id,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                watchlist: true
            }
        });

        return NextResponse.json({ alerts });
    } catch (error) {
        console.error('Active alerts fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch active alerts' }, { status: 500 });
    }
}
