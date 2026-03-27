import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    let dbUserId = null;

    if (clerkId) {
      const dbUser = await prisma.user.findUnique({ where: { clerkId } });
      if (dbUser) {
        dbUserId = dbUser.id;
      }
    }

    const body = await request.json();

    // We only analyze tokens in this MVP
    const tokenAddress = (body.address || 'UNKNOWN').trim();

    // 1. Generate analysis ID
    const analysisId = `sent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2. Store initial record in Prisma
    await prisma.sentinelAnalysis.create({
      data: {
        id: analysisId,
        tokenAddress: tokenAddress,
        userId: dbUserId,
        status: 'processing',
      }
    });

    return NextResponse.json({
      analysisId,
      status: 'started'
    });
  } catch (error) {
    console.error("[Sentinel Analyze POST Error]", error);
    return NextResponse.json({ error: "Failed to initialize analysis" }, { status: 500 });
  }
}