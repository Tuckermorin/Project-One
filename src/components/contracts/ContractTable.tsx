import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { OptionContract } from '../../models/OptionContract';
import { formatCurrency, formatProfitLoss, getProfitLossColor } from '../../utils/formatters';
import { calculateProfitLoss } from '../../utils/profitLossCalculator';
import Button from '../common/Button';

interface ContractTableProps {
  contracts: OptionContract[];
  onViewContract: (contract: OptionContract) => void;
}

type SortKey = 'symbol' | 'expirationDate' | 'profitLoss' | 'strikePrice' | 'chanceOfProfit';

const ContractTable: React.FC<ContractTableProps> = ({ contracts, onViewContract }) => {
  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plMin, setPlMin] = useState('');
  const [plMax, setPlMax] = useState('');
  const [optionType, setOptionType] = useState('');

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (symbolFilter && !(c.symbol || '').toLowerCase().includes(symbolFilter.toLowerCase())) return false;
      const expiry = new Date(c.expirationDate).getTime();
      if (startDate && expiry < new Date(startDate).getTime()) return false;
      if (endDate && expiry > new Date(endDate).getTime()) return false;
      const plValue = c.expectedCreditOrDebit * c.contracts * 100;
      if (plMin && plValue < parseFloat(plMin)) return false;
      if (plMax && plValue > parseFloat(plMax)) return false;
      if (optionType && c.optionType !== optionType) return false;
      return true;
    });
  }, [contracts, symbolFilter, startDate, endDate, plMin, plMax, optionType]);

  const sortedContracts = useMemo(() => {
    const sorted = [...filteredContracts];
    sorted.sort((a, b) => {
      let aVal: number | string = '';
      let bVal: number | string = '';
      switch (sortKey) {
        case 'symbol':
          aVal = a.symbol || '';
          bVal = b.symbol || '';
          break;
        case 'expirationDate':
          aVal = new Date(a.expirationDate).getTime();
          bVal = new Date(b.expirationDate).getTime();
          break;
        case 'profitLoss':
          aVal = a.expectedCreditOrDebit * a.contracts * 100;
          bVal = b.expectedCreditOrDebit * b.contracts * 100;
          break;
        case 'strikePrice':
          aVal = a.strikePrice;
          bVal = b.strikePrice;
          break;
        case 'chanceOfProfit':
          aVal = a.chanceOfProfit;
          bVal = b.chanceOfProfit;
          break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredContracts, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {/* Filter Controls */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
        <input
          type="text"
          placeholder="Symbol"
          value={symbolFilter}
          onChange={e => setSymbolFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Min P/L"
          value={plMin}
          onChange={e => setPlMin(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Max P/L"
          value={plMax}
          onChange={e => setPlMax(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={optionType}
          onChange={e => setOptionType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Types</option>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => toggleSort('symbol')}>
                Underlying {sortKey === 'symbol' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => toggleSort('expirationDate')}>
                Expiry {sortKey === 'expirationDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => toggleSort('profitLoss')}>
                P/L {sortKey === 'profitLoss' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => toggleSort('strikePrice')}>
                Strike {sortKey === 'strikePrice' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => toggleSort('chanceOfProfit')}>
                Chance % {sortKey === 'chanceOfProfit' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3 text-left font-semibold">DTE</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedContracts.map(contract => {
              const plValue = contract.expectedCreditOrDebit * contract.contracts * 100;
              const { daysToExpiration } = calculateProfitLoss(contract, contract.strikePrice, contract.bidPrice);
              return (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{contract.symbol || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(contract.expirationDate).toLocaleDateString()}</td>
                  <td className={`px-4 py-2 whitespace-nowrap font-bold ${getProfitLossColor(plValue)}`}>{formatProfitLoss(plValue)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(contract.strikePrice)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{contract.chanceOfProfit}%</td>
                  <td className="px-4 py-2 whitespace-nowrap">{daysToExpiration}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <Button onClick={() => onViewContract(contract)} variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
            {sortedContracts.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No contracts match the filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractTable;
