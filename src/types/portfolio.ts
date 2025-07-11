import type { OptionContract } from '../models/OptionContract';

export interface PortfolioGroup {
  symbol: string;
  contracts: OptionContract[];
  totalValue: number;
  totalPositions: number;
  riskLevel: 'low' | 'medium' | 'high';
}