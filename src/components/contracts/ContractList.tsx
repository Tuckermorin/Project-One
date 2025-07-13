import React, { useState, useMemo } from 'react';
import { Plus, ArrowLeft, Users, PieChart, History, Table, LayoutGrid, Group, Ungroup } from 'lucide-react';
import type { OptionContract } from '../../models/OptionContract';
import type { PortfolioGroup } from '../../types/portfolio';
import { useContracts } from '../../context/ContractsContext';
import { calculateProfitLoss } from '../../utils/profitLossCalculator';
import { formatProfitLoss, getProfitLossColor } from '../../utils/formatters';
import Button from '../common/Button';
import ContractCard from './ContractCard';
import ContractTable from './ContractTable';
import PortfolioAnalytics from '../portfolio/PortfolioAnalytics';
import GroupedContractView from './GroupedContractView';
// US-18 QuickSimulator import
import QuickSimulator from './QuickSimulator';

interface ContractListProps {
  onViewContract: (contract: OptionContract) => void;
  onNewContract: () => void;
  onEditContract: (contract: OptionContract) => void;
  onShowDocs: () => void;
  onShowExpired: () => void;
}

const ContractList: React.FC<ContractListProps> = ({ 
  onViewContract, 
  onNewContract, 
  onEditContract, 
  onShowDocs,
  onShowExpired 
}) => {
  const { deleteContract, getActiveContracts } = useContracts();
  const activeContracts = getActiveContracts();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<PortfolioGroup | null>(null);
  const [groupSimPrices, setGroupSimPrices] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [groupView, setGroupView] = useState(false);

  // Group contracts by symbol
  const portfolioGroups = useMemo((): PortfolioGroup[] => {
    const groups = activeContracts.reduce((acc, contract) => {
      const symbol = contract.symbol || 'Unknown';
      if (!acc[symbol]) {
        acc[symbol] = [];
      }
      acc[symbol].push(contract);
      return acc;
    }, {} as Record<string, OptionContract[]>);

    return Object.entries(groups).map(([symbol, contracts]) => {
      const totalValue = contracts.reduce((sum, c) => sum + (c.expectedCreditOrDebit * c.contracts * 100), 0);
      const totalPositions = contracts.reduce((sum, c) => sum + c.contracts, 0);
      
      // Simple risk calculation based on days to expiry and value
      const avgDaysToExpiry = contracts.reduce((sum, c) => {
        const today = new Date();
        const expiry = new Date(c.expirationDate);
        const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / contracts.length;

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (avgDaysToExpiry < 14 || Math.abs(totalValue) > 5000) riskLevel = 'high';
      else if (avgDaysToExpiry < 30 || Math.abs(totalValue) > 2000) riskLevel = 'medium';

      return {
        symbol,
        contracts,
        totalValue,
        totalPositions,
        riskLevel
      };
    });
  }, [activeContracts]);

  const handleDelete = (contractId: string) => {
    deleteContract(contractId);
    setShowDeleteConfirm(null);
  };

  const displayContracts = groupView
    ? activeContracts
    : selectedGroup
      ? selectedGroup.contracts
      : activeContracts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {selectedGroup && (
              <Button onClick={() => setSelectedGroup(null)} variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4" />
                All Contracts
              </Button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {selectedGroup ? `${selectedGroup.symbol} Contracts` : 'Options Tracker'}
              </h1>
              <p className="text-gray-600">
                {selectedGroup 
                  ? `${selectedGroup.totalPositions} positions in ${selectedGroup.symbol}` 
                  : 'Analyze and manage your options positions'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onShowDocs} variant="secondary" size="lg">
              Docs
            </Button>
            <Button onClick={onShowExpired} variant="secondary" size="lg">
              <History className="h-5 w-5" />
              History
            </Button>
            <Button
              onClick={() => {
                setGroupView(!groupView);
                setSelectedGroup(null);
              }}
              variant="secondary"
              size="lg"
            >
              {groupView ? (
                <Ungroup className="h-5 w-5" />
              ) : (
                <Group className="h-5 w-5" />
              )}
              {groupView ? ' Ungroup' : ' Grouped'}
            </Button>
            <Button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              variant="secondary"
              size="lg"
            >
              {viewMode === 'table' ? (
                <LayoutGrid className="h-5 w-5" />
              ) : (
                <Table className="h-5 w-5" />
              )}
              {viewMode === 'table' ? ' Card View' : ' Table View'}
            </Button>
            <Button onClick={onNewContract} size="lg">
              <Plus className="h-5 w-5" />
              New Contract
            </Button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <PortfolioAnalytics contracts={displayContracts} />

        {/* US-18 Quick Simulator for selected underlying */}
        {selectedGroup && (
          <QuickSimulator
            symbol={selectedGroup.symbol}
            contracts={selectedGroup.contracts}
            initialPrice={groupSimPrices[selectedGroup.symbol]}
            onPriceChange={(price) =>
              setGroupSimPrices(prev => ({ ...prev, [selectedGroup.symbol]: price }))
            }
          />
        )}

        {/* Portfolio Groups Overview - only show when viewing all contracts */}
        {!groupView && !selectedGroup && portfolioGroups.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Portfolio by Underlying
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {portfolioGroups.map(group => (
                <div
                  key={group.symbol}
                  onClick={() => setSelectedGroup(group)}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:from-gray-100 hover:to-gray-200 cursor-pointer transition-all duration-200 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg text-gray-900">{group.symbol}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                      group.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {group.riskLevel} risk
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Positions:</span>
                      <span className="font-medium">{group.contracts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Contracts:</span>
                      <span className="font-medium">{group.totalPositions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Portfolio Value:</span>
                      <span className={`font-bold ${getProfitLossColor(group.totalValue)}`}>
                        {formatProfitLoss(group.totalValue)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="text-xs text-gray-500 mb-1">Quick Simulator:</div>
                      {(() => {
                        const currentPrice = groupSimPrices[group.symbol] || 0;
                        const simPL = currentPrice > 0 ? group.contracts.reduce((sum, contract) => {
                          const pl = calculateProfitLoss(contract, currentPrice);
                          return sum + pl.ifSoldNow;
                        }, 0) : 0;

                        return (
                          <>
                            <input
                              type="number"
                              placeholder="Stock price"
                              className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              value={currentPrice || ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const price = parseFloat(e.target.value) || 0;
                                setGroupSimPrices(prev => ({
                                  ...prev,
                                  [group.symbol]: price
                                }));
                              }}
                            />
                            {currentPrice > 0 && (
                              <div className={`text-xs font-medium mt-1 ${getProfitLossColor(simPL)}`}>
                                P/L: {formatProfitLoss(simPL)}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupView ? (
          <GroupedContractView
            groups={portfolioGroups}
            viewMode={viewMode}
            onViewContract={onViewContract}
            onEditContract={onEditContract}
            onCloneContract={(contract) => {
              const { id, createdAt, updatedAt, ...data } = contract;
              onEditContract(data as OptionContract);
            }}
            onDeleteContract={(id) => setShowDeleteConfirm(id)}
          />
        ) : (
          <>
        {/* Contracts Grid / Table */}
        {displayContracts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
              <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedGroup ? `No contracts for ${selectedGroup.symbol}` : 'No contracts yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedGroup 
                  ? "This symbol doesn't have any contracts yet" 
                  : 'Create your first option contract to start tracking your positions'
                }
              </p>
              <Button onClick={onNewContract}>
                <Plus className="h-4 w-4" />
                {selectedGroup ? `Add Contract for ${selectedGroup.symbol}` : 'Add Your First Contract'}
              </Button>
            </div>
          </div>
        ) : (
          viewMode === 'table' ? (
            <ContractTable contracts={displayContracts} onViewContract={onViewContract} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayContracts.map(contract => (
                // US-18 pass simulator price when viewing a specific underlying
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  simPrice={selectedGroup ? groupSimPrices[selectedGroup.symbol] : undefined}
                  onClick={() => onViewContract(contract)}
                  onDelete={() => setShowDeleteConfirm(contract.id)}
                  onClone={() => {
                    const { id, createdAt, updatedAt, ...contractData } = contract;
                    onEditContract(contractData as OptionContract);
                  }}
                  onEdit={() => onEditContract(contract)}
                />
              ))}
            </div>
          )
        )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Contract</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this contract? This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractList;
