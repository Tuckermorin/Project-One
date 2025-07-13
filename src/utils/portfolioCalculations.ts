import type { OptionContract } from '../models/OptionContract';
import type { Holding } from '../models/Portfolio';
// Import profit/loss calculator for unrealized P/L calculations
import { calculateProfitLoss } from '../utils/profitLossCalculator';

// Calculate the total value of all recorded holdings
export const calculateHoldingsValue = (holdings: Holding[]): number =>
  holdings.reduce((sum, h) => sum + h.shares * h.price, 0);

// Calculate net profit/loss from option contracts
export const calculateNetProfitLoss = (contracts: OptionContract[]): number =>
  contracts.reduce((sum, contract) => {
    // Closed or expired contracts should use the finalized P/L if available
    if (contract.status === 'closed' || contract.status === 'expired') {
      return sum + (typeof contract.finalProfitLoss === 'number'
        ? contract.finalProfitLoss
        : contract.expectedCreditOrDebit * contract.contracts * 100);
    }

    // For active contracts estimate unrealized P/L using current strike price
    const { ifSoldNow } = calculateProfitLoss(contract, contract.strikePrice);
    return sum + ifSoldNow;
  }, 0);

// Calculate overall portfolio value
export const calculateTotalPortfolioValue = (
  cash: number,
  holdings: Holding[],
  contracts: OptionContract[]
): number => cash + calculateHoldingsValue(holdings) + calculateNetProfitLoss(contracts);
