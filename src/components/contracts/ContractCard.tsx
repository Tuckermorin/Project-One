import React from 'react';
import type { OptionContract } from '../../models/OptionContract';

interface ContractCardProps {
  contract: OptionContract;
  onClick: () => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isCredit = contract.expectedCreditOrDebit > 0;
  const profitLossColor = isCredit ? 'text-green-600' : 'text-red-600';

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {contract.buyOrSell.toUpperCase()} {contract.optionType.toUpperCase()}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Strike: {formatCurrency(contract.strikePrice)}</p>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {contract.contracts} contract{contract.contracts !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Expires: {formatDate(contract.expirationDate)}
        </span>
        <span className={`font-medium ${profitLossColor}`}>
          {isCredit ? '+' : ''}{formatCurrency(contract.expectedCreditOrDebit)}
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>Breakeven: {formatCurrency(contract.breakeven)}</span>
        <span>PoP: {contract.chanceOfProfit}%</span>
      </div>
    </div>
  );
};

export default ContractCard;