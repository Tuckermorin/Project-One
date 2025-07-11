import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { OptionContract } from '../models/OptionContract';
import { contractsApi } from '../services/api';

type ContractsAction =
  | { type: 'SET_CONTRACTS'; payload: OptionContract[] }
  | { type: 'ADD_CONTRACT'; payload: OptionContract }
  | { type: 'DELETE_CONTRACT'; payload: string }
  | { type: 'UPDATE_CONTRACT'; payload: OptionContract };

interface ContractsState {
  contracts: OptionContract[];
}

interface ContractsContextType extends ContractsState {
  addContract: (contract: Omit<OptionContract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContract: (contract: OptionContract) => Promise<void>;
  deleteContract: (id: string) => void;
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

  return (
    <ContractsContext.Provider value={{ ...state, addContract, updateContract, deleteContract }}>
      {children}
    </ContractsContext.Provider>
  );
};

export const useContracts = () => {
  const context = useContext(ContractsContext);
  if (!context) throw new Error('useContracts must be used within ContractsProvider');
  return context;
};