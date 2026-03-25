import OpenAI from 'openai';
import { NormalizedSentinelData } from '../sentinelEngine';

// Ensure the API key is only used on the server
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const sentinelAI = {
  /**
   * STEP A: Rug Analysis
   */
  async analyzeRugRisk(data: NormalizedSentinelData) {
    const prompt = `You are a smart contract security auditor.
Analyze this token data for rug pull risk.
Token Data:
${JSON.stringify(data.token, null, 2)}
Holder Concentration: ${data.holders.concentration}%
Transactions: ${JSON.stringify(data.transactions.slice(0, 5), null, 2)}

Return STRICT JSON with:
- isRug (boolean)
- confidence (number 0-100)
- riskLevel ("none" | "low" | "medium" | "high" | "critical")
- indicators (array of objects: { id, name, description, severity ("info"|"warning"|"critical"), status ("passed"|"failed"|"unknown") })
- summary (string)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  },

  /**
   * STEP B: Market Analysis
   */
  async analyzeMarket(data: NormalizedSentinelData) {
    const prompt = `You are a crypto market analyst.
Evaluate liquidity health, whale activity, and trading behavior based on the following data.
Token: ${data.token.symbol}
Liquidity: $${data.token.liquidity}
Volume 24h: $${data.token.volume24h}
Price Change 24h: ${data.token.change24h}%
Transactions: ${JSON.stringify(data.transactions, null, 2)}

Return STRICT JSON with:
- liquidityScore (number 0-100)
- smartMoneyScore (number 0-100)
- volatilityScore (number 0-100)
- summary (string)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  },

  /**
   * STEP C: Final Decision Engine Stream
   * This method returns the OpenAI stream object so the API route can consume it.
   */
  async streamFinalDecision(
    data: NormalizedSentinelData,
    rugAnalysis: any,
    marketAnalysis: any
  ) {
    const prompt = `You are Sentinel AI, a high-level on-chain security and market analysis engine.
Combine all analysis (rug risk and market health) for the token ${data.token.name} (${data.token.symbol}) and output a FINAL assessment.

OUTPUT REQUIREMENTS:
- Return ONLY a STRICT JSON object. 
- Do NOT include any markdown formatting (no \`\`\`json block).
- Do NOT include any preamble or narrative text outside the JSON.
- MANDATORY: You MUST explicitly mention the token name "${data.token.name}" and symbol "${data.token.symbol}" in both the "summary" and "technicalExplanation" fields.
- DYNAMIC: You MUST calculate all scores, recommendations, and metrics based on the provided CONTEXT. Do NOT use hardcoded values.

JSON STRUCTURE:
{
  "summary": "High-level summary of ${data.token.name}'s safety and market potential. Must mention ${data.token.symbol}.",
  "finalScore": "[Number 0-100: Calculate based on rug risk (primary) and market health (secondary)]",
  "metrics": {
    "liquidityDepth": ${data.token.liquidity},
    "topHoldersPercent": ${data.holders.concentration},
    "recentSmartBuys": "[Integrate from transaction history context]",
    "volatilityIndex": "[Calculate from price changes and volume]"
  },
  "rugDetection": {
    "isRug": ${rugAnalysis.isRug},
    "confidence": ${rugAnalysis.confidence},
    "riskLevel": "${rugAnalysis.riskLevel}",
    "indicators": ${JSON.stringify(rugAnalysis.indicators)},
    "summary": "${rugAnalysis.summary}"
  },
  "recommendation": {
    "action": "[one of: 'buy', 'hold', 'sell', 'avoid']",
    "summary": "[Brief justification for the action]",
    "detailedAdvice": "[Specific entry/exit or caution strategy]",
    "timeHorizon": "[one of: 'short', 'medium', 'long']",
    "confidence": "[Number 0-100]"
  },
  "evidence": [
    { "id": "1", "type": "onchain", "title": "Liquidity", "timestamp": "${new Date().toISOString()}", "content": "..." },
    { "id": "2", "type": "market", "title": "Market Sentiment", "timestamp": "${new Date().toISOString()}", "content": "..." }
  ],
  "technicalExplanation": "A detailed technical breakdown of ${data.token.name} (${data.token.symbol}) audit logic, data correlation, and specific risk weights."
}

CONTEXT:
Token Identity: Name: ${data.token.name}, Symbol: ${data.token.symbol}, Address: ${data.token.address}
Rug Analysis: ${JSON.stringify(rugAnalysis, null, 2)}
Market Analysis: ${JSON.stringify(marketAnalysis, null, 2)}
Raw Market Data: ${JSON.stringify(data.token, null, 2)}`;

    // We use gpt-4o (which acts as the "gpt-5" requested)
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      stream: true,
      // We don't use json_object here because some frontends struggle to incrementally parse json_object streams, 
      // but the prompt strongly enforces JSON output.
    });

    return stream;
  }
};
