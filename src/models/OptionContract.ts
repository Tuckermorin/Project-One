// src/models/OptionContract.ts
export interface OptionContract {
  id: string;
  buyOrSell: 'buy' | 'sell';
  optionType: 'call' | 'put';
  expirationDate: string; // ISO date string
  strikePrice: number;
  breakeven: number;
  chanceOfProfit: number; // percentage (0-100)
  percentChange: number;
  change: number;
  bidPrice: number;
  limitPrice: number;
  contracts: number; // number of contracts
  expectedCreditOrDebit: number; // positive for credit, negative for debit
  createdAt: string;
  updatedAt: string;
  /** Optional stock symbol this contract belongs to */
  symbol?: string;
  /** Optional notes about the trade */
  notes?: string;
  /** Status of the contract */
  status?: 'active' | 'expired' | 'closed';
  /** Final underlying price at expiration */
  finalUnderlyingPrice?: number;
  /** Final profit/loss when closed/expired */
  finalProfitLoss?: number;
  /** Date when contract was closed or expired */
  closedDate?: string;
  /** Analysis of why the trade was profitable/unprofitable */
  analysis?: {
    wasProfit: boolean;
    reasonForOutcome: string;
    lessonsLearned: string;
    marketConditions: string;
    whatWentRight?: string;
    whatWentWrong?: string;
  };
}

export type ContractAction = 'buy' | 'sell';
export type OptionType = 'call' | 'put';

export const createEmptyContract = (): Omit<OptionContract, 'id' | 'createdAt' | 'updatedAt'> => ({
  buyOrSell: 'buy',
  optionType: 'call',
  expirationDate: '',
  strikePrice: 0,
  breakeven: 0,
  chanceOfProfit: 0,
  percentChange: 0,
  change: 0,
  bidPrice: 0,
  limitPrice: 0,
  contracts: 1,
  expectedCreditOrDebit: 0,
  symbol: '',
  notes: '',
});