import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { OptionContract } from '../models/OptionContract';
import { contractsApi } from '../services/api';
import { calculateProfitLoss } from '../utils/profitLossCalculator';

type ContractsAction =
  | { type: 'SET_CONTRACTS'; payload: OptionContract[] }
  | { type: 'ADD_CONTRACT'; payload: OptionContract }
  | { type: 'DELETE_CONTRACT'; payload: string }
  | { type: 'UPDATE_CONTRACT'; payload: OptionContract }
  | { type: 'EXPIRE_CONTRACT'; payload: { id: string; finalData: Partial<OptionContract> } }
  | { type: 'CLOSE_CONTRACT'; payload: { id: string; finalData: Partial<OptionContract> } };

interface ContractsState {
  contracts: OptionContract[];
}

interface ContractsContextType extends ContractsState {
  addContract: (contract: Omit<OptionContract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContract: (contract: OptionContract) => Promise<void>;
  deleteContract: (id: string) => void;
  expireContract: (id: string, finalUnderlyingPrice: number, analysis?: OptionContract['analysis']) => Promise<void>;
  closeContract: (id: string, finalUnderlyingPrice: number, finalOptionPrice: number) => Promise<void>;
  getActiveContracts: () => OptionContract[];
  getExpiredContracts: () => OptionContract[];
  checkAndUpdateExpiredContracts: () => void;
}

const ContractsContext = createContext<ContractsContextType | undefined>(undefined);

const contractsReducer = (state: ContractsState, action: ContractsAction): ContractsState => {
  switch (action.type) {
    case 'SET_CONTRACTS':
      return { contracts: action.payload };
    case 'ADD_CONTRACT':
      return { contracts: [action.payload, ...state.contracts] };
    case 'DELETE_CONTRACT':
      return { contracts: state.contracts.filter(c => c.id !== action.payload) };
    case 'UPDATE_CONTRACT':
      return { 
        contracts: state.contracts.map(c => 
          c.id === action.payload.id ? action.payload : c
        ) 
      };
    case 'EXPIRE_CONTRACT':
      return {
        contracts: state.contracts.map(c =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.finalData, status: 'expired' as const }
            : c
        )
      };
    case 'CLOSE_CONTRACT':
      return {
        contracts: state.contracts.map(c =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.finalData, status: 'closed' as const }
            : c
        )
      };
    default:
      return state;
  }
};

export const ContractsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contractsReducer, { contracts: [] });

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const contracts = await contractsApi.getAll();
      dispatch({ type: 'SET_CONTRACTS', payload: contracts });
    } catch (error) {
      console.error('Failed to load contracts:', error);
    }
  };

  const addContract = async (contractData: Omit<OptionContract, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newContract = await contractsApi.create(contractData);
      dispatch({ type: 'ADD_CONTRACT', payload: newContract });
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  const deleteContract = async (id: string) => {
    try {
      await contractsApi.delete(id);
      dispatch({ type: 'DELETE_CONTRACT', payload: id });
    } catch (error) {
      console.error('Failed to delete contract:', error);
    }
  };

  const updateContract = async (contract: OptionContract) => {
    try {
      const updatedContract = await contractsApi.update(contract.id, contract);
      dispatch({ type: 'UPDATE_CONTRACT', payload: updatedContract });
    } catch (error) {
      console.error('Failed to update contract:', error);
    }
  };

  const expireContract = async (id: string, finalUnderlyingPrice: number, analysis?: OptionContract['analysis']) => {
    try {
      const contract = state.contracts.find(c => c.id === id);
      if (!contract) return;

      // Calculate final P/L
      const finalPL = contract.optionType === 'call'
        ? Math.max(0, finalUnderlyingPrice - contract.strikePrice) * contract.contracts * 100
        : Math.max(0, contract.strikePrice - finalUnderlyingPrice) * contract.contracts * 100;

      const finalProfitLoss = contract.buyOrSell === 'buy' 
        ? finalPL + (contract.expectedCreditOrDebit * contract.contracts * 100)
        : (contract.expectedCreditOrDebit * contract.contracts * 100) - finalPL;

      const finalData = {
        status: 'expired' as const,
        finalUnderlyingPrice,
        finalProfitLoss,
        closedDate: new Date().toISOString(),
        analysis,
        updatedAt: new Date().toISOString()
      };

      await contractsApi.update(id, { ...contract, ...finalData });
      dispatch({ type: 'EXPIRE_CONTRACT', payload: { id, finalData } });
    } catch (error) {
      console.error('Failed to expire contract:', error);
    }
  };

  const closeContract = async (id: string, finalUnderlyingPrice: number, finalOptionPrice: number) => {
    try {
      const contract = state.contracts.find(c => c.id === id);
      if (!contract) return;

      const pl = calculateProfitLoss(contract, finalUnderlyingPrice, finalOptionPrice);
      const finalData = {
        status: 'closed' as const,
        finalUnderlyingPrice,
        finalProfitLoss: pl.ifSoldNow,
        closedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await contractsApi.update(id, { ...contract, ...finalData });
      dispatch({ type: 'CLOSE_CONTRACT', payload: { id, finalData } });
    } catch (error) {
      console.error('Failed to close contract:', error);
    }
  };

  const getActiveContracts = () => state.contracts.filter(c => c.status !== 'expired' && c.status !== 'closed');
  
  const getExpiredContracts = () => state.contracts.filter(c => c.status === 'expired' || c.status === 'closed');

  const checkAndUpdateExpiredContracts = () => {
    const today = new Date();
    const expired = state.contracts.filter(contract => {
      const expiry = new Date(contract.expirationDate);
      return expiry < today && contract.status !== 'expired' && contract.status !== 'closed';
    });
    
    expired.forEach(contract => {
      const finalData = {
        status: 'expired' as const,
        closedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: 'EXPIRE_CONTRACT', payload: { id: contract.id, finalData } });
    });
  };

  // Check for expired contracts on load and periodically
  useEffect(() => {
    checkAndUpdateExpiredContracts();
    const interval = setInterval(checkAndUpdateExpiredContracts, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(interval);
  }, []);

  return (
    <ContractsContext.Provider value={{ 
      ...state, 
      addContract, 
      updateContract, 
      deleteContract,
      expireContract,
      closeContract,
      getActiveContracts,
      getExpiredContracts,
      checkAndUpdateExpiredContracts
    }}>
      {children}
    </ContractsContext.Provider>
  );
};

export const useContracts = () => {
  const context = useContext(ContractsContext);
  if (!context) throw new Error('useContracts must be used within ContractsProvider');
  return context;
};