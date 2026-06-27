import type { PricingInput, PricingCalcOutput } from '@/types/domain';

export function calculatePricing(input: PricingInput): PricingCalcOutput {
  const baseCost =
    input.supplyPrice +
    input.domesticShippingCost +
    input.overseasShippingCost +
    input.customsCost +
    input.packagingCost +
    input.otherCost +
    input.fulfillmentFee +
    input.storageFeeEstimate +
    input.returnFeeEstimate;

  const warnings: string[] = [];

  if (!input.supplyPrice) warnings.push('공급가가 입력되지 않았습니다.');
  if (!input.fulfillmentFee) warnings.push('로켓그로스 풀필먼트 비용이 입력되지 않았습니다.');
  if (!input.returnFeeEstimate) warnings.push('반품비 예상값이 입력되지 않았습니다.');
  if (!input.adCostEstimate) warnings.push('광고비 예상값이 입력되지 않았습니다.');
  if (!input.storageFeeEstimate) warnings.push('보관비 예상값이 입력되지 않았습니다(보관비 발생 가능성 있음).');

  const targetMargin = input.targetMarginRate / 100;
  const feeRate = input.coupangFeeRate / 100;

  const denomRecommended = 1 - feeRate - targetMargin;
  const denomMin = 1 - feeRate;
  const denomAdSafe = 1 - feeRate - 0.2;

  const recommendedPrice =
    denomRecommended > 0
      ? Math.ceil((baseCost + input.adCostEstimate) / denomRecommended / 100) * 100
      : Math.ceil((baseCost + input.adCostEstimate) * 2 / 100) * 100;

  const minimumPrice = denomMin > 0 ? Math.ceil(baseCost / denomMin / 100) * 100 : baseCost;

  const adSafePrice =
    denomAdSafe > 0
      ? Math.ceil((baseCost + input.adCostEstimate) / denomAdSafe / 100) * 100
      : recommendedPrice;

  const coupangFee = recommendedPrice * feeRate;
  const expectedProfit = Math.round(recommendedPrice - coupangFee - baseCost - input.adCostEstimate);
  const expectedMarginRate = recommendedPrice > 0 ? Number(((expectedProfit / recommendedPrice) * 100).toFixed(1)) : 0;

  if (expectedMarginRate < input.targetMarginRate) {
    warnings.push('예상 마진율이 목표 마진율보다 낮습니다.');
  }

  const recommendedInboundQty = input.supplyPrice > 0 && input.supplyPrice <= 2000 ? 10 : 5;
  const totalInitialCost =
    recommendedInboundQty * (input.supplyPrice + input.domesticShippingCost + input.packagingCost);

  return {
    recommendedPrice,
    minimumPrice,
    adSafePrice,
    expectedProfit,
    expectedMarginRate,
    breakevenQuantity: Math.max(1, Math.ceil(input.adCostEstimate / Math.max(expectedProfit, 1))),
    recommendedInboundQty,
    totalInitialCost,
    warnings,
    formula: {
      totalVariableCost: baseCost + input.adCostEstimate,
      coupangFee,
      expectedProfitFormula: '판매가 - 쿠팡수수료 - 총변동비 - 광고비',
      marginFormula: '예상순이익 / 판매가 * 100',
    },
  };
}

export const DEFAULT_PRICING_INPUT: PricingInput = {
  supplyPrice: 0,
  domesticShippingCost: 0,
  overseasShippingCost: 0,
  customsCost: 0,
  packagingCost: 0,
  otherCost: 0,
  coupangFeeRate: 10.8,
  fulfillmentFee: 2500,
  storageFeeEstimate: 0,
  returnFeeEstimate: 300,
  adCostEstimate: 10000,
  targetMarginRate: 40,
};
