// app/api/sentinel/result/[id]/route.ts

import { NextResponse } from 'next/server';
import { mockSentinelResult } from '@/mocks/sentinel.mock';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Simulate processing delay
  await new Promise(r => setTimeout(r, 500));
  
  return NextResponse.json({
    ...mockSentinelResult,
    analysisId: id,
  });
}