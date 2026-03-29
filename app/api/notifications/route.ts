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

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            await prisma.notification.delete({
                where: { id, userId: user.id },
            });
        } else {
            // Delete all if no ID provided
            await prisma.notification.deleteMany({
                where: { userId: user.id },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete notifications error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
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

        const { id } = await req.json();

        if (id) {
            await prisma.notification.update({
                where: { id, userId: user.id },
                data: { read: true },
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: user.id, read: false },
                data: { read: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
