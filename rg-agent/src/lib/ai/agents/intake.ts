import { getAiProvider } from '../get-provider';
import type { ProductInput, IntakeOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runIntakeAgent(input: ProductInput): Promise<IntakeOutput> {
  return getAiProvider().runAgent<ProductInput, IntakeOutput>({
    agentType: 'intake',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.intake,
  });
}
