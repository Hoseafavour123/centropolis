import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse('User not found', { status: 404 });

    await prisma.user.update({
      where: { clerkId },
      data: {
        plan: 'FREE',
        planExpiresAt: null,
        planStartedAt: null,
      }
    });

    return NextResponse.json({ success: true, plan: 'FREE' });
  } catch (error) {
    console.error('[PAYMENT_CANCEL]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
