const API_BASE_URL = 'http://localhost:5000/api';

export const contractsApi = {
    getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/contracts`);
    const contracts = await response.json();
    return contracts.map((c: any) => ({ 
        ...c, 
        id: c._id,
        expirationDate: new Date(c.expirationDate).toISOString().split('T')[0]
    }));
    },

  create: async (contractData: any) => {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractData),
    });
    const contract = await response.json();
    return { ...contract, id: contract._id };
  },

  update: async (id: string, contractData: any) => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractData),
    });
    const contract = await response.json();
    return { ...contract, id: contract._id };
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};