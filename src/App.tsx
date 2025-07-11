import { useState } from 'react';
import type { OptionContract } from './models/OptionContract';
import { ContractsProvider, useContracts } from './context/ContractsContext';
import ContractList from './components/contracts/ContractList';
import ContractDetail from './components/contracts/ContractDetail';
import ContractForm from './components/contracts/ContractForm';
import ExpiredOptionsPage from './components/contracts/ExpiredOptionsPage';
import OptionsGuide from './components/docs/OptionsGuide';

// Main App Component
type View = 'list' | 'form' | 'detail' | 'docs' | 'expired';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const { expireContract } = useContracts();

  const handleViewContract = (contract: OptionContract) => {
    setSelectedContract(contract);
    setCurrentView('detail');
  };

  const handleNewContract = () => {
    setSelectedContract(null);
    setCurrentView('form');
  };

  const handleEditContract = (contract: OptionContract) => {
    setSelectedContract(contract);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedContract(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'form':
        return <ContractForm 
          onSave={handleBackToList} 
          onCancel={handleBackToList} 
          editingContract={selectedContract}
        />;
      case 'detail':
        return selectedContract ? (
          <ContractDetail contract={selectedContract} onBack={handleBackToList} />
        ) : null;
      case 'docs':
        return <OptionsGuide onBack={handleBackToList} />;
      case 'expired':
        return <ExpiredOptionsPage 
          onBack={handleBackToList} 
          onExpireContract={expireContract} 
        />;
      default:
        return (
          <ContractList
            onViewContract={handleViewContract}
            onNewContract={handleNewContract}
            onEditContract={handleEditContract}
            onShowDocs={() => setCurrentView('docs')}
            onShowExpired={() => setCurrentView('expired')}
          />
        );
    }
  };

  return renderCurrentView();
}

// Root App
function App() {
  return (
    <ContractsProvider>
      <AppContent />
    </ContractsProvider>
  );
}

export default App;