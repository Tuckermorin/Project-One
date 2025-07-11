import React, { useState } from 'react';
import type { OptionContract } from '../../models/OptionContract';
import { useContracts } from '../../context/ContractsContext';
import { calculateProfitLoss, formatProfitLoss } from '../../utils/profitLossCalculator';
import Button from '../common/Button';

interface CloseContractModalProps {
  contract: OptionContract;
  onDone: () => void;
  onCancel: () => void;
}

const CloseContractModal: React.FC<CloseContractModalProps> = ({ contract, onDone, onCancel }) => {
  const { closeContract } = useContracts();
  const [optionPrice, setOptionPrice] = useState<number>(contract.bidPrice);
  const [underlyingPrice, setUnderlyingPrice] = useState<number>(contract.strikePrice);

  const result = calculateProfitLoss(contract, underlyingPrice, optionPrice);

  const itm = contract.optionType === 'call'
    ? underlyingPrice > contract.strikePrice
    : underlyingPrice < contract.strikePrice;

  const handleClose = async () => {
    await closeContract(contract.id, optionPrice, underlyingPrice);
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Close Contract</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Option Price</label>
            <input
              type="number"
              step="0.01"
              value={optionPrice}
              onChange={(e) => setOptionPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Underlying Price at Close</label>
            <input
              type="number"
              step="0.01"
              value={underlyingPrice}
              onChange={(e) => setUnderlyingPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className={`p-2 rounded text-sm font-medium ${itm ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}> 
            {itm ? 'In the Money' : 'Out of the Money'}
          </div>
          <div className="text-sm">
            Final P/L: <span className={result.ifSoldNow >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{formatProfitLoss(result.ifSoldNow)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={handleClose} className="flex-1">Close Position</Button>
        </div>
      </div>
    </div>
  );
};

export default CloseContractModal;
