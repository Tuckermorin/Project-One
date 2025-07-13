import React, { useState } from 'react';
import type { OptionContract } from '../../models/OptionContract';
import { calculateProfitLoss } from '../../utils/profitLossCalculator';
import { formatProfitLoss, getProfitLossColor } from '../../utils/formatters';
import Input from '../common/Input';

interface QuickSimulatorProps {
  symbol: string;
  contracts: OptionContract[];
  initialPrice?: number;
  onPriceChange: (price: number) => void;
}

// US-18 Quick Simulator component for entering a hypothetical underlying price
const QuickSimulator: React.FC<QuickSimulatorProps> = ({
  symbol,
  contracts,
  initialPrice = 0,
  onPriceChange
}) => {
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : '');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    if (!value) {
      setError('');
      onPriceChange(0);
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a positive number');
      onPriceChange(NaN);
    } else {
      setError('');
      onPriceChange(num);
    }
  };

  const simPrice = parseFloat(price);
  const isValid = !error && price !== '' && !isNaN(simPrice) && simPrice > 0;
  const totalPL = isValid
    ? contracts.reduce((sum, c) => sum + calculateProfitLoss(c, simPrice).ifSoldNow, 0)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Simulator</h3>
      <Input
        label={`Underlying Price for ${symbol}`}
        type="number"
        step="0.01"
        value={price}
        onChange={handleChange}
        error={error}
        className="mb-2"
      />
      {isValid && (
        <p className={`text-sm font-medium ${getProfitLossColor(totalPL)}`}>Total P/L: {formatProfitLoss(totalPL)}</p>
      )}
    </div>
  );
};

export default QuickSimulator;
