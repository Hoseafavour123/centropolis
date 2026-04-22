import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

function generateKey(): string {
    return `binocs_live_${randomBytes(24).toString('hex')}`;
}

function preview(key: string): string {
    if (key.length < 10) return key;
    return `${key.slice(0, 12)}…${key.slice(-4)}`;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId: clerkId } = await auth();
        if (!clerkId || clerkId !== id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const keys = await prisma.apiKey.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(
            keys.map((k) => ({
                id: k.id,
                name: k.name,
                key: '',
                createdAt: k.createdAt.toISOString(),
                lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
                keyPreview: preview(k.key),
            }))
        );
    } catch (error) {
        console.error('[API_KEYS_GET]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId: clerkId } = await auth();
        if (!clerkId || clerkId !== id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const name = typeof body?.name === 'string' ? body.name.trim() : '';
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const key = generateKey();
        const created = await prisma.apiKey.create({
            data: { userId: user.id, name, key },
        });

        return NextResponse.json({
            id: created.id,
            name: created.name,
            key,
            createdAt: created.createdAt.toISOString(),
            lastUsedAt: null,
            keyPreview: preview(key),
        });
    } catch (error) {
        console.error('[API_KEYS_POST]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
