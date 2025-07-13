import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import { usePortfolio } from '../../context/PortfolioContext';

// Header component allowing user to input cash balance
const PortfolioHeader: React.FC = () => {
  const { cash, setCash } = usePortfolio();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(cash.toString());
  }, [cash]);

  const handleBlur = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      setError('Cash balance cannot be negative');
      return;
    }
    setError('');
    setCash(num);
  };

  const lowCash = !error && parseFloat(value) >= 0 && parseFloat(value) < 1000;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Input
            label="Cash Balance"
            type="number"
            step="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={handleBlur}
            error={error}
          />
        </div>
        {lowCash && (
          <span className="text-sm text-orange-600 font-medium">Low cash</span>
        )}
      </div>
    </div>
  );
};

export default PortfolioHeader;
