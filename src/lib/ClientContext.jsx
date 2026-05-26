import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ClientContext = createContext();

export function ClientProvider({ children }) {
  const { user } = useAuth();
  const [currentClient, setCurrentClient] = useState(null);

  const { data: rawClients = [], isLoading } = useQuery({
    queryKey: ['adminClients'],
    queryFn: () => base44.entities.ClientAccount.list('-created_date', 100),
  });

  const clients = rawClients.filter(c => !c.allowed_users?.length || c.allowed_users.includes(user?.email));

  const isDemoClient = (client) => /demo|council|bunbury/i.test(client?.business_name || '');

  useEffect(() => {
    if (clients.length > 0 && !currentClient) {
      const saved = localStorage.getItem('assetstack_client_id');
      const found = saved ? clients.find(c => c.id === saved && !isDemoClient(c)) : null;
      const mainAccount = clients.find(c => !isDemoClient(c));
      setCurrentClient(found || mainAccount || clients[0]);
    }
  }, [clients, currentClient]);

  const setClient = (client) => {
    setCurrentClient(client);
    if (client) localStorage.setItem('assetstack_client_id', client.id);
  };

  return (
    <ClientContext.Provider value={{ currentClient, clients, setClient, isLoading }}>
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => useContext(ClientContext);