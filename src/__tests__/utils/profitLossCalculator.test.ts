import { calculateProfitLoss } from '../../utils/profitLossCalculator';
import type { OptionContract } from '../../models/OptionContract';

describe('Profit/Loss Calculator', () => {
  const mockContract: OptionContract = {
    id: '1',
    buyOrSell: 'buy',
    optionType: 'call',
    expirationDate: '2024-12-31',
    strikePrice: 100,
    breakeven: 105,
    chanceOfProfit: 45,
    percentChange: 0,
    change: 0,
    bidPrice: 5,
    limitPrice: 5,
    contracts: 1,
    expectedCreditOrDebit: -5, // Paid $5 premium per contract (not total)
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  test('calculates profit for long call in the money', () => {
    const result = calculateProfitLoss(mockContract, 110, 12);
    
    // If sold now: (12 * 1 * 100) + (-5 * 1 * 100) = 1200 - 500 = 700
    expect(result.ifSoldNow).toBe(700);
    
    // At expiration: (110 - 100) * 1 * 100 + (-5 * 1 * 100) = 1000 - 500 = 500
    expect(result.ifExercisedAtExpiration).toBe(500);
  });

  test('calculates loss for long call out of the money', () => {
    const result = calculateProfitLoss(mockContract, 95, 1);
    
    // If sold now: (1 * 1 * 100) + (-5 * 1 * 100) = 100 - 500 = -400
    expect(result.ifSoldNow).toBe(-400);
    
    // At expiration: max(0, 95 - 100) * 1 * 100 + (-5 * 1 * 100) = 0 - 500 = -500
    expect(result.ifExercisedAtExpiration).toBe(-500);
  });

  test('calculates profit for short call', () => {
    const shortContract: OptionContract = {
      ...mockContract,
      buyOrSell: 'sell',
      expectedCreditOrDebit: 5,
    };
    const result = calculateProfitLoss(shortContract, 95, 1);

    // If sold now: 5*100 - 1*100 = 400
    expect(result.ifSoldNow).toBe(400);
    // At expiration: premium (500) - intrinsic (0) = 500
    expect(result.ifExercisedAtExpiration).toBe(500);
  });
});