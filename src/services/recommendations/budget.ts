export function estimateStopCostPerPerson(minPrice: number, maxPrice: number) {
  return Math.round((minPrice + maxPrice) / 2);
}

export function fitsRemainingBudget(params: {
  currentTotalCost: number;
  stopCostPerPerson: number;
  numberOfPeople: number;
  totalBudget: number;
}) {
  const nextTotal = params.currentTotalCost + params.stopCostPerPerson * params.numberOfPeople;
  return nextTotal <= params.totalBudget;
}

