import React, { useState } from 'react';
import { useContracts } from '../../context/ContractsContext';
import { createEmptyContract } from '../../models/OptionContract';
import type { OptionContract } from '../../models/OptionContract';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { ArrowLeft } from 'lucide-react';

interface ContractFormProps {
  onSave: () => void;
  onCancel: () => void;
  editingContract?: OptionContract | null;
}

const ContractForm: React.FC<ContractFormProps> = ({ onSave, onCancel, editingContract }) => {
  const { addContract, updateContract } = useContracts();
  
  // Initialize form data based on whether we're editing an existing contract
  const [formData, setFormData] = useState(() => {
    if (editingContract && editingContract.id) {
      // Editing existing contract - use all its data
      return {
        buyOrSell: editingContract.buyOrSell,
        optionType: editingContract.optionType,
        symbol: editingContract.symbol || '',
        expirationDate: editingContract.expirationDate,
        strikePrice: editingContract.strikePrice,
        breakeven: editingContract.breakeven,
        chanceOfProfit: editingContract.chanceOfProfit,
        percentChange: editingContract.percentChange,
        change: editingContract.change,
        bidPrice: editingContract.bidPrice,
        limitPrice: editingContract.limitPrice,
        contracts: editingContract.contracts,
        expectedCreditOrDebit: editingContract.expectedCreditOrDebit,
        notes: editingContract.notes || '',
      };
    } else if (editingContract) {
      // Cloning contract (has data but no ID) - use its data but create new
      return {
        buyOrSell: editingContract.buyOrSell,
        optionType: editingContract.optionType,
        symbol: editingContract.symbol ? `${editingContract.symbol} (Copy)` : '',
        expirationDate: editingContract.expirationDate,
        strikePrice: editingContract.strikePrice,
        breakeven: editingContract.breakeven,
        chanceOfProfit: editingContract.chanceOfProfit,
        percentChange: editingContract.percentChange,
        change: editingContract.change,
        bidPrice: editingContract.bidPrice,
        limitPrice: editingContract.limitPrice,
        contracts: editingContract.contracts,
        expectedCreditOrDebit: editingContract.expectedCreditOrDebit,
        notes: editingContract.notes || '',
      };
    } else {
      // New contract - use empty template
      return createEmptyContract();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContract?.id) {
      // Update existing contract
      updateContract({
        ...editingContract,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Add new contract (either completely new or cloned)
      addContract(formData);
    }
    
    onSave();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const isEditing = editingContract?.id;
  const isCloning = editingContract && !editingContract.id;

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
              {isEditing ? 'Edit Contract' : isCloning ? 'Clone Contract' : 'New Contract'}
            </h2>
            <p className="text-gray-600">
              {isEditing 
                ? 'Update your options position' 
                : isCloning 
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

            <Select
              label="Action"
              value={formData.buyOrSell}
              onChange={(value) => handleInputChange('buyOrSell', value)}
              options={[
                { value: 'buy', label: 'Buy' },
                { value: 'sell', label: 'Sell' },
              ]}
            />

            <Select
              label="Option Type"
              value={formData.optionType}
              onChange={(value) => handleInputChange('optionType', value)}
              options={[
                { value: 'call', label: 'Call' },
                { value: 'put', label: 'Put' },
              ]}
            />

            <Input
              label="Expiration Date"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              required
            />

            <Input
              label="Strike Price"
              type="number"
              step="0.01"
              value={formData.strikePrice}
              onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value) || 0)}
              required
            />

            <Input
              label="Breakeven Price"
              type="number"
              step="0.01"
              value={formData.breakeven}
              onChange={(e) => handleInputChange('breakeven', parseFloat(e.target.value) || 0)}
            />

            <Input
              label="Chance of Profit (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.chanceOfProfit}
              onChange={(e) => handleInputChange('chanceOfProfit', parseFloat(e.target.value) || 0)}
            />

            <Input
              label="Bid Price"
              type="number"
              step="0.01"
              value={formData.bidPrice}
              onChange={(e) => handleInputChange('bidPrice', parseFloat(e.target.value) || 0)}
            />

            <Input
              label="Limit Price"
              type="number"
              step="0.01"
              value={formData.limitPrice}
              onChange={(e) => handleInputChange('limitPrice', parseFloat(e.target.value) || 0)}
            />

            <Input
              label="Number of Contracts"
              type="number"
              min="1"
              value={formData.contracts}
              onChange={(e) => handleInputChange('contracts', parseInt(e.target.value) || 1)}
              required
            />

            <Input
              label="Expected Credit/Debit"
              type="number"
              step="0.01"
              value={formData.expectedCreditOrDebit}
              onChange={(e) => handleInputChange('expectedCreditOrDebit', parseFloat(e.target.value) || 0)}
              placeholder="Positive for credit, negative for debit"
            />
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
              {isEditing ? 'Update Contract' : 'Save Contract'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractForm;