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
});