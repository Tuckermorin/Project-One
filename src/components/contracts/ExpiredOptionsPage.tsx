import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Target, History, Calendar, AlertTriangle, BookOpen } from 'lucide-react';
import type { OptionContract } from '../../models/OptionContract';
import { useContracts } from '../../context/ContractsContext';
import { formatProfitLoss, getProfitLossColor } from '../../utils/formatters';
import Button from '../common/Button';

interface ExpiredOptionsPageProps {
  onBack: () => void;
  onExpireContract: (contractId: string, finalPrice: number, analysis: OptionContract['analysis']) => void;
}

const ExpiredOptionsPage: React.FC<ExpiredOptionsPageProps> = ({ onBack, onExpireContract }) => {
  const { getActiveContracts, getExpiredContracts } = useContracts();
  const activeContracts = getActiveContracts();
  const expiredContracts = getExpiredContracts();
  
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [showExpireModal, setShowExpireModal] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [analysis, setAnalysis] = useState({
    reasonForOutcome: '',
    lessonsLearned: '',
    marketConditions: '',
    whatWentRight: '',
    whatWentWrong: ''
  });
  const isITM = selectedContract
    ? selectedContract.optionType === 'call'
      ? finalPrice > selectedContract.strikePrice
      : finalPrice < selectedContract.strikePrice
    : false;

  const expiringToday = activeContracts.filter(contract => {
    const today = new Date();
    const expiry = new Date(contract.expirationDate);
    return expiry.toDateString() === today.toDateString();
  });

  const handleExpireContract = () => {
    if (!selectedContract) return;
    
    const finalAnalysis = {
      wasProfit: (selectedContract.finalProfitLoss || 0) > 0,
      ...analysis
    };
    
    onExpireContract(selectedContract.id, finalPrice, finalAnalysis);
    setShowExpireModal(false);
    setSelectedContract(null);
  };

  const totalExpiredPL = expiredContracts.reduce((sum, contract) => sum + (contract.finalProfitLoss || 0), 0);
  const profitableCount = expiredContracts.filter(c => (c.finalProfitLoss || 0) > 0).length;
  const winRate = expiredContracts.length > 0 ? (profitableCount / expiredContracts.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Options History</h1>
            <p className="text-gray-600">Expired contracts and performance analysis</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expired P/L</p>
                <p className={`text-2xl font-bold ${totalExpiredPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatProfitLoss(totalExpiredPL)}
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
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">{winRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">{profitableCount} of {expiredContracts.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expired</p>
                <p className="text-2xl font-bold text-gray-900">{expiredContracts.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <History className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Today</p>
                <p className={`text-2xl font-bold ${expiringToday.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {expiringToday.length}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Today Section */}
        {expiringToday.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Expiring Today - Action Required
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expiringToday.map(contract => (
                <div key={contract.id} className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{contract.symbol} ${contract.strikePrice}</h4>
                      <p className="text-sm text-gray-600">{contract.optionType.toUpperCase()} • {contract.contracts} contracts</p>
                    </div>
                    <Button 
                      onClick={() => { setSelectedContract(contract); setShowExpireModal(true); }}
                      size="sm"
                      variant="secondary"
                    >
                      Close Out
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expired Contracts History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Expired Contracts</h3>
          
          {expiredContracts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">No expired contracts yet</h4>
              <p className="text-gray-500">Your completed trades will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expiredContracts.map(contract => (
                <div key={contract.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{contract.symbol} ${contract.strikePrice}</h4>
                      <p className="text-sm text-gray-600">
                        {contract.optionType.toUpperCase()} • {contract.contracts} contracts • 
                        Closed: {contract.closedDate ? new Date(contract.closedDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getProfitLossColor(contract.finalProfitLoss || 0)}`}>
                        {formatProfitLoss(contract.finalProfitLoss || 0)}
                      </p>
                      {contract.finalUnderlyingPrice && (
                        <p className="text-sm text-gray-500">Final: ${contract.finalUnderlyingPrice}</p>
                      )}
                    </div>
                  </div>
                  
                  {contract.analysis && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Outcome Reason:</p>
                          <p className="text-gray-600">{contract.analysis.reasonForOutcome}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Lessons Learned:</p>
                          <p className="text-gray-600">{contract.analysis.lessonsLearned}</p>
                        </div>
                        {contract.analysis.whatWentRight && (
                          <div>
                            <p className="font-medium text-gray-700">What Went Right:</p>
                            <p className="text-gray-600">{contract.analysis.whatWentRight}</p>
                          </div>
                        )}
                        {contract.analysis.whatWentWrong && (
                          <div>
                            <p className="font-medium text-gray-700">What Went Wrong:</p>
                            <p className="text-gray-600">{contract.analysis.whatWentWrong}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expire Contract Modal */}
        {showExpireModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 shadow-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Close Out Contract: {selectedContract.symbol} ${selectedContract.strikePrice}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Underlying Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter final stock price"
                  />
                  {finalPrice > 0 && (

                    <p className={`mt-2 text-sm font-medium ${isITM ? 'text-green-600' : 'text-red-600'}`}> 
                      {isITM ? 'In the Money' : 'Out of the Money'}
                    <p className="mt-1 text-sm font-medium">
                      {selectedContract.optionType === 'call'
                        ? finalPrice > selectedContract.strikePrice
                          ? 'In the money'
                          : 'Out of the money'
                        : finalPrice < selectedContract.strikePrice
                          ? 'In the money'
                          : 'Out of the money'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Outcome
                  </label>
                  <textarea
                    value={analysis.reasonForOutcome}
                    onChange={(e) => setAnalysis(prev => ({ ...prev, reasonForOutcome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Why did this trade succeed or fail?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lessons Learned
                  </label>
                  <textarea
                    value={analysis.lessonsLearned}
                    onChange={(e) => setAnalysis(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="What can you learn from this trade?"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What Went Right
                    </label>
                    <textarea
                      value={analysis.whatWentRight}
                      onChange={(e) => setAnalysis(prev => ({ ...prev, whatWentRight: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Positive aspects of the trade"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What Went Wrong
                    </label>
                    <textarea
                      value={analysis.whatWentWrong}
                      onChange={(e) => setAnalysis(prev => ({ ...prev, whatWentWrong: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Areas for improvement"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowExpireModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleExpireContract}
                  className="flex-1"
                  disabled={!finalPrice || !analysis.reasonForOutcome || !analysis.lessonsLearned}
                >
                  Close Contract
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiredOptionsPage;