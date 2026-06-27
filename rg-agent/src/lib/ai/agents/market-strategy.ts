import { getAiProvider } from '../mock-provider';
import type { ProductInput, MarketStrategyOutput } from '@/types/domain';
import { AGENT_PROMPTS, COMMON_SYSTEM_PROMPT } from '../prompts';

export async function runMarketStrategyAgent(input: ProductInput): Promise<MarketStrategyOutput> {
  return getAiProvider().runAgent<ProductInput, MarketStrategyOutput>({
    agentType: 'market_strategy',
    input,
    systemPrompt: COMMON_SYSTEM_PROMPT,
    userPrompt: AGENT_PROMPTS.market_strategy,
  });
}
