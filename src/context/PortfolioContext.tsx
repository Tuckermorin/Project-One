import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Holding, PortfolioState } from '../models/Portfolio';

interface PortfolioContextType extends PortfolioState {
  setCash: (amount: number) => void;
  addHolding: (holding: Omit<Holding, 'id'>) => void;
  updateHolding: (holding: Holding) => void;
  removeHolding: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cash, setCash] = useLocalStorage<number>('portfolioCash', 0);
  const [holdings, setHoldings] = useLocalStorage<Holding[]>('portfolioHoldings', []);

  const addHolding = (holding: Omit<Holding, 'id'>) => {
    setHoldings(prev => [...prev, { ...holding, id: crypto.randomUUID() }]);
  };

  const updateHolding = (holding: Holding) => {
    setHoldings(prev => prev.map(h => (h.id === holding.id ? holding : h)));
  };

  const removeHolding = (id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
  };

  return (
    <PortfolioContext.Provider value={{ cash, holdings, setCash, addHolding, updateHolding, removeHolding }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within PortfolioProvider');
  return context;
};
