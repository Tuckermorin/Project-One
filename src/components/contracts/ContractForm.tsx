import React, { useState } from 'react';
import { useContracts } from '../../context/ContractsContext';
import { createEmptyContract } from '../../models/OptionContract';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface ContractFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ onSave, onCancel }) => {
  const { addContract } = useContracts();
  const [formData, setFormData] = useState(createEmptyContract());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContract(formData);
    onSave();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Option Contract</h2>
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Strike Price"
            type="number"
            step="0.01"
            value={formData.strikePrice}
            onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Expiration Date"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Save Contract
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;