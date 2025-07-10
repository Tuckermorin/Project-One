import React, { useState, useMemo } from 'react';
import { Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, Target, BarChart3, Eye, Plus, ArrowLeft, Calculator, PieChart, Copy, Edit, Activity, AlertTriangle, Users } from 'lucide-react';
import type { OptionContract } from './models/OptionContract';
import { calculateProfitLoss } from './utils/profitLossCalculator';
import { ContractsProvider, useContracts } from './context/ContractsContext';
import Button from './components/common/Button';
import OptionsGuide from './components/docs/OptionsGuide';

// Types and Interfaces

interface PortfolioGroup {
  symbol: string;
  contracts: OptionContract[];
  totalValue: number;
  totalPositions: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// Utility Functions

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatProfitLoss = (amount: number): string => {
  const isPositive = amount >= 0;
  const formatted = formatCurrency(Math.abs(amount));
  return isPositive ? `+${formatted}` : `-${formatted}`;
};

const getProfitLossColor = (amount: number) => amount >= 0 ? 'text-green-600' : 'text-red-600';

// UI Components

// New Portfolio Analytics Component with Enhanced Metrics
const PortfolioAnalytics: React.FC<{ contracts: OptionContract[] }> = ({ contracts }) => {
  const totalValue = contracts.reduce((sum, contract) => {
    return sum + (contract.expectedCreditOrDebit * contract.contracts * 100);
  }, 0);

  const activeProfitable = contracts.filter(c => c.chanceOfProfit > 50).length;
  const totalActive = contracts.length;
  const avgChanceOfProfit = contracts.length > 0 
    ? contracts.reduce((sum, c) => sum + c.chanceOfProfit, 0) / contracts.length 
    : 0;

  const daysToClosestExpiry = contracts.length > 0 
    ? Math.min(...contracts.map(c => {
        const today = new Date();
        const expiry = new Date(c.expirationDate);
        return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }))
    : 0;

  const expiringThisWeek = contracts.filter(c => {
    const today = new Date();
    const expiry = new Date(c.expirationDate);
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days >= 0;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
            <p className={`text-2xl font-bold ${totalValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatProfitLoss(totalValue)}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Positions</p>
            <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
            <p className="text-xs text-gray-500">{activeProfitable} profitable</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">{avgChanceOfProfit.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Next Expiry</p>
            <p className="text-2xl font-bold text-gray-900">{daysToClosestExpiry}d</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Expiring This Week</p>
            <p className={`text-2xl font-bold ${expiringThisWeek > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
              {expiringThisWeek}
            </p>
            {expiringThisWeek > 0 && (
              <p className="text-xs text-orange-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Review needed
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${expiringThisWeek > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
            <Activity className={`h-6 w-6 ${expiringThisWeek > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};



// Enhanced Contract Card
const ContractCard: React.FC<{
  contract: OptionContract;
  onClick: () => void;
  onDelete: () => void;
  onClone: () => void;
  onEdit: () => void;
}> = ({ contract, onClick, onDelete, onClone, onEdit }) => {
  const isCredit = contract.expectedCreditOrDebit > 0;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  
  const today = new Date();
  const expiry = new Date(contract.expirationDate);
  const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysToExpiry <= 7;

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

      {/* Profit/Loss Section */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Expected P/L</span>
          <span className={`font-bold text-lg ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
            {formatProfitLoss(contract.expectedCreditOrDebit * contract.contracts * 100)}
          </span>
        </div>
        
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

// Contract List Component with Portfolio Grouping
const ContractList: React.FC<{
  onViewContract: (contract: OptionContract) => void;
  onNewContract: () => void;
  onEditContract: (contract: OptionContract) => void;
  onShowDocs: () => void;
}> = ({ onViewContract, onNewContract, onEditContract, onShowDocs }) => {
  const { contracts, deleteContract } = useContracts();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<PortfolioGroup | null>(null);
  const [groupSimPrices, setGroupSimPrices] = useState<Record<string, number>>({});

  // Group contracts by symbol
  const portfolioGroups = useMemo((): PortfolioGroup[] => {
    const groups = contracts.reduce((acc, contract) => {
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
  }, [contracts]);

  const handleDelete = (contractId: string) => {
    deleteContract(contractId);
    setShowDeleteConfirm(null);
  };

  const displayContracts = selectedGroup ? selectedGroup.contracts : contracts;

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
            <Button onClick={onNewContract} size="lg">
              <Plus className="h-5 w-5" />
              New Contract
            </Button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <PortfolioAnalytics contracts={displayContracts} />

        {/* Removed global portfolio simulator - moved to individual group views */}  

        {/* Portfolio Groups Overview - only show when viewing all contracts */}
        {!selectedGroup && portfolioGroups.length > 1 && (
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

        {/* Contracts Grid */}
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayContracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
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

// Enhanced Group Detail View
const GroupDetailView: React.FC<{
  group: PortfolioGroup;
  onBack: () => void;
}> = ({ group, onBack }) => {
  const [simulationPrice, setSimulationPrice] = useState<number>(100);

  const groupSimulation = useMemo(() => {
    return group.contracts.map(contract => ({
      contract,
      pl: calculateProfitLoss(contract, simulationPrice)
    }));
  }, [group.contracts, simulationPrice]);

  const totalPL = groupSimulation.reduce((sum, item) => sum + item.pl.ifSoldNow, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{group.symbol} Analysis</h2>
            <p className="text-gray-600">{group.contracts.length} positions • {group.totalPositions} total contracts</p>
          </div>
        </div>

        {/* Group Simulator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {group.symbol} Price Simulator
            </h3>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">{group.symbol} Price:</label>
              <input
                type="number"
                step="0.01"
                value={simulationPrice}
                onChange={(e) => setSimulationPrice(parseFloat(e.target.value) || 100)}
                className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Total P/L at ${simulationPrice}</h4>
            <p className={`text-3xl font-bold ${getProfitLossColor(totalPL)}`}>
              {formatProfitLoss(totalPL)}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contract</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Strike</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contracts</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">P/L if Closed</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">P/L at Expiry</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Days to Exp</th>
                </tr>
              </thead>
              <tbody>
                {groupSimulation.map(({ contract, pl }) => (
                  <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          contract.buyOrSell === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {contract.buyOrSell.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          contract.optionType === 'call' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {contract.optionType.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{contract.optionType.toUpperCase()}</td>
                    <td className="py-3 px-4">{formatCurrency(contract.strikePrice)}</td>
                    <td className="py-3 px-4">{contract.contracts}</td>
                    <td className={`py-3 px-4 font-semibold ${getProfitLossColor(pl.ifSoldNow)}`}>
                      {formatProfitLoss(pl.ifSoldNow)}
                    </td>
                    <td className={`py-3 px-4 font-semibold ${getProfitLossColor(pl.ifExercisedAtExpiration)}`}>
                      {formatProfitLoss(pl.ifExercisedAtExpiration)}
                    </td>
                    <td className="py-3 px-4">{pl.daysToExpiration}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Scenario Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Price Scenario Analysis</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Bear Case (-20%)', multiplier: 0.8 },
              { label: 'Mild Bear (-10%)', multiplier: 0.9 },
              { label: 'Current Price', multiplier: 1.0 },
              { label: 'Mild Bull (+10%)', multiplier: 1.1 },
              { label: 'Bull Case (+20%)', multiplier: 1.2 },
              { label: 'Moon Shot (+50%)', multiplier: 1.5 },
            ].map(scenario => {
              const scenarioPrice = simulationPrice * scenario.multiplier;
              const scenarioPL = group.contracts.reduce((sum, contract) => {
                const pl = calculateProfitLoss(contract, scenarioPrice);
                return sum + pl.ifSoldNow;
              }, 0);

              return (
                <div key={scenario.label} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{scenario.label}</h4>
                  <p className="text-sm text-gray-600 mb-1">Price: {formatCurrency(scenarioPrice)}</p>
                  <p className={`text-lg font-bold ${getProfitLossColor(scenarioPL)}`}>
                    {formatProfitLoss(scenarioPL)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Scenario Analysis Component
const ScenarioAnalysis: React.FC<{ contract: OptionContract }> = ({ contract }) => {
  const scenarios = [
    { label: 'Bearish (-10%)', multiplier: 0.9 },
    { label: 'Mild Bear (-5%)', multiplier: 0.95 },
    { label: 'Current Price', multiplier: 1.0 },
    { label: 'Mild Bull (+5%)', multiplier: 1.05 },
    { label: 'Bullish (+10%)', multiplier: 1.1 },
    { label: 'Very Bull (+20%)', multiplier: 1.2 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Scenario</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock Price</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">P/L if Closed</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">P/L at Expiry</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario, index) => {
            const stockPrice = contract.strikePrice * scenario.multiplier;
            const pl = calculateProfitLoss(contract, stockPrice);
            return (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{scenario.label}</td>
                <td className="py-3 px-4">{formatCurrency(stockPrice)}</td>
                <td className={`py-3 px-4 font-semibold ${getProfitLossColor(pl.ifSoldNow)}`}>
                  {formatProfitLoss(pl.ifSoldNow)}
                </td>
                <td className={`py-3 px-4 font-semibold ${getProfitLossColor(pl.ifExercisedAtExpiration)}`}>
                  {formatProfitLoss(pl.ifExercisedAtExpiration)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Enhanced Contract Detail with Risk Analysis
const ContractDetail: React.FC<{
  contract: OptionContract;
  onBack: () => void;
}> = ({ contract, onBack }) => {
  const [currentUnderlyingPrice, setCurrentUnderlyingPrice] = useState<number>(contract.strikePrice);
  const [currentOptionPrice, setCurrentOptionPrice] = useState<number>(contract.bidPrice);

  const profitLoss = calculateProfitLoss(contract, currentUnderlyingPrice, currentOptionPrice);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  // Risk analysis
  const breakdownAnalysis = {
    timeDecay: profitLoss.daysToExpiration < 30 ? 'High Risk' : profitLoss.daysToExpiration < 60 ? 'Medium Risk' : 'Low Risk',
    deltaAnalysis: Math.abs(currentUnderlyingPrice - contract.strikePrice) / contract.strikePrice * 100,
    profitProbability: contract.chanceOfProfit
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Contract Analysis</h2>
            <p className="text-gray-600">{contract.symbol || 'Option Contract'} - Detailed breakdown</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Contract Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Contract Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Action</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  contract.buyOrSell === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {contract.buyOrSell.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Type</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  contract.optionType === 'call' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {contract.optionType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Strike Price</span>
                <span className="font-semibold">{formatCurrency(contract.strikePrice)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Expiration</span>
                <span className="font-semibold">{formatDate(contract.expirationDate)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Contracts</span>
                <span className="font-semibold">{contract.contracts}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Breakeven</span>
                <span className="font-semibold">{formatCurrency(contract.breakeven)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Probability of Profit</span>
                <span className="font-semibold">{contract.chanceOfProfit}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Premium</span>
                <span className={`font-semibold ${contract.expectedCreditOrDebit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(contract.expectedCreditOrDebit * contract.contracts * 100)}
                </span>
              </div>
            </div>
          </div>

          {/* P/L Calculator */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Profit/Loss Calculator
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Underlying Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentUnderlyingPrice}
                  onChange={(e) => setCurrentUnderlyingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Option Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentOptionPrice}
                  onChange={(e) => setCurrentOptionPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    If Sold Now
                  </h4>
                  <p className={`text-3xl font-bold ${getProfitLossColor(profitLoss.ifSoldNow)}`}>
                    {formatProfitLoss(profitLoss.ifSoldNow)}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    At Expiration
                  </h4>
                  <p className={`text-3xl font-bold ${getProfitLossColor(profitLoss.ifExercisedAtExpiration)}`}>
                    {formatProfitLoss(profitLoss.ifExercisedAtExpiration)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Days to Expiration</span>
                    <span className="font-bold text-gray-900">{profitLoss.daysToExpiration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Risk Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Risk Analysis
            </h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Time Decay Risk</h4>
                <p className="text-sm text-orange-700 mb-1">{breakdownAnalysis.timeDecay}</p>
                <p className="text-xs text-orange-600">
                  {profitLoss.daysToExpiration < 30 
                    ? "Theta decay will accelerate rapidly" 
                    : profitLoss.daysToExpiration < 60 
                    ? "Moderate time decay expected" 
                    : "Time decay is minimal for now"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Price Movement</h4>
                <p className="text-sm text-green-700 mb-1">
                  {breakdownAnalysis.deltaAnalysis.toFixed(1)}% from strike
                </p>
                <p className="text-xs text-green-600">
                  {Math.abs(breakdownAnalysis.deltaAnalysis) < 5 
                    ? "Very close to strike - high gamma risk" 
                    : Math.abs(breakdownAnalysis.deltaAnalysis) < 15 
                    ? "Moderate distance from strike" 
                    : "Far from strike - lower sensitivity"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-2">Success Probability</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${contract.chanceOfProfit}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-indigo-700">{contract.chanceOfProfit}%</span>
                </div>
                <p className="text-xs text-indigo-600">
                  {contract.chanceOfProfit > 70 
                    ? "High probability trade" 
                    : contract.chanceOfProfit > 50 
                    ? "Favorable odds" 
                    : "Lower probability - higher risk/reward"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Trading Notes</h4>
                <div className="space-y-2 text-xs text-yellow-700">
                  {profitLoss.daysToExpiration <= 7 && (
                    <p>⚠️ Consider closing - high time decay risk</p>
                  )}
                  {contract.chanceOfProfit < 30 && (
                    <p>📊 Low PoP - monitor for exit opportunity</p>
                  )}
                  {Math.abs(currentUnderlyingPrice - contract.breakeven) / contract.breakeven < 0.02 && (
                    <p>🎯 Near breakeven - critical price level</p>
                  )}
                  {contract.expectedCreditOrDebit > 0 && profitLoss.ifSoldNow > (contract.expectedCreditOrDebit * contract.contracts * 100 * 0.5) && (
                    <p>💰 Consider taking 50%+ profits</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Scenario Analysis</h3>
          <ScenarioAnalysis contract={contract} />
        </div>
      </div>
    </div>
  );
};

// Simple Contract Form (keeping it clean)
const ContractForm: React.FC<{
  onSave: () => void;
  onCancel: () => void;
  editingContract?: OptionContract | null;
}> = ({ onSave, onCancel, editingContract }) => {
  const { addContract, updateContract } = useContracts();
  const [formData, setFormData] = useState({
    buyOrSell: (editingContract?.buyOrSell || 'buy') as 'buy' | 'sell',
    optionType: (editingContract?.optionType || 'call') as 'call' | 'put',
    symbol: editingContract?.symbol || '',
    expirationDate: editingContract?.expirationDate || '',
    strikePrice: editingContract?.strikePrice || 0,
    breakeven: editingContract?.breakeven || 0,
    chanceOfProfit: editingContract?.chanceOfProfit || 0,
    percentChange: editingContract?.percentChange || 0,
    change: editingContract?.change || 0,
    bidPrice: editingContract?.bidPrice || 0,
    limitPrice: editingContract?.limitPrice || 0,
    contracts: editingContract?.contracts || 1,
    expectedCreditOrDebit: editingContract?.expectedCreditOrDebit || 0,
    notes: editingContract?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContract?.id) {
      // This is an actual edit of an existing contract
      updateContract({
        ...editingContract,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // This is either a new contract or a clone (no ID)
      addContract(formData);
    }
    onSave();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-adjust premium sign based on buy/sell action
      if (field === 'buyOrSell' || field === 'expectedCreditOrDebit') {
        const action = field === 'buyOrSell' ? value : prev.buyOrSell;
        const premium = field === 'expectedCreditOrDebit' ? parseFloat(value as string) || 0 : prev.expectedCreditOrDebit;
        
        if (action === 'buy' && premium > 0) {
          newData.expectedCreditOrDebit = -Math.abs(premium);
        } else if (action === 'sell' && premium < 0) {
          newData.expectedCreditOrDebit = Math.abs(premium);
        } else if (field === 'expectedCreditOrDebit') {
          newData.expectedCreditOrDebit = premium;
        }
      }

      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onCancel} variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {editingContract?.id ? 'Edit Contract' : editingContract ? 'Clone Contract' : 'New Contract'}
            </h2>
            <p className="text-gray-600">
              {editingContract?.id 
                ? 'Update your options position' 
                : editingContract 
                ? 'Create a copy of this contract' 
                : 'Add a new options position to track'
              }
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symbol (Optional)</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., AAPL, TSLA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={formData.buyOrSell}
                onChange={(e) => handleInputChange('buyOrSell', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Option Type</label>
              <select
                value={formData.optionType}
                onChange={(e) => handleInputChange('optionType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Strike Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.strikePrice}
                onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Breakeven Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.breakeven}
                onChange={(e) => handleInputChange('breakeven', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chance of Profit (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.chanceOfProfit}
                onChange={(e) => handleInputChange('chanceOfProfit', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bid Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.bidPrice}
                onChange={(e) => handleInputChange('bidPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Limit Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.limitPrice}
                onChange={(e) => handleInputChange('limitPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Contracts</label>
              <input
                type="number"
                min="1"
                value={formData.contracts}
                onChange={(e) => handleInputChange('contracts', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Per Contract 
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.buyOrSell === 'buy' ? 'Amount paid' : 'Amount received'})
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                value={Math.abs(formData.expectedCreditOrDebit)}
                onChange={(e) => handleInputChange('expectedCreditOrDebit', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter premium amount (auto-adjusts sign)"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Trading strategy, reasoning, etc."
            />
          </div>

          <div className="flex gap-4 mt-8">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
              <Button type="submit" className="flex-1">
                {editingContract?.id ? 'Update Contract' : 'Save Contract'}
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
type View = 'list' | 'form' | 'detail' | 'group' | 'docs';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<PortfolioGroup | null>(null);

  const handleViewContract = (contract: OptionContract) => {
    setSelectedContract(contract);
    setCurrentView('detail');
  };

  const handleNewContract = () => {
    setSelectedContract(null);
    setCurrentView('form');
  };

  const handleEditContract = (contract: OptionContract) => {
    setSelectedContract(contract);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedContract(null);
    setSelectedGroup(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'form':
        return <ContractForm 
          onSave={handleBackToList} 
          onCancel={handleBackToList} 
          editingContract={selectedContract}
        />;
      case 'detail':
        return selectedContract ? (
          <ContractDetail contract={selectedContract} onBack={handleBackToList} />
        ) : null;
      case 'group':
        return selectedGroup ? (
          <GroupDetailView group={selectedGroup} onBack={handleBackToList} />
        ) : null;
      case 'docs':
        return <OptionsGuide onBack={handleBackToList} />;
      default:
        return (
          <ContractList
            onViewContract={handleViewContract}
            onNewContract={handleNewContract}
            onEditContract={handleEditContract}
            onShowDocs={() => setCurrentView('docs')}
          />
        );
    }
  };

  return renderCurrentView();
}

// Root App
function App() {
  return (
    <ContractsProvider>
      <AppContent />
    </ContractsProvider>
  );
}

export default App;