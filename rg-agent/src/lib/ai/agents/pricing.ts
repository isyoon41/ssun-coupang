import { calculatePricing } from '@/lib/pricing/calculator';
import type { PricingInput, PricingCalcOutput } from '@/types/domain';

// Pricing 은 LLM 호출이 아니라 결정적 계산기를 사용한다(스펙 16.2).
export async function runPricingAgent(input: PricingInput): Promise<PricingCalcOutput> {
  return calculatePricing(input);
}
