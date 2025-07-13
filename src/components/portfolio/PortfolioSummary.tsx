import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useContracts } from '../../context/ContractsContext';
import { calculateHoldingsValue, calculateNetProfitLoss, calculateTotalPortfolioValue } from '../../utils/portfolioCalculations';
import { formatProfitLoss, getProfitLossColor } from '../../utils/formatters';

// Display portfolio totals: cash, holdings value, contract P/L and overall total
const PortfolioSummary: React.FC = () => {
  const { cash, holdings } = usePortfolio();
  const { contracts } = useContracts();

  const holdingsValue = calculateHoldingsValue(holdings);
  const netPL = calculateNetProfitLoss(contracts);
  const total = calculateTotalPortfolioValue(cash, holdings, contracts);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Cash</span>
          <span className={getProfitLossColor(cash)}>{formatProfitLoss(cash)}</span>
        </div>
        <div className="flex justify-between">
          <span>Holdings</span>
          <span className={getProfitLossColor(holdingsValue)}>{formatProfitLoss(holdingsValue)}</span>
        </div>
        <div className="flex justify-between">
          <span>Net P/L</span>
          <span className={getProfitLossColor(netPL)}>{formatProfitLoss(netPL)}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total Value</span>
          <span className={getProfitLossColor(total)}>{formatProfitLoss(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
