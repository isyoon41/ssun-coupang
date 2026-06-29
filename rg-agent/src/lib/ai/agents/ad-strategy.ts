import { getAiProvider } from '../get-provider';
import type { ProductInput, AdStrategyOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runAdStrategyAgent(input: ProductInput): Promise<AdStrategyOutput> {
  return getAiProvider().runAgent<ProductInput, AdStrategyOutput>({
    agentType: 'ad_strategy',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.ad_strategy,
  });
}
