import type { AiProvider, RunAgentParams } from './provider';

const GEMINI_MODEL = process.env.GOOGLE_AI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// 각 agentType이 반환해야 하는 JSON 형태를 LLM에게 알려주기 위한 예시 스키마.
// src/types/domain.ts의 TS 인터페이스와 1:1로 대응한다.
const OUTPUT_SHAPE: Record<string, string> = {
  intake: `{
  "normalizedProductName": string,
  "sourcePlatform": string,
  "detectedCategory": string | null,
  "priceInfo": { "supplyPrice": number | null, "domesticShippingCost": number | null },
  "availableData": string[],
  "missingData": string[],
  "fallbackInstructions": string[],
  "notes": string[]
}`,
  product_analysis: `{
  "oneLineSummary": string,
  "mainFeatures": string[],
  "materialAndForm": string,
  "useCases": string[],
  "targetCustomers": string[],
  "painPoints": string[],
  "purchaseTriggers": string[],
  "purchaseBarriers": string[],
  "visualSellingPoints": string[],
  "detailPageMessage": string,
  "sellingDifficulty": "low" | "medium" | "high",
  "recommendationGrade": "A" | "B" | "C" | "D" | "E",
  "recommendationReason": string,
  "cautions": string[]
}`,
  risk: `{
  "overallRiskLevel": "low" | "medium" | "high" | "critical",
  "ipRisks": [{ "level": "low"|"medium"|"high"|"critical", "title": string, "description": string, "actionRequired": string }],
  "adExpressionRisks": [{ "level": "low"|"medium"|"high"|"critical", "title": string, "description": string, "actionRequired": string }],
  "certificationRisks": [{ "level": "low"|"medium"|"high"|"critical", "title": string, "description": string, "actionRequired": string }],
  "imageCopyrightRisks": [{ "level": "low"|"medium"|"high"|"critical", "title": string, "description": string, "actionRequired": string }],
  "prohibitedExpressions": string[],
  "replacementExpressions": [{ "original": string, "replacement": string }],
  "kiprisSearchKeywords": string[],
  "finalWarning": string
}`,
  market_strategy: `{
  "positioningStatement": string,
  "coreSellingPoints": string[],
  "targetMessages": [{ "target": string, "message": string }],
  "purchaseTriggers": string[],
  "objectionHandling": [{ "concern": string, "response": string }],
  "detailPageFlow": string[],
  "reviewPromptPoints": string[],
  "differentiation": string[],
  "cautions": string[]
}`,
  seo: `{
  "titleCandidates": string[],
  "recommendedTitle": string,
  "titleRationale": string,
  "mainKeywords": string[],
  "relatedKeywords": string[],
  "longtailKeywords": string[],
  "brandConceptKeywords": string[],
  "searchTags20": string[] (정확히 20개),
  "excludedKeywords": string[],
  "cautions": string[]
}`,
  creative: `{
  "thumbnailConcepts": [{ "title": string, "concept": string, "visualDirection": string, "mainCopy": string, "cautions": string[] }],
  "detailPageSections": [{ "order": number, "title": string, "body": string, "imageGuide": string }],
  "detailPageMarkdown": string,
  "detailPageHtml": string,
  "adCopies": string[],
  "bannerCopies": string[],
  "imagePrompts": string[],
  "videoScript": string,
  "cautions": string[]
}`,
  rocketgrowth_ops: `{
  "inboundRecommendation": string,
  "recommendedInboundQty": number,
  "checklist": [{ "id": string, "label": string, "required": boolean, "completed": boolean, "riskLevel": "low"|"medium"|"high"|"critical" }],
  "highRiskItems": string[],
  "cautions": string[]
}`,
  ad_strategy: `{
  "campaignObjective": string,
  "recommendedAdType": string,
  "campaignName": string,
  "dailyBudget": number,
  "targetRoas": number,
  "operationPeriodDays": number,
  "stopCriteria": string[],
  "scaleCriteria": string[],
  "negativeKeywordCandidates": string[],
  "reviewChecklist": string[],
  "cautions": string[]
}`,
  qa: `{
  "overallQualityScore": number,
  "pass": boolean,
  "issues": [{ "area": string, "severity": "low"|"medium"|"high"|"critical", "issue": string, "recommendation": string }],
  "mustFixBeforePackage": string[],
  "suggestedImprovements": string[],
  "finalNote": string
}`,
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

export class GoogleAiProvider implements AiProvider {
  constructor(private apiKey: string) {}

  async runAgent<TInput, TOutput>(params: RunAgentParams<TInput>): Promise<TOutput> {
    const shape = OUTPUT_SHAPE[params.agentType];
    if (!shape) {
      throw new Error(`GoogleAiProvider: agentType "${params.agentType}"에 대한 출력 스키마가 정의되지 않았습니다.`);
    }

    const prompt = `${params.systemPrompt ?? ''}

${params.userPrompt ?? ''}

입력 데이터(JSON):
${JSON.stringify(params.input, null, 2)}

아래 JSON 형태(키 이름과 타입을 그대로 유지)로만 응답하라. 코드블록이나 설명 문구 없이 JSON 객체 하나만 출력하라.
${shape}`;

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Gemini API 호출 실패 (${params.agentType}, status ${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error(`Google Gemini API 응답에 텍스트가 없습니다 (${params.agentType}): ${JSON.stringify(data)}`);
    }

    try {
      return JSON.parse(extractJson(text)) as TOutput;
    } catch (e) {
      throw new Error(
        `Google Gemini 응답을 JSON으로 파싱하지 못했습니다 (${params.agentType}): ${(e as Error).message}\n원본 응답: ${text}`,
      );
    }
  }
}
