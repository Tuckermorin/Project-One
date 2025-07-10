import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { OptionContract } from '../models/OptionContract';
import { useLocalStorage } from '../hooks/useLocalStorage';

type ContractsAction =
  | { type: 'ADD_CONTRACT'; payload: OptionContract }
  | { type: 'UPDATE_CONTRACT'; payload: OptionContract }
  | { type: 'DELETE_CONTRACT'; payload: string }
  | { type: 'LOAD_CONTRACTS'; payload: OptionContract[] };

interface ContractsState {
  contracts: OptionContract[];
}

interface ContractsContextType extends ContractsState {
  addContract: (contract: Omit<OptionContract, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContract: (contract: OptionContract) => void;
  deleteContract: (id: string) => void;
  cloneContract: (contract: OptionContract) => void;
}

const ContractsContext = createContext<ContractsContextType | undefined>(undefined);

const contractsReducer = (state: ContractsState, action: ContractsAction): ContractsState => {
  switch (action.type) {
    case 'LOAD_CONTRACTS':
      return { contracts: action.payload };
    case 'ADD_CONTRACT':
      return { contracts: [...state.contracts, action.payload] };
    case 'UPDATE_CONTRACT':
      return {
        contracts: state.contracts.map(contract =>
          contract.id === action.payload.id ? action.payload : contract
        ),
      };
    case 'DELETE_CONTRACT':
      return {
        contracts: state.contracts.filter(contract => contract.id !== action.payload),
      };
    default:
      return state;
  }
};

export const ContractsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contractsReducer, { contracts: [] });
  const [storedContracts, setStoredContracts] = useLocalStorage<OptionContract[]>('option-contracts', []);

useEffect(() => {
    dispatch({ type: 'LOAD_CONTRACTS', payload: storedContracts });
  }, []); // Remove storedContracts dependency to avoid infinite loop

  useEffect(() => {
    if (state.contracts.length > 0 || storedContracts.length > 0) {
      setStoredContracts(state.contracts);
    }
  }, [state.contracts]); // Remove setStoredContracts dependency

  const addContract = (contractData: Omit<OptionContract, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newContract: OptionContract = {
      ...contractData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_CONTRACT', payload: newContract });
  };

  const updateContract = (contract: OptionContract) => {
    const updatedContract = { ...contract, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CONTRACT', payload: updatedContract });
  };

  const deleteContract = (id: string) => {
    dispatch({ type: 'DELETE_CONTRACT', payload: id });
  };

  const cloneContract = (contract: OptionContract) => {
    const now = new Date().toISOString();
    const clonedContract: OptionContract = {
      ...contract,
      id: crypto.randomUUID(),
      symbol: contract.symbol ? `${contract.symbol} (Copy)` : 'Contract (Copy)',
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_CONTRACT', payload: clonedContract });
  };

  return (
    <ContractsContext.Provider
      value={{
        ...state,
        addContract,
        updateContract,
        deleteContract,
        cloneContract,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useContracts = () => {
  const context = useContext(ContractsContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractsProvider');
  }
  return context;
};