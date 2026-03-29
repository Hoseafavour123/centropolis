import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const secret = req.headers.get('x-webhook-secret');
        if (secret !== process.env.WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { userId, title, message, type } = data;

        if (!userId || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type || 'INFO',
            },
        });

        return NextResponse.json({ success: true, notification });
    } catch (error) {
        console.error('Webhook notification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
