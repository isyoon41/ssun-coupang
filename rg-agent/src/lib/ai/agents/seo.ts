import { getAiProvider } from '../mock-provider';
import type { ProductInput, SeoOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runSeoAgent(input: ProductInput): Promise<SeoOutput> {
  return getAiProvider().runAgent<ProductInput, SeoOutput>({
    agentType: 'seo',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.seo,
  });
}
