import React from 'react';
import { Trash2, Calendar, Eye, Copy, Edit } from 'lucide-react';
import type { OptionContract } from '../../models/OptionContract';
import { formatCurrency, formatProfitLoss, getProfitLossColor } from '../../utils/formatters';
import { calculateProfitLoss } from '../../utils/profitLossCalculator';
import Button from '../common/Button';
// US-3 imports for risk display and payoff thumbnail
import PayoffDiagram from './PayoffDiagram';
import { calculateRisk, getRiskColor } from '../../utils/riskCalculator';

interface ContractCardProps {
  contract: OptionContract;
  onClick: () => void;
  onDelete: () => void;
  onClone: () => void;
  onEdit: () => void;
  // US-18 optional simulated price for quick simulator
  simPrice?: number;
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onClick,
  onDelete,
  onClone,
  onEdit,
  simPrice
}) => {
  const isCredit = contract.expectedCreditOrDebit > 0;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const today = new Date();
  const expiry = new Date(contract.expirationDate);
  const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysToExpiry <= 7;
  // Calculate risk scores for US-3 visual indicators
  const risk = calculateRisk(contract);
  // US-18 calculate simulated profit/loss when a simulator price is provided
  const simulatedPL = typeof simPrice === 'number' && simPrice > 0
    ? calculateProfitLoss(contract, simPrice).ifSoldNow
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Header with action and delete */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              contract.buyOrSell === 'buy' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {contract.buyOrSell.toUpperCase()}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              contract.optionType === 'call' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {contract.optionType.toUpperCase()}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="p-1.5 hover:bg-green-50 rounded-lg"
              title="Edit contract"
            >
              <Edit className="h-4 w-4 text-green-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone?.();
              }}
              className="p-1.5 hover:bg-blue-50 rounded-lg"
              title="Clone and edit contract"
            >
              <Copy className="h-4 w-4 text-blue-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 hover:bg-red-50 rounded-lg"
              title="Delete contract"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg text-gray-900">
            {contract.symbol || 'Contract'} ${contract.strikePrice}
          </h3>
          <span className="text-sm text-gray-500 font-medium">
            {contract.contracts} contract{contract.contracts !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Risk Bars & Payoff Diagram - US-3 */}
      <div className="px-4 pb-3 flex gap-3">
        <PayoffDiagram contract={contract} width={80} height={50} />
        <div className="flex-1 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-16 text-gray-500">Decay</span>
            <div className="flex-1 h-2 bg-gray-100 rounded">
              <div
                className={`h-2 rounded ${getRiskColor(risk.timeDecay)}`}
                style={{ width: `${risk.timeDecay * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-gray-500">Delta</span>
            <div className="flex-1 h-2 bg-gray-100 rounded">
              <div
                className={`h-2 rounded ${getRiskColor(risk.delta)}`}
                style={{ width: `${risk.delta * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-gray-500">Vol</span>
            <div className="flex-1 h-2 bg-gray-100 rounded">
              <div
                className={`h-2 rounded ${getRiskColor(risk.volatility)}`}
                style={{ width: `${risk.volatility * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profit/Loss Section */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Expected P/L</span>
          <span className={`font-bold text-lg ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
            {formatProfitLoss(contract.expectedCreditOrDebit * contract.contracts * 100)}
          </span>
        </div>

        {/* US-18 Display simulated P/L when provided */}
        {simulatedPL !== null && (
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-gray-600">Simulated P/L</span>
            <span className={`font-medium ${getProfitLossColor(simulatedPL)}`}>{formatProfitLoss(simulatedPL)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>Breakeven: {formatCurrency(contract.breakeven)}</span>
          <span className="font-medium">{contract.chanceOfProfit}% PoP</span>
        </div>
      </div>

      {/* Expiry Warning */}
      {isExpiringSoon && (
        <div className="px-4 pb-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                Expires in {daysToExpiry} day{daysToExpiry !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Expires: {formatDate(contract.expirationDate)}
          </span>
          <Button onClick={onClick} variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
            Analyze
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;