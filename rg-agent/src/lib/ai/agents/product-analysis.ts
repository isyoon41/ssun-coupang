import { getAiProvider } from '../get-provider';
import type { ProductInput, ProductAnalysisOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runProductAnalysisAgent(input: ProductInput): Promise<ProductAnalysisOutput> {
  return getAiProvider().runAgent<ProductInput, ProductAnalysisOutput>({
    agentType: 'product_analysis',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.product_analysis,
  });
}
