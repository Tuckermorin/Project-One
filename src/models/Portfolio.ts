// src/models/Portfolio.ts

export interface Holding {
  id: string;
  symbol: string;
  shares: number;
  price: number; // price per share
}

export interface PortfolioState {
  cash: number;
  holdings: Holding[];
}

export interface PortfolioSummary {
  cash: number;
  holdingsValue: number;
  netProfitLoss: number;
  totalValue: number;
}
