import type { OptionContract } from '../models/OptionContract';
import type { Holding } from '../models/Portfolio';

// Calculate the total value of all recorded holdings
export const calculateHoldingsValue = (holdings: Holding[]): number =>
  holdings.reduce((sum, h) => sum + h.shares * h.price, 0);

// Calculate net profit/loss from option contracts
export const calculateNetProfitLoss = (contracts: OptionContract[]): number =>
  contracts.reduce((sum, c) =>
    sum + (typeof c.finalProfitLoss === 'number'
      ? c.finalProfitLoss
      : c.expectedCreditOrDebit * c.contracts * 100)
  , 0);

// Calculate overall portfolio value
export const calculateTotalPortfolioValue = (
  cash: number,
  holdings: Holding[],
  contracts: OptionContract[]
): number => cash + calculateHoldingsValue(holdings) + calculateNetProfitLoss(contracts);
