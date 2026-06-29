import { getAiProvider } from '../get-provider';
import type { ProductInput, CreativeOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runCreativeAgent(input: ProductInput): Promise<CreativeOutput> {
  return getAiProvider().runAgent<ProductInput, CreativeOutput>({
    agentType: 'creative',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.creative,
  });
}
