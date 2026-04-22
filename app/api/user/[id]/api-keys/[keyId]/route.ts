import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string; keyId: string }> }
) {
    try {
        const { id, keyId } = await params;
        const { userId: clerkId } = await auth();
        if (!clerkId || clerkId !== id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const result = await prisma.apiKey.deleteMany({
            where: { id: keyId, userId: user.id },
        });
        if (result.count === 0) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API_KEYS_DELETE]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
