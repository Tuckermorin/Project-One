import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Holding } from '../../models/Portfolio';

interface HoldingsManagerProps {
  open: boolean;
  onClose: () => void;
}

// Modal form for adding and editing underlying holdings
const HoldingsManager: React.FC<HoldingsManagerProps> = ({ open, onClose }) => {
  const { holdings, addHolding, updateHolding, removeHolding } = usePortfolio();
  const [editing, setEditing] = useState<Holding | null>(null);
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const resetForm = () => {
    setEditing(null);
    setSymbol('');
    setShares('');
    setPrice('');
    setError('');
  };

  const handleSubmit = () => {
    const qty = parseFloat(shares);
    const pr = parseFloat(price);
    if (!symbol || qty <= 0 || pr <= 0 || isNaN(qty) || isNaN(pr)) {
      setError('Enter valid symbol, shares and price');
      return;
    }
    if (editing) {
      updateHolding({ ...editing, symbol, shares: qty, price: pr });
    } else {
      addHolding({ symbol, shares: qty, price: pr });
    }
    resetForm();
  };

  const handleEdit = (h: Holding) => {
    setEditing(h);
    setSymbol(h.symbol);
    setShares(h.shares.toString());
    setPrice(h.price.toString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Holdings</h3>
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {holdings.map(h => (
            <div key={h.id} className="flex items-center justify-between border-b border-gray-200 pb-1">
              <span className="font-medium">{h.symbol}: {h.shares} @ ${h.price}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(h)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => removeHolding(h.id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <Input label="Symbol" value={symbol} onChange={e => setSymbol(e.target.value)} className="mb-0" />
          <Input label="Shares" type="number" value={shares} onChange={e => setShares(e.target.value)} className="mb-0" />
          <Input label="Price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="mb-0" />
        </div>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => { resetForm(); onClose(); }} className="flex-1 md:flex-none">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1 md:flex-none">{editing ? 'Update' : 'Add'}</Button>
        </div>
      </div>
    </div>
  );
};

export default HoldingsManager;
