import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PortfolioGroup } from '../../types/portfolio';
import type { OptionContract } from '../../models/OptionContract';
import { formatProfitLoss, getProfitLossColor } from '../../utils/formatters';
import ContractCard from './ContractCard';
import ContractTable from './ContractTable';

interface GroupedContractViewProps {
  groups: PortfolioGroup[];
  viewMode: 'cards' | 'table';
  onViewContract: (contract: OptionContract) => void;
  onEditContract: (contract: OptionContract) => void;
  onCloneContract: (contract: OptionContract) => void;
  onDeleteContract: (id: string) => void;
}

const GroupedContractView: React.FC<GroupedContractViewProps> = ({
  groups,
  viewMode,
  onViewContract,
  onEditContract,
  onCloneContract,
  onDeleteContract
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (symbol: string) => {
    setOpenGroups(prev => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  return (
    <div className="space-y-4">
      {groups.map(group => {
        const isOpen = !!openGroups[group.symbol];
        return (
          <div
            key={group.symbol}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              className="w-full flex justify-between items-center p-4 text-left"
              onClick={() => toggleGroup(group.symbol)}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group.symbol}</h3>
                <p className="text-sm text-gray-600">
                  {group.contracts.length} positions / {group.totalPositions} contracts
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold ${getProfitLossColor(group.totalValue)}`}>{formatProfitLoss(group.totalValue)}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.riskLevel === 'high'
                      ? 'bg-red-100 text-red-700'
                      : group.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {group.riskLevel} risk
                </span>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </button>
            <div
              className={`transition-[max-height] duration-300 overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
              {isOpen && (
                <div className="p-4">
                  {viewMode === 'table' ? (
                    <ContractTable contracts={group.contracts} onViewContract={onViewContract} />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {group.contracts.map(contract => (
                        <ContractCard
                          key={contract.id}
                          contract={contract}
                          onClick={() => onViewContract(contract)}
                          onDelete={() => onDeleteContract(contract.id)}
                          onClone={() => onCloneContract(contract)}
                          onEdit={() => onEditContract(contract)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupedContractView;
