export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatProfitLoss = (amount: number): string => {
  const isPositive = amount >= 0;
  const formatted = formatCurrency(Math.abs(amount));
  return isPositive ? `+${formatted}` : `-${formatted}`;
};

export const getProfitLossColor = (amount: number) => amount >= 0 ? 'text-green-600' : 'text-red-600';