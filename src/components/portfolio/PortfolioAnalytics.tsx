import React from 'react';
import { DollarSign, BarChart3, Target, Calendar, Activity, AlertTriangle } from 'lucide-react';
import type { OptionContract } from '../../models/OptionContract';
import { formatProfitLoss } from '../../utils/formatters';

interface PortfolioAnalyticsProps {
  contracts: OptionContract[];
}

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ contracts }) => {
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

export default PortfolioAnalytics;