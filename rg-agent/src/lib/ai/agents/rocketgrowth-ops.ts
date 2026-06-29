import { getAiProvider } from '../get-provider';
import type { ProductInput, OpsChecklistOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runRocketGrowthOpsAgent(input: ProductInput): Promise<OpsChecklistOutput> {
  return getAiProvider().runAgent<ProductInput, OpsChecklistOutput>({
    agentType: 'rocketgrowth_ops',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.rocketgrowth_ops,
  });
}
