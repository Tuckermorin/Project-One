import React from 'react';
import { useContracts } from '../../context/ContractsContext';
import ContractCard from './ContractCard';
import Button from '../common/Button';
import type { OptionContract } from '../../models/OptionContract';

interface ContractListProps {
  onViewContract: (contract: OptionContract) => void;
  onNewContract: () => void;
}

const ContractList: React.FC<ContractListProps> = ({ onViewContract, onNewContract }) => {
  const { contracts } = useContracts();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Option Contracts</h1>
        <Button onClick={onNewContract} className="bg-blue-600 hover:bg-blue-700">
          + New Contract
        </Button>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No contracts yet</p>
          <p className="text-gray-400 mt-2">Create your first option contract to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contracts.map(contract => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onClick={() => onViewContract(contract)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractList;