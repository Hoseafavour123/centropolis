import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string, keyId: string } }
) {
    try {
        const { userId: clerkId } = auth();

        if (!clerkId || clerkId !== params.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Ensure the key belongs to the current user before deleting
        const apiKey = await prisma.apiKey.findUnique({
            where: { id: params.keyId }
        });

        if (!apiKey || apiKey.userId !== user.id) {
            return new NextResponse('Not found or unauthorized', { status: 404 });
        }

        await prisma.apiKey.delete({
            where: { id: params.keyId }
        });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('[API_KEYS_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
