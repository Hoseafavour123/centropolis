import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sentinelEngine } from '@/services/sentinelEngine';
import { sentinelAI } from '@/services/ai/sentinelAI';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendSSE(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        // 1. Fetch analysis record
        const analysis = await prisma.sentinelAnalysis.findUnique({ where: { id } });
        if (!analysis || !analysis.tokenAddress) {
          throw new Error("Analysis not found or missing token address");
        }

        // 2. Fetch real data
        const data = await sentinelEngine.fetchData(analysis.tokenAddress);

        // Send metadata
        sendSSE({
          type: "meta",
          payload: {
            dataSources: [
              { source: "DexScreener API", timestamp: new Date().toISOString() },
              { source: "Helius RPC", timestamp: new Date().toISOString() }
            ]
          }
        });

        // 3. Parallel AI Analysis
        const [rugResult, marketResult] = await Promise.all([
          sentinelAI.analyzeRugRisk(data),
          sentinelAI.analyzeMarket(data)
        ]);

        // 4. Final Decision Stream
        const openAiStream = await sentinelAI.streamFinalDecision(data, rugResult, marketResult);

        let accumulatedText = "";
        // Loop over stream and send chunks
        for await (const chunk of openAiStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            accumulatedText += content;
            sendSSE({
              type: "chunk",
              payload: { text: content }
            });
          }
        }

        // Try to parse the accumulated JSON
        let finalJson;
        try {
          // Remove potential markdown block if AI included it despite instructions
          const cleanedText = accumulatedText.replace(/```json/g, '').replace(/```/g, '').trim();
          finalJson = JSON.parse(cleanedText);
        } catch (e) {
          console.error("Failed to parse Final Decision JSON:", e);
          console.error("Raw text was:", accumulatedText);
          throw new Error("AI returned invalid JSON structure");
        }

        // 5. Store in DB
        const parsedScore = parseInt(finalJson.finalScore, 10);
        const score = isNaN(parsedScore) ? 0 : parsedScore;

        await prisma.sentinelAnalysis.update({
          where: { id },
          data: {
            status: "completed",
            score: score,
            result: finalJson,
          }
        });

        // 6. Send Done
        sendSSE({
          type: "done",
          payload: finalJson
        });

        controller.close();
      } catch (error: any) {
        console.error("[Sentinel Stream Error]", error);

        // Update DB status to failed
        await prisma.sentinelAnalysis.update({
          where: { id },
          data: { status: "failed" }
        }).catch(() => { });

        sendSSE({
          type: "error",
          payload: { message: error.message || "An unknown error occurred during AI analysis" }
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}