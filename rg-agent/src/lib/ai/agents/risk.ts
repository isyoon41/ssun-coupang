import { getAiProvider } from '../get-provider';
import type { ProductInput, RiskOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runRiskAgent(input: ProductInput): Promise<RiskOutput> {
  return getAiProvider().runAgent<ProductInput, RiskOutput>({
    agentType: 'risk',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.risk,
  });
}
