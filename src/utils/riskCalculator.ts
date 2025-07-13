export interface RiskBreakdown {
  timeDecay: number;
  delta: number;
  volatility: number;
}

import type { OptionContract } from '../models/OptionContract';

// Calculate simple risk scores between 0 and 1
export const calculateRisk = (contract: OptionContract): RiskBreakdown => {
  const today = new Date();
  const expiry = new Date(contract.expirationDate);
  const daysToExpiry = Math.max(0, (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Time decay risk increases as expiration approaches
  const timeDecay = daysToExpiry <= 0 ? 1 : Math.min(1, 30 / daysToExpiry);

  // Use chance of profit as inverse proxy for delta risk
  const delta = 1 - contract.chanceOfProfit / 100;

  // Volatility risk based on recent percent change of option price
  const volatility = Math.min(1, Math.abs(contract.percentChange) / 10);

  return { timeDecay, delta, volatility };
};

// Map a risk score to a Tailwind color class
export const getRiskColor = (score: number): string => {
  if (score < 0.33) return 'bg-green-500';
  if (score < 0.66) return 'bg-yellow-500';
  return 'bg-red-500';
};
