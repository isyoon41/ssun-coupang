import { getAiProvider } from '../get-provider';
import type { ProductInput, QaOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runQaAgent(input: ProductInput): Promise<QaOutput> {
  return getAiProvider().runAgent<ProductInput, QaOutput>({
    agentType: 'qa',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.qa,
  });
}
