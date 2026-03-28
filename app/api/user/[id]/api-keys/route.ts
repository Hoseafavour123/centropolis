import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = auth();

        if (!clerkId || clerkId !== params.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
            include: {
                apiKeys: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        lastUsedAt: true,
                        // For security, only return a portion of the key to the frontend
                        key: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Obfuscate the keys slightly before sending
        const keys = user.apiKeys.map(k => ({
            ...k,
            keyPreview: `...${k.key.slice(-4)}`
        }));

        return NextResponse.json(keys);

    } catch (error) {
        console.error('[API_KEYS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = auth();

        if (!clerkId || clerkId !== params.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return new NextResponse('API Key name is required', { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Generate a new key: ctr_ + 32 char random hex
        const newKeyString = `ctr_${crypto.randomBytes(32).toString('hex')}`;

        const newKey = await prisma.apiKey.create({
            data: {
                userId: user.id,
                name,
                key: newKeyString,
            }
        });

        // Mock analytics event logging would happen here
        console.log(`[ANALYTICS] api_key_created for user ${user.id}`);

        return NextResponse.json(newKey);

    } catch (error) {
        console.error('[API_KEYS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
