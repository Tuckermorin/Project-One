import React, { useState } from 'react';
import type { OptionContract } from '../../models/OptionContract';
import { calculateProfitLoss, formatProfitLoss } from '../../utils/profitLossCalculator';
import Button from '../common/Button';
import Input from '../common/Input';

interface ContractDetailProps {
  contract: OptionContract;
  onBack: () => void;
}

const ContractDetail: React.FC<ContractDetailProps> = ({ contract, onBack }) => {
  const [currentUnderlyingPrice, setCurrentUnderlyingPrice] = useState<number>(contract.strikePrice);
  const [currentOptionPrice, setCurrentOptionPrice] = useState<number>(contract.bidPrice);

  const profitLoss = calculateProfitLoss(contract, currentUnderlyingPrice, currentOptionPrice);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProfitLossColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contract Details</h2>
        <Button onClick={onBack} variant="secondary">
          ← Back to List
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contract Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Action:</span>
              <span className="font-medium">{contract.buyOrSell.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="font-medium">{contract.optionType.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Strike Price:</span>
              <span className="font-medium">{formatCurrency(contract.strikePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Expiration:</span>
              <span className="font-medium">{formatDate(contract.expirationDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Contracts:</span>
              <span className="font-medium">{contract.contracts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Breakeven:</span>
              <span className="font-medium">{formatCurrency(contract.breakeven)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Chance of Profit:</span>
              <span className="font-medium">{contract.chanceOfProfit}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Credit/Debit:</span>
              <span className={`font-medium ${contract.expectedCreditOrDebit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(contract.expectedCreditOrDebit)}
              </span>
            </div>
          </div>
        </div>

        {/* Profit/Loss Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profit/Loss Calculator</h3>
          
          <div className="space-y-4 mb-6">
            <Input
              label="Current Underlying Price"
              type="number"
              step="0.01"
              value={currentUnderlyingPrice}
              onChange={(e) => setCurrentUnderlyingPrice(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Current Option Price"
              type="number"
              step="0.01"
              value={currentOptionPrice}
              onChange={(e) => setCurrentOptionPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">If Sold Now</h4>
              <p className={`text-2xl font-bold ${getProfitLossColor(profitLoss.ifSoldNow)}`}>
                {formatProfitLoss(profitLoss.ifSoldNow)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">At Expiration</h4>
              <p className={`text-2xl font-bold ${getProfitLossColor(profitLoss.ifExercisedAtExpiration)}`}>
                {formatProfitLoss(profitLoss.ifExercisedAtExpiration)}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Days to Expiration:</span>
                <span className="font-medium">{profitLoss.daysToExpiration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;