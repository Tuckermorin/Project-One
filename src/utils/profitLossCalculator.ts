import type { OptionContract } from '../models/OptionContract';

export interface ProfitLossResult {
  ifSoldNow: number;
  ifExercisedAtExpiration: number;
  breakeven: number;
  daysToExpiration: number;
}

export const calculateProfitLoss = (
  contract: OptionContract,
  currentUnderlyingPrice: number,
  currentOptionPrice?: number
): ProfitLossResult => {
  const { strikePrice, contracts, expectedCreditOrDebit, buyOrSell, optionType, expirationDate } = contract;
  
  // Calculate days to expiration
  const today = new Date();
  const expiration = new Date(expirationDate);
  const daysToExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Normalize premium: positive if you received cash, negative if you paid cash
  const totalPremium = expectedCreditOrDebit * contracts * 100;

  // Calculate intrinsic value at current underlying price
  const intrinsicPerShare = optionType === 'call'
    ? Math.max(0, currentUnderlyingPrice - strikePrice)
    : Math.max(0, strikePrice - currentUnderlyingPrice);
  const totalIntrinsic = intrinsicPerShare * contracts * 100;

  // Estimate current option price if not provided
  let currentPrice = currentOptionPrice;
  if (!currentPrice) {
    // Simple estimate: intrinsic value plus time value decay
    const timeValueDecay = daysToExpiration > 0 ? Math.max(0.1, daysToExpiration / 365) : 0;
    const originalTimeValue = Math.abs(contract.bidPrice) - Math.max(0, 
      optionType === 'call' 
        ? strikePrice - currentUnderlyingPrice 
        : currentUnderlyingPrice - strikePrice
    );
    currentPrice = Math.max(0.01, intrinsicPerShare + (originalTimeValue * timeValueDecay));
  }

  // P/L if closed now
  const cashOnClose = currentPrice * contracts * 100 * (buyOrSell === 'buy' ? -1 : 1);
  const ifSoldNow = totalPremium + cashOnClose;

  // P/L at expiration
  const ifExercisedAtExpiration = buyOrSell === 'buy'
    ? totalIntrinsic + totalPremium
    : totalPremium - totalIntrinsic;

  return {
    ifSoldNow,
    ifExercisedAtExpiration,
    breakeven: contract.breakeven,
    daysToExpiration,
  };
};

export const formatProfitLoss = (amount: number): string => {
  const isPositive = amount >= 0;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
  
  return isPositive ? `+${formatted}` : `-${formatted}`;
};