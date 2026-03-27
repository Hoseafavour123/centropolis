import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const analysis = await prisma.sentinelAnalysis.findUnique({
      where: { id }
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.status !== 'completed' || !analysis.result) {
      // If still processing or failed, return status so the client knows to keep polling or stop
      return NextResponse.json({ status: analysis.status, analysisId: id });
    }

    // Merge the stored JSON result with required top-level fields
    return NextResponse.json({
      ...(analysis.result as any),
      analysisId: id,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    console.error("[Sentinel Result GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 });
  }
}