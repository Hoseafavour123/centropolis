// app/api/sentinel/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mockAnalysisStart } from '@/mocks/sentinel.mock';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // In production: validate, queue job, return ID
  // For now: return mock
  
  return NextResponse.json({
    analysisId: `sent-${Date.now()}`,
    status: 'started',
    entity: body.entityType,
    chain: body.chain,
  });
}